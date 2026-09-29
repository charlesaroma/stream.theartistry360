/* Playback */
import { setWatchPref, useWatchPrefs } from "@/hooks/useWatchPrefs";
import { Card, SwitchRow } from "./ui";

/** Player choices. They're kept on this device, so a phone and a TV can differ. */
export default function PlaybackPanel() {
  const prefs = useWatchPrefs();
  const set = (name) => (v) => setWatchPref(name, v);
  return (
    <Card title="Playback" description="These apply on this device. The same switches sit under the player.">
      <div className="max-w-2xl divide-y divide-white/8">
        <SwitchRow label="Auto next" hint="When an episode or film ends, the next one starts after a short countdown." checked={prefs.autoNext} onChange={set("autoNext")} />
        <SwitchRow label="Auto skip intro" hint="Series jump past the opening titles." checked={prefs.autoSkip} onChange={set("autoSkip")} />
        <SwitchRow label="Subtitles on" hint="Start every title with English subtitles, where there are some." checked={prefs.subtitles} onChange={set("subtitles")} />
        <SwitchRow label="Data saver" hint="Plays at up to 480p. Uses about a third of the data of HD: good for mobile data." checked={prefs.dataSaver} onChange={set("dataSaver")} />
      </div>
    </Card>
  );
}
