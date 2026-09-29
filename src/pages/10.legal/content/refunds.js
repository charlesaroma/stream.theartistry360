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
  ],
  sections: [
    {
      id: "cancelling",
      title: "Cancelling a plan",
      blocks: [
        "Go to Account › Membership › Cancel plan. Nothing more is charged, and you keep full access until the end of the period you've paid for. Changed your mind? Press Keep my plan before then.",
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
            "A film you bought won't play because of a fault on our side, and we can't fix it within your 48-hour window.",
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
      id: "how",
      title: "How to ask for a refund",
      blocks: [
        `Email ${COMPANY.email} or call ${COMPANY.phone} within 14 days of the payment, with the PesaPal reference from Account › Membership and what went wrong.`,
        "We reply within 3 working days. Approved refunds go back to the way you paid, usually within 7 working days; mobile money and card providers can take a little longer to show it.",
      ],
    },
  ],
};
