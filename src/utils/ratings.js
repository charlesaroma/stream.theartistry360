/* Ratings */
import { Heart, ThumbsDown, ThumbsUp } from "lucide-react";

/**
 * Three honest options, no stars: Not for me, I like this, Love this!
 * Choosing the same one again takes the rating back. Feeds "More like this"
 * and the Studio's rating column once the API stores them.
 */
export const RATINGS = [
  { id: "meh", label: "Not for me", icon: ThumbsDown },
  { id: "like", label: "I like this", icon: ThumbsUp },
  { id: "love", label: "Love this!", icon: Heart },
];
