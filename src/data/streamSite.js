// What this site shows. Mirrors the Studio document (Streaming › Stream Site);
// when the API is live this comes from GET stream/site.
export const streamSiteSeed = {
  community: {
    enabled: true,
    heading: "Join the Artistry360 community",
    body: "Get new releases, class times and behind-the-scenes first.",
    channelUrl: "",
    groupUrl: "",
  },
  hero: {
    featuredIds: ["ttl_004", "ttl_001", "ttl_002"],
    autoplayTrailers: true,
  },
  // Home page rows, top to bottom. `source` tells the stream site what to list.
  rows: [
    { id: "trending", label: "Most Watched", source: "trending", enabled: true },
    { id: "continue", label: "Continue Watching", source: "continue", enabled: true },
    { id: "new", label: "New Releases", source: "new", enabled: true },
    { id: "reels", label: "Reels & Spotlight Clips", source: "reels", enabled: true },
    { id: "free", label: "Free to Watch", source: "tier:free", enabled: true },
    { id: "classes", label: "Class Replays", source: "type:class", enabled: true },
    { id: "films", label: "Films", source: "type:film", enabled: true },
    { id: "shorts", label: "Shorts", source: "type:short", enabled: true },
    { id: "drama", label: "Drama", source: "category:cat_drama", enabled: true },
  ],
  announcement: {
    enabled: true,
    text: "New Artistry360 films every month.",
    linkLabel: "Browse the latest",
    linkUrl: "/films",
  },
};
