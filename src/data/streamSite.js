// What this site shows. Mirrors the Studio document (Streaming › Stream Site);
// when the API is live this comes from GET stream/site.
export const streamSiteSeed = {
  community: {
    enabled: true,
    heading: "Join the Artistry360 community",
    body: "Get new releases, class times and behind-the-scenes first.",
    // Sample links for the demo; set the real ones in Studio › Streaming › Stream Site.
    channelUrl: "https://whatsapp.com/channel/0029VaA360StreamSample",
    groupUrl: "https://chat.whatsapp.com/A360StreamCommunitySample",
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
    { id: "free", label: "Free to Watch", source: "tier:free", enabled: true },
    { id: "classes", label: "Class Replays", source: "type:class", enabled: true },
    { id: "films", label: "Films", source: "type:film", enabled: true },
    { id: "shorts", label: "Shorts", source: "type:short", enabled: true },
    { id: "drama", label: "Drama", source: "category:cat_drama", enabled: true },
  ],
  // Off for now (the "New Artistry360 films every month" bar). The text is
  // kept; turn it back on in Studio › Streaming › Stream Site › Announcement.
  announcement: {
    enabled: false,
    text: "New Artistry360 films every month.",
    linkLabel: "Browse the latest",
    linkUrl: "/films",
  },
};
