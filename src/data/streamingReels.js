// Seed data for Artistry360 Reels (short-form vertical cinema clips, audition
// monologues, scene highlights, and behind-the-scenes teasers).
// Follows the same contract the Studio writes; when live this comes from GET streaming/reels.
//
// A reel is a scene: a window (clip.start to clip.end, in seconds) of the
// linked title's own stream, so "Scene from …" can open the full title at the
// same moment. `featured` is the Studio's pick for the top of /reels (one at
// most). Until the provider cuts real clips, every title (and so every
// reel) plays Mux's public test stream.
const DEMO_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const reelPoster = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=720&h=1280`;

export const streamingReelsSeed = [
  {
    id: "reel_001",
    publishedAt: "2026-09-02T09:00:00.000Z",
    title: "The Monologue Breakdown",
    category: "monologue",
    caption: "Alexon breaks down the turning point where an actor shifts from speaking lines to demanding something real from their scene partner.",
    duration: 38,
    playbackUrl: DEMO_HLS,
    clip: { start: 12, end: 50 },
    poster: reelPoster("photo-1534528741775-53994a69daeb"),
    views: 12450,
    likes: 1820,
    talent: {
      name: "Alexon Audax",
      role: "Instructor & Director",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_002",
    titleName: "Monologue Masterclass: Finding the Want",
  },
  {
    id: "reel_002",
    publishedAt: "2026-09-20T09:00:00.000Z",
    // The Studio's featured pick: the moving centrepiece at the top of /reels.
    featured: true,
    title: "Interrogation Scene Climax",
    category: "highlight",
    caption: "Tendo's raw confrontation in Kings & Queens. Shot in one continuous handheld take on location in Kampala.",
    duration: 54,
    playbackUrl: DEMO_HLS,
    clip: { start: 100, end: 154 },
    poster: reelPoster("photo-1507003211169-0a1dd7228f2d"),
    views: 24800,
    likes: 3410,
    talent: {
      name: "Brian O.",
      role: "as Tendo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_001",
    titleName: "Kings & Queens",
  },
  {
    id: "reel_003",
    publishedAt: "2026-09-24T09:00:00.000Z",
    title: "The 3-Second Cold Read",
    category: "audition",
    caption: "How to capture the room and own the stillness before speaking a single word of the script.",
    duration: 29,
    playbackUrl: DEMO_HLS,
    clip: { start: 185, end: 214 },
    poster: reelPoster("photo-1517841905240-472988babdf9"),
    views: 18900,
    likes: 2750,
    talent: {
      name: "Grace K.",
      role: "Lead Student Actor",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_004",
    titleName: "Boda Nights",
  },
  {
    id: "reel_004",
    publishedAt: "2026-09-11T09:00:00.000Z",
    title: "Lighting The Night Alley",
    category: "bts",
    caption: "Crafting atmospheric neon noir in downtown Kampala using a single key light, wet pavement reflections, and haze.",
    duration: 44,
    playbackUrl: DEMO_HLS,
    clip: { start: 260, end: 304 },
    poster: reelPoster("photo-1518709268805-4e9042af9f23"),
    views: 9600,
    likes: 1420,
    talent: {
      name: "Production Crew",
      role: "Cinematography Unit",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_005",
    titleName: "The Audition Room",
  },
  {
    id: "reel_005",
    publishedAt: "2026-09-27T09:00:00.000Z",
    title: "Screen Presence & Micro-Expressions",
    category: "monologue",
    caption: "Why the camera lens registers your internal dialogue before you ever make an external gesture.",
    duration: 35,
    playbackUrl: DEMO_HLS,
    clip: { start: 350, end: 385 },
    poster: reelPoster("photo-1500648767791-00dcc994a43e"),
    views: 15300,
    likes: 2190,
    talent: {
      name: "Alexon Audax",
      role: "Acting Coach",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_002",
    titleName: "Monologue Masterclass: Finding the Want",
  },
  {
    id: "reel_006",
    publishedAt: "2026-09-15T09:00:00.000Z",
    title: "Stunt Choreography Rehearsal",
    category: "bts",
    caption: "Breaking down the corridor chase sequence frame by frame with camera operator pace and stunt padding.",
    duration: 48,
    playbackUrl: DEMO_HLS,
    clip: { start: 420, end: 468 },
    poster: reelPoster("photo-1485846234645-a62644f84728"),
    views: 31200,
    likes: 4890,
    talent: {
      name: "Action Unit",
      role: "Stunt Coordinators",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80",
    },
    titleId: "ttl_001",
    titleName: "Kings & Queens",
  },
];
