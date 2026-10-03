/* Refunds And Cancellation */
import { COMPANY, UPDATED } from "./company";

export default {
  slug: "refunds",
  title: "Refunds & Cancellation",
  updated: UPDATED,
  summary: [
    "Cancel a plan any time; you keep access until the end of the period you paid for.",
    "Charged twice, or paid and got nothing? You get your money back in full.",
    "A bought film that won't play because of a fault on our side is refunded.",
    "Bought in the iPhone or Android app? Apple or Google handles the refund; see below.",
  ],
  sections: [
    {
      id: "cancelling",
      title: "Cancelling a plan",
      blocks: [
        "Go to Account › Membership › Cancel plan. Nothing more is charged, and you keep full access until the end of the period you've paid for. Changed your mind? Press Keep my plan before then.",
        "A plan bought in our app is cancelled in your App Store or Google Play subscriptions (Account › Membership in the app opens them), at least 24 hours before it renews.",
        "We don't refund the unused part of a period you've started, unless the law requires it or we've let you down (see below).",
      ],
    },
    {
      id: "full-refunds",
      title: "When we refund in full",
      blocks: [
        {
          list: [
            "You were charged twice for the same thing.",
            "Your payment went through but your plan or film didn't start, and we can't fix it within 48 hours.",
            "A film you bought won't play because of a fault on our side, and we can't fix it within your 24-hour window.",
            "We close the Service or remove your plan before the period you paid for ends (refunded for the unused part).",
          ],
        },
      ],
    },
    {
      id: "films",
      title: "Films you buy",
      blocks: ["Once you've started watching a bought film, it can't be refunded, except for a fault on our side as above."],
    },
    {
      id: "app-store",
      title: "Bought in the app (App Store or Google Play)",
      blocks: [
        "Payments made in our iPhone and Android apps are taken by Apple or Google, so they decide on refunds, under their own policies. We can't refund those payments ourselves.",
        {
          list: [
            "App Store: ask at reportaproblem.apple.com, signed in with the Apple Account you paid with.",
            "Google Play: ask from your order history in Google Play, or at play.google.com/store/account/orderhistory.",
          ],
        },
        `If something went wrong on our side, tell us too (${COMPANY.email}) and we'll support your request with Apple or Google.`,
      ],
    },
    {
      id: "how",
      title: "How to ask for a refund",
      blocks: [
        `For website payments, email ${COMPANY.email} or call ${COMPANY.phone} within 14 days of the payment, with the PesaPal reference from Account › Membership and what went wrong.`,
        "We reply within 3 working days. Approved refunds go back to the way you paid, usually within 7 working days; mobile money and card providers can take a little longer to show it.",
      ],
    },
  ],
};
