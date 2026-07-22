import { useEffect, useRef, useState } from "react";
import { openPrivacyChoices, usePrivacyChoice } from "./privacyPreferences";

type DisplayPlacement = "content" | "game-detail";

interface DisplayConfig {
  key: string;
  width: 300 | 728;
  height: 90 | 250;
  src: string;
}

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: "iframe";
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

const mediumRectangle: DisplayConfig = {
  key: "6fdbf640fe1300e9f3f4f31c3eb48dd2",
  width: 300,
  height: 250,
  src: "https://www.highperformanceformat.com/6fdbf640fe1300e9f3f4f31c3eb48dd2/invoke.js"
};

const leaderboard: DisplayConfig = {
  key: "841bc3e48da39de5799b6955712cee8b",
  width: 728,
  height: 90,
  src: "https://www.highperformanceformat.com/841bc3e48da39de5799b6955712cee8b/invoke.js"
};

export const socialBarSrc = "https://pl30490413.effectivecpmnetwork.com/1f/03/55/1f03554e30d399a741a4d96f44ade128.js";

const useLeaderboardViewport = () => {
  const query = "(min-width: 800px)";
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return matches;
};

export const AdsterraDisplaySlot = ({ placement }: { placement: DisplayPlacement }) => {
  const choice = usePrivacyChoice();
  const leaderboardViewport = useLeaderboardViewport();
  const frameRef = useRef<HTMLDivElement>(null);
  const config = placement === "content" && leaderboardViewport ? leaderboard : mediumRectangle;
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || choice !== "optional") {
      setStatus("idle");
      return;
    }

    frame.replaceChildren();
    setStatus("loading");
    window.atOptions = {
      key: config.key,
      format: "iframe",
      height: config.height,
      width: config.width,
      params: {}
    };

    const script = document.createElement("script");
    script.src = config.src;
    script.async = true;
    script.dataset.adsterraDisplay = config.key;
    script.addEventListener("error", () => setStatus("failed"), { once: true });
    frame.appendChild(script);

    return () => {
      frame.replaceChildren();
      if (window.atOptions?.key === config.key) delete window.atOptions;
    };
  }, [choice, config.height, config.key, config.src, config.width]);

  const allowed = choice === "optional";
  return (
    <aside
      className="tp-ad-slot"
      data-ad-size={`${config.width}x${config.height}`}
      aria-label="Advertisement"
    >
      <strong className="tp-ad-label">Advertisement</strong>
      <div
        ref={frameRef}
        className="tp-ad-frame"
        aria-hidden={!allowed}
      />
      {!allowed && (
        <div className="tp-ad-choice">
          <span>Optional advertising is off.</span>
          <button type="button" onClick={openPrivacyChoices}>Privacy choices</button>
        </div>
      )}
      {status === "failed" && <span className="tp-ad-fallback" role="status">Advertisement unavailable. Play continues normally.</span>}
    </aside>
  );
};

export const AdsterraSocialBar = ({ enabled }: { enabled: boolean }) => {
  const choice = usePrivacyChoice();

  useEffect(() => {
    if (!enabled || choice !== "optional") return;

    const injectedNodes = new Set<Node>();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element && node.hasAttribute("data-adsterra-social-bar")) continue;
          injectedNodes.add(node);
        }
      }
    });
    observer.observe(document.body, { childList: true });

    const script = document.createElement("script");
    script.src = socialBarSrc;
    script.async = true;
    script.dataset.adsterraSocialBar = "approved";
    document.body.appendChild(script);

    return () => {
      observer.disconnect();
      script.remove();
      for (const node of injectedNodes) node.parentNode?.removeChild(node);
    };
  }, [choice, enabled]);

  return null;
};
