(() => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  navToggle?.addEventListener("click", () => {
    const open = nav?.dataset.open !== "true";
    if (nav) nav.dataset.open = String(open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-year]").forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });

  const preferenceKey = "cm_privacy_choice_v1";
  const legacyPreferenceKey = "tm_privacy_choice_v1";
  const banner = document.querySelector("[data-privacy-banner]");
  const showBanner = () => {
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector("button")?.focus();
  };
  const saveChoice = choice => {
    localStorage.setItem(preferenceKey, JSON.stringify({ choice, savedAt: new Date().toISOString() }));
    localStorage.removeItem(legacyPreferenceKey);
    if (banner) banner.hidden = true;
    window.dispatchEvent(new CustomEvent("crewmultiply:consent-ready", { detail: { choice } }));
  };

  document.querySelectorAll("[data-privacy-choice]").forEach(button => {
    button.addEventListener("click", () => saveChoice(button.dataset.privacyChoice));
  });
  document.querySelectorAll("[data-manage-privacy]").forEach(button => {
    button.addEventListener("click", showBanner);
  });

  let savedChoice = null;
  try {
    const currentValue = localStorage.getItem(preferenceKey);
    const legacyValue = localStorage.getItem(legacyPreferenceKey);
    savedChoice = JSON.parse(currentValue || legacyValue || "null");
    if (!currentValue && legacyValue && savedChoice) {
      localStorage.setItem(preferenceKey, legacyValue);
      localStorage.removeItem(legacyPreferenceKey);
    }
  } catch {
    localStorage.removeItem(preferenceKey);
    localStorage.removeItem(legacyPreferenceKey);
  }
  if (!savedChoice && banner) banner.hidden = false;

  if ("serviceWorker" in navigator) {
    const scriptUrl = document.currentScript?.src;
    const siteRoot = scriptUrl ? new URL("../", scriptUrl) : new URL("/", window.location.href);
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("sw.js", siteRoot), { scope: siteRoot.pathname }).catch(() => {});
    });
  }
})();
