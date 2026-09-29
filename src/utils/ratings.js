/* Ratings */
import { Heart, ThumbsDown, ThumbsUp } from "lucide-react";

/**
 * Three honest options, no stars: I like this, Love this!, Not for me.
 * Choosing the same one again takes the rating back. Feeds "More like this"
 * and the Studio's rating column once the API stores them.
 */
// Thumbs up first (client's call), then Love, then Not for me.
export const RATINGS = [
  { id: "like", label: "I like this", icon: ThumbsUp },
  { id: "love", label: "Love this!", icon: Heart },
  { id: "meh", label: "Not for me", icon: ThumbsDown },
];
