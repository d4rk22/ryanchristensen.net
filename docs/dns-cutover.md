# ryanchristensen.net DNS cutover plan

Status: prepared, not approved, not executed

Recorded: 2026-07-24

Current phase: target build and GitHub Pages rehearsal

## Scope and safety boundary

This plan covers the eventual move of `ryanchristensen.net` and
`www.ryanchristensen.net` to the GitHub Pages site published from
`d4rk22/ryanchristensen.net`.

Affected systems:

- the Cloudflare-managed `ryanchristensen.net` DNS zone;
- the existing endpoint at `162.210.6.27`;
- the GitHub Pages custom-domain and HTTPS settings.

No DNS mutation or rollback is authorized by this document. The cutover and any
rollback each require explicit approval in the conversation where they run.

## Read-only baseline

Observed on 2026-07-24:

```text
ryanchristensen.net.      300 IN A     162.210.6.27
www.ryanchristensen.net.  300 IN CNAME ryanchristensen.net.
```

- Authoritative nameservers: `cass.ns.cloudflare.com` and
  `zeus.ns.cloudflare.com`.
- No apex AAAA record was returned.
- No GitHub Pages domain-verification TXT record was returned.
- HTTPS requests to both the apex and `www` failed during TLS negotiation.

## Preconditions

1. The local production build and Pagefind index pass.
2. The deployment workflow on `main` completes successfully.
3. GitHub Pages is configured for workflow builds with the custom domain
   `ryanchristensen.net`.
4. Preferably, the domain is verified for the `d4rk22` GitHub account with
   GitHub's generated TXT record before traffic moves.
5. The exact Cloudflare records and proxy mode are reviewed immediately before
   approval.

## Proposed cutover

Use DNS-only mode initially so GitHub can issue and validate its certificate.

1. Replace the current apex A record `162.210.6.27` with all four GitHub Pages
   A records:

   ```text
   @  A  185.199.108.153
   @  A  185.199.109.153
   @  A  185.199.110.153
   @  A  185.199.111.153
   ```

2. Add GitHub Pages IPv6 support:

   ```text
   @  AAAA  2606:50c0:8000::153
   @  AAAA  2606:50c0:8001::153
   @  AAAA  2606:50c0:8002::153
   @  AAAA  2606:50c0:8003::153
   ```

3. Replace the current `www` CNAME target with the GitHub Pages default
   domain:

   ```text
   www  CNAME  d4rk22.github.io
   ```

4. Once GitHub reports a valid certificate, enable HTTPS enforcement in the
   repository's Pages settings.

Expected impact: DNS answers may vary while caches expire. GitHub notes that
full propagation and certificate availability can take up to 24 hours.

## Validation

```bash
dig +short ryanchristensen.net A
dig +short ryanchristensen.net AAAA
dig +short www.ryanchristensen.net CNAME
curl -fsSIL https://ryanchristensen.net
curl -fsSIL https://www.ryanchristensen.net
gh api repos/d4rk22/ryanchristensen.net/pages
```

Acceptance criteria:

- apex A and AAAA answers contain only the documented GitHub Pages values;
- `www` points directly to `d4rk22.github.io`;
- both HTTPS URLs return successfully and one canonicalizes to the other;
- the GitHub Pages API reports `status: built`, the expected custom domain,
  and HTTPS enforcement;
- the home page, one post, RSS feed, sitemap, 404 page, and Pagefind search all
  work from the public domain.

## Rollback plan

Rollback trigger: after DNS propagation, the GitHub Pages endpoint remains
unavailable or serves materially incorrect content and a forward fix cannot be
completed within the agreed cutover window.

Exact rollback records:

```text
@    A      162.210.6.27
www  CNAME  ryanchristensen.net
```

Remove all four GitHub Pages A records and all four GitHub Pages AAAA records,
restore the two records above with TTL 300, and leave the GitHub deployment
artifact intact for diagnosis.

Expected rollback impact: DNS caches may continue to send some clients to
GitHub Pages until the prior TTL expires. The pre-cutover HTTPS baseline was
already failing, so rollback restores the recorded endpoint but does not
guarantee a working TLS service.

Rollback validation:

```bash
dig +short ryanchristensen.net A
dig +short ryanchristensen.net AAAA
dig +short www.ryanchristensen.net CNAME
curl -sSIL --max-time 15 https://ryanchristensen.net
```

Do not execute this rollback without separate explicit approval.
