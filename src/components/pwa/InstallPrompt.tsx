"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS] = useState(
    () =>
      typeof window !== "undefined" &&
      !isStandalone() &&
      isIOS() &&
      !window.localStorage.getItem("pwa-install-dismissed"),
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.localStorage.getItem("pwa-install-dismissed")) {
      return;
    }
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (dismissed || (!installEvent && !showIOS)) {
    return null;
  }

  async function install() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
    }
  }

  function dismiss() {
    window.localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:left-auto md:w-[360px]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#34D399]/10 text-[#34D399]">
          {showIOS ? <Share size={18} /> : <Download size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install GoalTracker</p>
          {showIOS ? (
            <p className="mt-1 text-sm leading-6 text-[#A1A1AA]">
              Open Share, then choose Add to Home Screen.
            </p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-[#A1A1AA]">
              Add it to your home screen for a standalone app experience.
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {installEvent && (
          <Button className="flex-1" onClick={install} type="button">
            <Download size={16} />
            Install App
          </Button>
        )}
        <Button
          className={installEvent ? "" : "flex-1"}
          onClick={dismiss}
          type="button"
          variant="secondary"
        >
          Not Now
        </Button>
      </div>
    </div>
  );
}
