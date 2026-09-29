/* Copyright */
import { COMPANY, UPDATED } from "./company";

export default {
  slug: "copyright",
  title: "Copyright",
  updated: UPDATED,
  summary: ["The films and everything else on the Service belong to us or the people who licensed them to us. If you think something here infringes your rights, tell us."],
  sections: [
    {
      id: "ours",
      title: "What's protected",
      blocks: [`The films, trailers, artwork, logos and text on the Service are owned by ${COMPANY.name} or licensed to us, and are protected by the Copyright and Neighbouring Rights Act, 2006 and international copyright law. You may watch them as our Terms of Use allow, and nothing more.`],
    },
    {
      id: "report",
      title: "Reporting an infringement",
      blocks: [
        `If you believe something on the Service uses your work without permission, email ${COMPANY.email} with:`,
        { list: ["Your name and contact details.", "The work you own, and proof that you own it.", "Where it appears on the Service (the link).", "A statement that the information you've given is true."] },
        "We'll acknowledge you within 3 working days, and remove or disable the material while we look into it where the claim is clear.",
      ],
    },
    {
      id: "piracy",
      title: "Pirated copies of our films",
      blocks: [`Seen one of our films shared or sold without our permission? Please tell us at ${COMPANY.email}. Recording or redistributing our films is against the law and our Terms of Use.`],
    },
  ],
};
