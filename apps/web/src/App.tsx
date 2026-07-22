import { lazy, Suspense } from "react";
import { SiteApp } from "./site/SiteApp";

const LivingShelfApp = lazy(async () => {
  const module = await import("./LivingShelfApp");
  return { default: module.LivingShelfApp };
});

const isShelfRoute = () => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/shelf" || window.location.hash === "#cozy-crochet" || window.location.hash === "#pet-parade-sort";
};

export const App = () => {
  if (!isShelfRoute()) return <SiteApp />;

  return (
    <Suspense
      fallback={
        <main className="loading-shell" role="status">
          <p>Opening the Living Shelf…</p>
        </main>
      }
    >
      <LivingShelfApp />
    </Suspense>
  );
};
