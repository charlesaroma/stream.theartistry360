/* Cookies And Ads */
import { UPDATED } from "./company";

export default {
  slug: "cookies",
  title: "Cookies & Ads",
  updated: UPDATED,
  summary: ["We store only what the service needs: your sign-in and your settings. Free-tier adverts come from Google, which may use cookies. Subscribers see no adverts."],
  sections: [
    {
      id: "essential",
      title: "Essential storage",
      blocks: [
        "We keep small pieces of data in your browser so the service works:",
        {
          table: {
            head: ["What", "Why", "How long"],
            rows: [
              ["Sign-in", "Keeps you signed in", "Until you sign out"],
              ["Playback settings", "Auto next, subtitles, data saver", "Until you change or clear them"],
              ["Recently viewed and saved data", "Loads pages faster and works offline for a while", "Up to 24 hours"],
              ["Parental unlock", "Remembers a PIN-unlocked title", "Until you close the browser"],
            ],
          },
        },
        "These don't track you across other sites, and you can't switch them off without breaking sign-in.",
      ],
    },
    {
      id: "ads",
      title: "Adverts on the free tier",
      blocks: [
        "If you watch free, Google Ad Manager shows adverts and may set cookies to cap how often you see the same advert, and to count views. Google's use of that data is covered by Google's own privacy policy.",
        "Subscribers never see adverts, so no advertising cookies are set for them.",
      ],
    },
    {
      id: "control",
      title: "Your choices",
      blocks: ["You can clear your browser's storage at any time; you'll be signed out and your device settings reset. Subscribing removes adverts entirely."],
    },
  ],
};
