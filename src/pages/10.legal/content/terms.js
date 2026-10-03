/* Terms Of Use (stream) */
import { COMPANY, UPDATED } from "./company";

export default {
  slug: "terms",
  title: "Terms of Use",
  updated: UPDATED,
  summary: [
    "You need to be 18 or older to have an account. Keep your password to yourself.",
    "Plans give you the whole library for the period you pay for. Cancel any time; you keep access until the period ends.",
    "A film you buy is yours to watch for 24 hours from when you first press Play.",
    "Watch for yourself and your household. Don't record, copy or share the films.",
  ],
  sections: [
    { id: "agreement", title: "About these terms", blocks: [`These terms are an agreement between you and ${COMPANY.name}, ${COMPANY.city}, for using stream.theartistry360.com and its apps (the "Service"). By creating an account or watching, you accept them. Our Privacy Policy, Refunds & Cancellation policy and Community Guidelines are part of them.`] },
    {
      id: "accounts",
      title: "Your account",
      blocks: [
        {
          list: [
            "You must be 18 or older to create an account or pay. Younger viewers watch through a parent's or guardian's account.",
            "Give us true details, and keep your password secret. You're responsible for what happens on your account.",
            "Tell us straight away if you think someone else is using it. You can sign out of all devices from Account › Security.",
            "One account is for you and the people you live with. Selling or publicly sharing access isn't allowed.",
          ],
        },
      ],
    },
    {
      id: "plans",
      title: "Plans and payments",
      blocks: [
        {
          list: [
            "Prices are in Uganda shillings (UGX) and include any taxes that apply. On the website you pay through PesaPal with MTN MoMo, Airtel Money or a card.",
            "In our iPhone and Android apps you pay through the App Store or Google Play, at the price the app shows, which can differ slightly from the website's (the stores set their own price points and currency). Those payments also follow Apple's or Google's terms.",
            "Your card details and mobile money PIN go straight to PesaPal, Apple or Google and never reach our servers. We never ask for your PIN by phone, SMS, email or WhatsApp; anyone who does isn't us.",
            "Whichever way you pay, it's the same account: a plan or film bought on the website works in the apps, and the other way round.",
            "A plan gives you the whole library, without adverts, for the period you pay for (a month, 3 months or a year).",
            "We remind you 3 days before a plan renews. If a renewal isn't paid, your account goes back to the free tier; nothing is lost.",
            "You can cancel any time. A plan bought on the website cancels in Account › Membership; a plan bought in an app is cancelled in your App Store or Google Play subscriptions (Account › Membership opens them). You keep access until the end of the period you've paid for.",
            "We'll give you at least 30 days' notice before a price change affects your plan.",
          ],
        },
        "Refunds are covered by our Refunds & Cancellation policy.",
      ],
    },
    {
      id: "pay-per-view",
      title: "Films you buy (pay-per-view)",
      blocks: ["Some films are sold one at a time. Once bought, you have 24 hours to watch from the moment you first press Play, as many times as you like. Buying a film doesn't transfer any ownership of it to you."],
    },
    {
      id: "free-tier",
      title: "The free tier",
      blocks: ["With a free account you can watch the titles marked Free, with adverts before or during them. We choose which titles are free and may change them."],
    },
    {
      id: "using-content",
      title: "Using the films",
      blocks: [
        {
          list: [
            "The films are for personal, non-commercial viewing only.",
            "Don't download (outside any download feature we offer), record, copy, rebroadcast, screen publicly or share the films, or get round any protection on them.",
            "Titles come and go, and some may not be available everywhere.",
          ],
        },
      ],
    },
    {
      id: "ratings",
      title: "Age ratings and parental guidance",
      blocks: ["Each title shows an age rating (G, PG, 13+, 16+, 18+) and content warnings, as guidance. Parents and guardians decide what's right for their children."],
    },
    {
      id: "comments",
      title: "Comments",
      blocks: [
        "When you post a comment you keep ownership of it, and you let us show it on the Service. Follow the Community Guidelines. We may remove comments, or suspend commenting, when they break them.",
      ],
    },
    {
      id: "acceptable-use",
      title: "What you mustn't do",
      blocks: [
        {
          list: [
            "Break the law, or help anyone else do so, through the Service.",
            "Try to hack, overload, scrape or disrupt the Service, or use bots.",
            "Pretend to be someone else, or use someone else's payment method without permission.",
            "Try to find out or reveal the identity of talent we keep private.",
          ],
        },
      ],
    },
    {
      id: "ending",
      title: "Suspending or closing accounts",
      blocks: ["You can delete your account at any time in Account › Privacy & data. We may suspend or close an account that seriously or repeatedly breaks these terms. Where we can, we'll warn you first and explain why."],
    },
    {
      id: "changes",
      title: "Changes to the Service and these terms",
      blocks: ["We keep improving the Service, so features change. If we change these terms in a way that matters, we'll tell you before it takes effect. If you don't agree, you can cancel before then."],
    },
    {
      id: "liability",
      title: "Our responsibility to you",
      blocks: [
        "We work hard to keep the Service running, but we can't promise it will never be interrupted. If something goes wrong on our side, contact us and we'll put it right, including a refund where our Refunds policy or the law says so.",
        "We're not responsible for losses we couldn't reasonably foresee, or for problems caused by your device or internet connection. Nothing in these terms takes away rights you have under Ugandan law.",
      ],
    },
    {
      id: "law",
      title: "Governing law and disputes",
      blocks: [`These terms are governed by the laws of Uganda. If something goes wrong, please talk to us first at ${COMPANY.email}; most things can be sorted quickly. Otherwise, disputes go to the courts of Uganda.`],
    },
  ],
};
