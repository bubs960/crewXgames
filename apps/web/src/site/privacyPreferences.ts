import { useEffect, useState } from "react";

export type PrivacyChoice = "necessary" | "optional";

export const privacyPreferenceKey = "cm_privacy_choice_v1";
export const legacyPrivacyPreferenceKey = "tm_privacy_choice_v1";
export const privacyChoiceEvent = "crewmultiply:consent-ready";
export const openPrivacyEvent = "crewmultiply:open-privacy";

export const readPrivacyChoice = (): PrivacyChoice | null => {
  try {
    const currentValue = localStorage.getItem(privacyPreferenceKey);
    const legacyValue = localStorage.getItem(legacyPrivacyPreferenceKey);
    const saved = JSON.parse(currentValue ?? legacyValue ?? "null") as { choice?: string } | null;
    const choice = saved?.choice === "necessary" || saved?.choice === "optional" ? saved.choice : null;

    if (!currentValue && legacyValue && choice) {
      localStorage.setItem(privacyPreferenceKey, legacyValue);
      localStorage.removeItem(legacyPrivacyPreferenceKey);
    }

    return choice;
  } catch {
    try {
      localStorage.removeItem(privacyPreferenceKey);
      localStorage.removeItem(legacyPrivacyPreferenceKey);
    } catch {
      // Storage can be unavailable. The default remains necessary-only.
    }
    return null;
  }
};

export const savePrivacyChoice = (choice: PrivacyChoice) => {
  try {
    localStorage.setItem(privacyPreferenceKey, JSON.stringify({ choice, savedAt: new Date().toISOString() }));
    localStorage.removeItem(legacyPrivacyPreferenceKey);
  } catch {
    // Preserve the in-session choice when durable storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(privacyChoiceEvent, { detail: { choice } }));
};

export const openPrivacyChoices = () => window.dispatchEvent(new Event(openPrivacyEvent));

export const usePrivacyChoice = () => {
  const [choice, setChoice] = useState<PrivacyChoice | null>(() => readPrivacyChoice());

  useEffect(() => {
    const sync = () => setChoice(readPrivacyChoice());
    const syncFromEvent = (event: Event) => {
      const next = (event as CustomEvent<{ choice?: PrivacyChoice }>).detail?.choice;
      setChoice(next === "necessary" || next === "optional" ? next : readPrivacyChoice());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(privacyChoiceEvent, syncFromEvent);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(privacyChoiceEvent, syncFromEvent);
    };
  }, []);

  return choice;
};
