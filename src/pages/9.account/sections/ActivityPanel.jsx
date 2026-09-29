/* Viewing Activity */
import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import { useAccountData, useProgress } from "@/store/tanstackStore/queries/member";
import { useTitles } from "@/store/tanstackStore/queries/site";
import { epLabel, findEpisode } from "@/utils/episodes";
import { shortDate } from "./dates";
import { Card, Status } from "./ui";

/**
 * What you've watched, newest first: remove one title (it leaves Continue
 * Watching) or clear the lot.
 */
export default function ActivityPanel() {
  const { progress, clear } = useProgress();
  const { data: titles = [] } = useTitles();
  const { clearHistory } = useAccountData();
  const [confirming, setConfirming] = useState(false);
  const [ok, setOk] = useState("");

  const rows = Object.entries(progress)
    .map(([id, p]) => ({ title: titles.find((t) => t.id === id), p }))
    .filter((r) => r.title)
    .sort((a, b) => b.p.updatedAt.localeCompare(a.p.updatedAt));

  const clearAll = async () => {
    await clearHistory();
    setConfirming(false);
    setOk("Viewing activity cleared.");
  };

  return (
    <Card title="Viewing activity" description="Titles you've started, newest first. Removing one takes it out of Continue Watching; your ratings and My List stay.">
      {rows.length ? (
        <ul className="flex flex-col divide-y divide-white/8">
          {rows.map(({ title, p }) => {
            const ep = p.episodeId ? findEpisode(title, p.episodeId) : null;
            const pct = p.duration ? Math.min(100, (p.seconds / p.duration) * 100) : 0;
            return (
              <li key={title.id} className="flex items-center gap-4 py-3">
                <span className="w-24 shrink-0 text-caption tabular-nums text-text-muted">{shortDate(p.updatedAt)}</span>
                <Link to={`/title/${title.id}`} viewTransition className="min-w-0 flex-1 hover:text-brand">
                  <span className="block truncate font-semibold">{title.title}{ep && <span className="font-normal text-text-secondary"> · {epLabel(ep)} {ep.title}</span>}</span>
                  <span className="mt-1.5 block h-1 max-w-48 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-brand" style={{ width: `${pct}%` }} /></span>
                </Link>
                <button type="button" onClick={() => clear(title.id)} aria-label={`Remove ${title.title} from viewing activity`} title="Remove" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-muted hover:bg-white/8 hover:text-text-primary">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-small text-text-muted">Nothing here yet. Titles you start watching appear here.</p>
      )}

      {rows.length > 0 && (
        <div className="mt-5">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-small text-text-secondary">Clear all of it? This can't be undone.</span>
              <Button variant="glass" onClick={() => setConfirming(false)}>Keep it</Button>
              <Button onClick={clearAll}>Clear all</Button>
            </div>
          ) : (
            <Button variant="glass" onClick={() => setConfirming(true)}>Clear all</Button>
          )}
        </div>
      )}
      <Status ok={ok} />
    </Card>
  );
}
