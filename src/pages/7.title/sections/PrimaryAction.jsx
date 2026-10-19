/* Primary Action */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Play, RotateCcw } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { accessFor } from "@/utils/access";
import { epLabel, isSeries, resumeEpisode } from "@/utils/episodes";
import PlayGate from "./PlayGate";

/**
 * Always just "Play". With access it plays; without, the gate opens with
 * the price and the next step. ?play=1 opens the gate on arrival (a Play
 * pressed elsewhere by someone who can't watch yet lands here). Once there is
 * a place to resume, "Start over" plays the same film or episode from 0:00.
 */
export default function PrimaryAction({ title }) {
  const { member } = useMember();
  const { progress, episodes } = useProgress();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Open the gate on arrival when another page sent ?play=1.
  const [gate, setGate] = useState(params.get("play") === "1");
  // A series plays the episode you'd continue (or S1:E1); a film resumes.
  const next = isSeries(title) ? resumeEpisode(title, progress, episodes) : null;
  const resume = next ? next.resume : Boolean(progress[title.id]);
  const target = next ? `/watch/${title.id}?ep=${next.episode.id}` : `/watch/${title.id}`;
  const label = next ? `${resume ? "Continue" : "Play"} ${epLabel(next.episode)}` : resume ? "Resume" : "Play";

  // ?t=0 is an explicit start, so the player skips the saved place.
  const play = (fromStart = false) => {
    const to = fromStart ? `${target}${target.includes("?") ? "&" : "?"}t=0` : target;
    if (accessFor(title, member).ok) navigate(to, { viewTransition: true });
    else setGate(true);
  };
  // Drop ?play=1 on close so a refresh doesn't reopen the gate.
  const closeGate = () => {
    setGate(false);
    if (params.has("play")) setParams((p) => { p.delete("play"); return p; }, { replace: true });
  };

  return (
    <>
      <Button variant="light" onClick={() => play()}>
        <Play className="h-5 w-5 fill-current" aria-hidden="true" /> {label}
      </Button>
      {/* Start Over: only once there is a saved place to skip. */}
      {resume && (
        <Button variant="glass" onClick={() => play(true)}>
          <RotateCcw className="h-5 w-5" aria-hidden="true" /> Start over
        </Button>
      )}
      <PlayGate title={title} open={gate} onClose={closeGate} />
    </>
  );
}
