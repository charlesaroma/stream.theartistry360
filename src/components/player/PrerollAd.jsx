/* Pre-roll Ad */
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useMember } from "@/store/context/MemberContext";
import { siteQueries } from "@/store/tanstackStore/queries/site";
import { capped, loadIma, recordAd } from "./ima";

/**
 * Free-tier pre-roll. Live: a Google IMA ad from the web ad tag set in the
 * Studio (Streaming › Ads), at most as often as its hourly cap. No tag, ads
 * off, the cap reached, an ad blocker, no ad to show or an ad that fails:
 * the title just plays. Skipping is the ad's own (set in the ad server).
 * Mocks: a stand-in that counts down.
 */
export default function PrerollAd({ onDone }) {
  const { demo } = useMember();
  return demo ? <DemoAd onDone={onDone} /> : <GoogleAd onDone={onDone} />;
}

// Waiting longer than this for an ad to start isn't worth it: the title plays.
const START_WITHIN_MS = 8000;

function GoogleAd({ onDone }) {
  const { data: settings, isError } = useQuery(siteQueries.ads());
  const slot = useRef(null);
  const [started, setStarted] = useState(false);
  // The latest onDone, so the ad isn't requested again when the player re-renders.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  const wanted = Boolean(settings?.enabled && settings.web?.preroll && settings.web?.adTagUrl && !capped(settings.frequencyCapPerHour));
  const settled = isError || (settings && !wanted);

  // Nothing to show: hand straight back to the player.
  useEffect(() => {
    if (settled) done.current();
  }, [settled]);

  useEffect(() => {
    const container = slot.current;
    if (!wanted || !container) return undefined;
    let finished = false;
    let manager = null;
    let loader = null;
    let display = null;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      done.current();
    };
    const timer = setTimeout(finish, START_WITHIN_MS);
    const resize = new ResizeObserver(() => manager?.resize(container.clientWidth, container.clientHeight, window.google?.ima?.ViewMode.NORMAL));

    loadIma()
      .then((ima) => {
        if (finished) return;
        display = new ima.AdDisplayContainer(container);
        display.initialize();
        loader = new ima.AdsLoader(display);
        loader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, finish);
        loader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (event) => {
          if (finished) return;
          // No content video of ours plays under the ad: the player starts the title afterwards.
          manager = event.getAdsManager({ currentTime: 0, duration: 0 });
          manager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, finish);
          for (const type of ["ALL_ADS_COMPLETED", "CONTENT_RESUME_REQUESTED", "SKIPPED", "USER_CLOSE"]) {
            manager.addEventListener(ima.AdEvent.Type[type], finish);
          }
          manager.addEventListener(ima.AdEvent.Type.STARTED, () => {
            clearTimeout(timer);
            recordAd();
            setStarted(true);
          });
          manager.init(container.clientWidth, container.clientHeight, ima.ViewMode.NORMAL);
          manager.start();
          resize.observe(container);
        });
        const request = new ima.AdsRequest();
        request.adTagUrl = settings.web.adTagUrl;
        request.linearAdSlotWidth = container.clientWidth;
        request.linearAdSlotHeight = container.clientHeight;
        request.nonLinearAdSlotWidth = container.clientWidth;
        request.nonLinearAdSlotHeight = Math.round(container.clientHeight / 3);
        request.setAdWillAutoPlay(true);
        loader.requestAds(request);
      })
      .catch(finish);

    return () => {
      finished = true;
      clearTimeout(timer);
      resize.disconnect();
      manager?.destroy();
      loader?.destroy();
      display?.destroy();
    };
  }, [wanted, settings]);

  return (
    <div className="absolute inset-0 z-20 bg-black">
      {/* IMA draws the ad (and its own Skip and Learn more) in here. */}
      <div ref={slot} className="absolute inset-0" />
      {started && <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-caption font-bold">Advertisement</p>}
    </div>
  );
}

// Seconds: the stand-in ad's length, and when Skip unlocks.
const LENGTH = 8;
const SKIPPABLE_AFTER = 5;

function DemoAd({ onDone }) {
  const [left, setLeft] = useState(LENGTH);

  // Count down a second at a time; hand back to the player at zero.
  useEffect(() => {
    if (left <= 0) {
      onDone();
      return undefined;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const skippable = LENGTH - left >= SKIPPABLE_AFTER;

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,var(--color-brand-900),black_70%)]">
      <div className="text-center">
        <p className="eyebrow mb-3">Advertisement</p>
        <p className="text-title">Your ad here</p>
        <p className="mt-2 text-small text-text-secondary">Free members watch with short ads. Subscribers never see them.</p>
      </div>
      {/* Remaining time, announced politely as it counts. */}
      <div className="absolute bottom-8 left-8 rounded-full bg-black/60 px-4 py-2 text-caption font-bold tabular-nums" aria-live="polite">Ad · {left}s</div>
      <button
        type="button"
        onClick={onDone}
        disabled={!skippable}
        className="btn btn-glass molten-glass ember absolute bottom-6 right-6 disabled:opacity-60"
        data-glass=""
      >
        {skippable ? "Skip ad" : `Skip in ${SKIPPABLE_AFTER - (LENGTH - left)}`}
      </button>
    </div>
  );
}
