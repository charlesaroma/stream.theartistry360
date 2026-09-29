/* Primary Action */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Play } from "lucide-react";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberContext";
import { useProgress } from "@/store/tanstackStore/queries/member";
import { accessFor } from "@/utils/access";
import PlayGate from "./PlayGate";

/**
 * Always just "Play". With access it plays; without, the gate opens with
 * the price and the next step. ?play=1 opens the gate on arrival (a Play
 * pressed elsewhere by someone who can't watch yet lands here).
 */
export default function PrimaryAction({ title }) {
  const { member } = useMember();
  const { progress } = useProgress();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [gate, setGate] = useState(params.get("play") === "1");
  const resume = progress[title.id];

  const play = () => {
    if (accessFor(title, member).ok) navigate(`/watch/${title.id}`, { viewTransition: true });
    else setGate(true);
  };
  const closeGate = () => {
    setGate(false);
    if (params.has("play")) setParams((p) => { p.delete("play"); return p; }, { replace: true });
  };

  return (
    <>
      <Button variant="light" onClick={play}>
        <Play className="h-5 w-5 fill-current" aria-hidden="true" /> {resume ? "Resume" : "Play"}
      </Button>
      <PlayGate title={title} open={gate} onClose={closeGate} />
    </>
  );
}
