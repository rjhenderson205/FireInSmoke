# Security Policy

## Supported Versions
The project is pre-launch; security updates are applied to the `main` branch only.

## Reporting a Vulnerability
Email: Fire_n_smoke_bbq@outlook.com
Subject: SECURITY ISSUE: <short summary>

Please include:
- Affected endpoint or file
- Steps to reproduce (curl / payloads)
- Expected vs actual behavior
- Impact assessment (data exposure, DoS potential, etc.)

We aim to acknowledge within 5 business days pre-launch.

## Scope
In scope:
- `server/` express API endpoints (`/api/*`)
- Public static assets
- Service worker caching behavior

Out of scope (for now):
- Square hosted payment pages (covered by Square)
- Third-party CDN content

## Disclosure
Please practice coordinated disclosure. Do not publish exploit details until a fix is merged.

## Hardening Roadmap
- Content Security Policy refinement
- Webhook signature validation (payment completion)
- Rate limit tuning & anomaly logging
- Automated dependency vulnerability scanning
