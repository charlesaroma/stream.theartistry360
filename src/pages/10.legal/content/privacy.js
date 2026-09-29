/* Privacy Policy */
// Shared by theartistry360.com and stream.theartistry360.com: one company,
// one set of member accounts. Keep the two copies identical.
import { COMPANY, UPDATED } from "./company";

export default {
  slug: "privacy",
  title: "Privacy Policy",
  updated: UPDATED,
  summary: [
    "We collect what we need to run your account, your payments and the services you use, and nothing we don't.",
    "We never sell your data. We share it only with the companies that help us run the service (payments, video, hosting), or when the law requires.",
    "You can ask for a copy of your data, correct it or delete your account at any time, from your account or by emailing us.",
    "We follow Uganda's Data Protection and Privacy Act, 2019. You can complain to the Personal Data Protection Office if we get it wrong.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        `${COMPANY.name} ("${COMPANY.short}", "we", "us") runs ${COMPANY.sites.join(" and ")}, and their apps. We decide how your personal data is used, which makes us its "data controller" under the Data Protection and Privacy Act, 2019 (the Act).`,
        `Contact us about privacy at ${COMPANY.email} or ${COMPANY.phone}, ${COMPANY.city}.`,
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      blocks: [
        "It depends on what you do with us:",
        {
          table: {
            head: ["When you…", "We collect"],
            rows: [
              ["Create an account", "Your name, email, phone (if you add it) and a scrambled (hashed) password, or your Google account's name and email if you continue with Google"],
              ["Subscribe or buy a film", "The plan or film, amount, date, how you paid (e.g. MTN MoMo) and PesaPal's reference. Your card number or mobile money PIN goes to PesaPal, never to us"],
              ["Watch", "What you watch, where you stopped, your ratings, My List, and your device and browser type"],
              ["Comment", "What you write, when, and which film it's on. Your name shows next to it"],
              ["Request a talent booking or send an enquiry", "Your name, email and/or phone, organisation, and what you tell us about the project"],
              ["Vote", "Your Google account's name and email (to count one vote per person), your votes, and payment details for paid votes"],
              ["Join a class", "Your name, contact details and the classes you take"],
              ["Use any of our sites", "Technical logs (IP address, pages requested, errors) to keep the service secure and working"],
            ],
          },
        },
        "If we represent you as talent, your full name, contacts and private details stay inside our team. The public sees only your first name, talent ID, photos, skills and the work you choose to show.",
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      blocks: [
        {
          list: [
            "To run your account and give you what you paid for (our agreement with you).",
            "To take payments, send receipts and keep financial records (our agreement, and the law).",
            "To recommend films, remember where you stopped and keep your settings (our agreement).",
            "To answer bookings and enquiries you send us (your request).",
            "To email you receipts and account messages, and news or new releases only if you agree (your consent, which you can withdraw with the link in any email).",
            "To keep the service safe: preventing fraud, abuse and hacking (our legitimate interest, and the law).",
            "To meet legal duties, such as tax records or a lawful request from an authority.",
          ],
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        "You must be 18 or older to create an account or pay. The Act protects children's data specially, so we don't knowingly collect it without a parent's or guardian's consent.",
        "Younger viewers should watch through a parent's account; every title shows its age rating and content warnings. If you think a child has given us their data, email us and we'll delete it.",
      ],
    },
    {
      id: "sharing",
      title: "Who we share it with",
      blocks: [
        "We never sell your personal data. We share it only with:",
        {
          list: [
            "PesaPal, to process payments (MTN MoMo, Airtel Money, cards).",
            "Google, if you sign in with Google, and for adverts on the free tier (see Cookies and adverts below).",
            "Our video hosting provider, which stores and streams the films.",
            "Our website hosting and email or messaging providers, which run the sites and send the messages you ask for.",
            "Professional advisers (lawyers, accountants) where needed.",
            "Authorities, only when the law requires it.",
          ],
        },
        "Each provider may use your data only to do its job for us, and must keep it secure.",
      ],
    },
    {
      id: "transfers",
      title: "Data stored outside Uganda",
      blocks: [
        "Some of our providers store data outside Uganda. We only use providers in countries, or under contracts, that protect your data at least as well as the Act requires.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          table: {
            head: ["Data", "Kept"],
            rows: [
              ["Your account, settings, My List and ratings", "Until you delete your account"],
              ["Watch history", "Until you clear it or delete your account"],
              ["Payment records", "As long as tax law requires, without your personal details once your account is gone"],
              ["Comments", "Until you or we delete them, or you delete your account"],
              ["Booking requests and enquiries", "12 months after we last hear from you"],
              ["Security logs", "90 days"],
              ["Backups", "Up to 30 days after deletion"],
            ],
          },
        },
      ],
    },
    {
      id: "security",
      title: "How we protect it",
      blocks: [
        "Everything travels encrypted (https). Passwords are stored scrambled (hashed), never as you typed them. Only the staff who need your data can see it, and we keep a record of who does.",
        "If a breach puts your data at risk, we'll tell the Personal Data Protection Office and you, as the Act requires, and say what we're doing about it.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      blocks: [
        "Under the Act you can:",
        {
          list: [
            "See the data we hold about you, and get a copy (email us and we'll send it).",
            "Correct anything that's wrong (Account › Security, or email us).",
            "Have your data deleted (Account › Security › Delete account).",
            "Object to, or stop, processing we do on the basis of legitimate interest, and stop marketing at any time.",
            "Withdraw any consent you've given.",
            "Complain to the Personal Data Protection Office (PDPO) if you're unhappy with how we handle your data.",
          ],
        },
        `Anything you can't do from your account, email ${COMPANY.email}. We'll reply within 30 days, and we may ask you to prove it's you first.`,
      ],
    },
    {
      id: "cookies",
      title: "Cookies and adverts",
      blocks: [
        "We use your browser's storage to keep you signed in and remember your settings (like subtitles or data saver). These are essential; the service doesn't work without them.",
        "Free-tier viewers see adverts served by Google Ad Manager, which may use cookies to limit how often you see an advert and to measure it. Subscribers see no adverts. We don't use tracking for anything else. More in our Cookies & Ads notice.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        "If we change this policy in a way that matters, we'll tell you by email or on the site before it takes effect. The date at the top shows the latest version.",
      ],
    },
  ],
};
