# HandballBridge · working preview

A clickable preview of the completed HandballBridge platform, built on the content of the current hb-talents.com concept: same main image, same homepage texts, same questionnaire fields and the same eight language options.

Live: https://ricardojose000.github.io/handballbridge-preview/

## Two offers, one preview

Use the switch in the bar at the bottom of the screen.

| | Option A · 600 EUR | Option B · 950 EUR |
|---|---|---|
| Full specification (sections 3 to 12) | yes | yes |
| Mobile and tablet version | desktop layout only | yes |
| Talent camps and events | – | yes |
| Announcements by email | – | yes |
| Yearly profile check | – | yes |
| Visual dashboard, country map, monthly report | – | yes |
| Visitor statistics (no cookies) | – | yes |
| Two-step login and new-device alerts for parents | – | yes |
| Support after launch | 14 days | 60 days |

Features that belong only to Option B carry a small gold **B** tag.

Direct links: `?plan=a` and `?plan=b`.

## Demo accounts

| Role | Login | Password |
|---|---|---|
| Parent | `amra.hodzic` | `Demo-Parent-2026` |
| Adult player | `ema.kovac` | `Demo-Player-2026` |
| Administrator | `admin@hb-talents.com` | `HB-Admin-2026!` (+ code from the demo inbox) |

Every email the platform sends (codes, confirmations with the consent PDF, invitations) appears in the **Demo inbox**.

## About this preview

- Static files only, so it can be shown on GitHub Pages. All data is fictional and stays in the browser (localStorage).
- In the real platform the same rules run on the server: PHP 8 and MySQL on the existing Hetzner hosting, mail through noreply@hb-talents.com with SPF, DKIM and DMARC.
- Translations of new texts are drafts by the developer and should be checked by native speakers. Montenegrin and Kosovo Albanian are marked "needs review" in the admin translation editor.
- Legal texts (privacy, terms, consent wording) are placeholders until the project owner provides the approved versions.

## Credits

- Main image, flags, logo and homepage texts: from the current hb-talents.com concept (project owner).
- Noto Sans (SIL Open Font License, `assets/fonts/OFL.txt`) for the consent PDFs.
- GSAP and jsPDF from cdnjs.
