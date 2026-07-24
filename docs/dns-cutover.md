# ryanchristensen.net DNS cutover plan

Status: completed and validated

Recorded: 2026-07-24

Current phase: production cutover complete

## Scope and safety boundary

This plan covers the move of `ryanchristensen.net` and
`www.ryanchristensen.net` to the GitHub Pages site published from
`d4rk22/ryanchristensen.net`.

Affected systems:

- the Cloudflare-managed `ryanchristensen.net` DNS zone;
- the existing endpoint at `162.210.6.27`;
- the GitHub Pages custom-domain and HTTPS settings.

This document does not itself authorize a live mutation. The production
cutover was explicitly approved and executed on 2026-07-24. Rollback remains
unauthorized and still requires separate explicit approval in the conversation
where it would run.

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
- the deployment workflow succeeds, and the GitHub Pages API reports the
  expected custom domain, an approved certificate, and HTTPS enforcement;
- the home page, one post, RSS feed, sitemap, 404 page, and Pagefind search all
  work from the public domain.

## Execution record

Executed and validated on 2026-07-24 after explicit cutover approval.

- Deployment source: commit `6a8f9ec` on `main`.
- GitHub Actions deployment: run `30071650844`, successful.
- Cloudflare authoritative nameservers `cass.ns.cloudflare.com` and
  `zeus.ns.cloudflare.com` each returned only the four planned apex A records,
  four planned apex AAAA records, and `www CNAME d4rk22.github.io` with TTL 300.
- Cloudflare recursive DNS (`1.1.1.1`) and the local resolver returned the same
  record set.
- All nine website records are DNS-only. Unrelated DNS records were left
  unchanged, including the Microsoft 365 records, the `docker` record, and the
  existing SPF record that references `162.210.6.27`.
- The optional GitHub account-level domain-verification TXT record was not
  added and remains a separate hardening follow-up.
- GitHub issued an approved certificate for `ryanchristensen.net` and
  `www.ryanchristensen.net`, expiring 2026-10-22.
- GitHub Pages reports `https_enforced: true` and
  `html_url: https://ryanchristensen.net/`.
- HTTPS returned 200 for the home page, the MDX post, RSS, sitemap, search page,
  and Pagefind bundle. The custom missing path returned the expected 404.
- `www` canonicalized to the HTTPS apex, and a live Pagefind query returned the
  expected post and section result.
- No rollback action was executed.

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
