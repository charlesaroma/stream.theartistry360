/* Community Guidelines */
import { COMPANY, UPDATED } from "./company";

export default {
  slug: "community",
  title: "Community Guidelines",
  updated: UPDATED,
  summary: ["Talk about the films, kindly. Cover your spoilers. Keep people's private details private. Report what doesn't belong."],
  sections: [
    {
      id: "do",
      title: "What makes a good comment",
      blocks: [{ list: ["Say what you thought, and why.", "Disagree with ideas, not people.", "Tick Contains spoilers if you reveal a twist or an ending.", "Stay on the film or episode you're commenting on."] }],
    },
    {
      id: "dont",
      title: "What isn't allowed",
      blocks: [
        {
          list: [
            "Insults, harassment, bullying or threats, including against cast and crew.",
            "Hate towards anyone for their tribe, ethnicity, religion, gender, disability or any other part of who they are.",
            "Sexual content, and anything involving children in a harmful way.",
            "Sharing anyone's personal details (phone numbers, addresses), or trying to reveal the identity of talent we keep private.",
            "Spam, adverts, links to other sites, scams, or asking for money.",
            "Links to pirated copies of films, ours or anyone else's.",
            "Anything illegal in Uganda.",
          ],
        },
      ],
    },
    {
      id: "reporting",
      title: "Reporting and what happens next",
      blocks: [
        "Press Report on any comment that breaks these guidelines. Our team reviews every report, usually within 2 working days.",
        "Depending on how serious it is, we may remove the comment, warn you, stop you commenting, or close your account. Illegal content may be reported to the authorities.",
        `Think we got it wrong? Email ${COMPANY.email} and we'll take another look.`,
      ],
    },
  ],
};
