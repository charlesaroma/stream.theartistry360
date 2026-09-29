// Sample member comments, so the section isn't empty in the demo. Real
// comments come from GET streaming/titles/:id/comments.
const ago = (hours) => new Date(Date.now() - hours * 3600_000).toISOString();

export const commentsSeed = {
  ttl_001: [
    { id: "c_001", author: { id: "m_s1", name: "Nakato B." }, body: "Watched this with my whole drama class. The scene in the rehearsal room got us all emotional. More films like this please!", spoiler: false, likes: 24, createdAt: ago(5) },
    { id: "c_002", author: { id: "m_s2", name: "Ssali J." }, body: "The ending when Naki finally tells the truth on camera… I did not see that coming.", spoiler: true, likes: 11, createdAt: ago(20) },
    { id: "c_003", author: { id: "m_s3", name: "Amani" }, body: "Proud to see Kampala on screen like this. The sound could be a bit louder in the classroom scenes.", spoiler: false, likes: 6, createdAt: ago(49) },
  ],
  ttl_004: [
    { id: "c_010", author: { id: "m_s4", name: "Okello D." }, body: "Boda Nights is the best thriller I've seen from a Ugandan team. That last ride!", spoiler: false, likes: 31, createdAt: ago(3) },
    { id: "c_011", author: { id: "m_s5", name: "Grace N." }, body: "So the passenger was the rider's sister all along. Chills.", spoiler: true, likes: 9, createdAt: ago(30) },
  ],
  ttl_020: [
    { id: "c_020", author: { id: "m_s6", name: "Mirembe" }, body: "Episode 2 (The Cold Read) is exactly what auditions feel like. Can't wait for season 2.", spoiler: false, likes: 14, createdAt: ago(12) },
  ],
  ttl_021: [
    { id: "c_030", author: { id: "m_s7", name: "Tendo K." }, body: "Ten seconds to impress… I'd freeze. Respect to everyone who went in.", spoiler: false, likes: 8, createdAt: ago(8) },
  ],
};
