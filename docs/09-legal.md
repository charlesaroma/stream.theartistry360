# 09 — Legal pages

**Rule:** legal text lives in `src/pages/10.legal/content/` as plain data (paragraphs, lists, tables), rendered by `legal.jsx` at `/legal/<slug>`. No HTML in the text.

| Page | URL | Linked from |
|---|---|---|
| Terms of Use | `/legal/terms` (`/terms`) | Footer, sign-up, checkout (plans and pay-per-view) |
| Privacy Policy | `/legal/privacy` (`/privacy`) | Footer, sign-up. **Shared with theartistry360.com/privacy: keep `content/privacy.js` identical in both repos** |
| Refunds & Cancellation | `/legal/refunds` | Footer, checkout |
| Community Guidelines | `/legal/community` | Footer, comment box |
| Cookies & Ads | `/legal/cookies` | Footer, Privacy Policy |
| Copyright | `/legal/copyright` | Footer |

`content/company.js` holds the company name, contacts, the "last updated" date and `LEGAL_DRAFT`. While `LEGAL_DRAFT` is true every page says it is a draft and not yet in force.

## Before launch: confirm with the Client and a Ugandan lawyer

1. **Company details:** registered name ("Thee Artistry360 (U) SMC Ltd"), registered address, and a dedicated privacy email (the drafts use theartistry360@gmail.com and +256 773 897 080).
2. **PDPO registration:** register with the Personal Data Protection Office as a data controller/processor, as the Data Protection and Privacy Regulations, 2021 require, and name who handles privacy requests (a data protection officer if needed).
3. **Age policy:** accounts and payments 18+; under-18s watch through a parent's account (the Act needs a parent's consent for children's data). Confirm this suits the voting campaigns and academy students too.
4. **Numbers the drafts commit to:** refund request window (14 days), reply time (3 working days), refund time (7 working days), renewal reminder (3 days), price-change notice (30 days), report review (2 working days), privacy request reply (30 days). Change any the team can't meet.
5. **Retention periods:** booking requests 12 months, security logs 90 days, backups 30 days; payment records per tax law.
6. **Processors:** PesaPal, Google (sign-in, Ad Manager), the video host (Cloudflare Stream, Mux or Bunny), Netlify, and the email/WhatsApp providers, each with a data processing agreement, plus the countries they store data in.
7. Then set `LEGAL_DRAFT = false` and the date in `content/company.js` (in both repos).
