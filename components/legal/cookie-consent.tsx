"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CONSENT_VERSION = "1";
const CONSENT_KEY = "addify-consent";

type ConsentData = {
  version: string;
  essential: true;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        checked ? "bg-accent" : "bg-border"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

type ModalProps = {
  analytics: boolean;
  advertising: boolean;
  onAnalytics: (v: boolean) => void;
  onAdvertising: (v: boolean) => void;
  onSave: () => void;
  onClose: () => void;
};

function CustomizeModal({ analytics, advertising, onAnalytics, onAdvertising, onSave, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl shadow-hover p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">Cookie preferences</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Essential</p>
              <p className="text-xs text-muted-foreground mt-0.5">Required for the site to work. Cannot be turned off.</p>
            </div>
            <Toggle checked disabled />
          </div>

          <div className="flex items-start justify-between gap-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground mt-0.5">Helps us understand which pages are useful and where things break.</p>
            </div>
            <Toggle checked={analytics} onChange={onAnalytics} />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Advertising</p>
              <p className="text-xs text-muted-foreground mt-0.5">Used by ad partners like Google AdSense to show relevant ads.</p>
            </div>
            <Toggle checked={advertising} onChange={onAdvertising} />
          </div>
        </div>

        <button
          onClick={onSave}
          className="mt-6 w-full py-2.5 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const data: ConsentData = JSON.parse(stored);
        if (data.version === CONSENT_VERSION) return;
      }
    } catch {
      // corrupted storage — show banner
    }
    setVisible(true);
  }, []);

  function save(analyticsChoice: boolean, advertisingChoice: boolean) {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      essential: true,
      analytics: analyticsChoice,
      advertising: advertisingChoice,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setVisible(false);
    setShowModal(false);
  }

  function acceptAll() { save(true, true); }
  function rejectNonEssential() { save(false, false); }
  function saveCustom() { save(analytics, advertising); }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-[0_8px_40px_-8px_rgba(10,22,40,0.2)] p-5 md:p-6">
              <p className="text-sm font-semibold text-foreground mb-1">We use cookies to improve Addify.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Essential cookies keep the site working. Optional cookies help us understand usage and show relevant ads.
                You can change your choice anytime in{" "}
                <Link href="/privacy" className="text-accent underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Accept all
                </button>
                <button
                  onClick={rejectNonEssential}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                >
                  Reject non-essential
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <CustomizeModal
          analytics={analytics}
          advertising={advertising}
          onAnalytics={setAnalytics}
          onAdvertising={setAdvertising}
          onSave={saveCustom}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export function CookieSettingsLink() {
  function reopen() {
    try { localStorage.removeItem("addify-consent"); } catch { /* ignore */ }
    window.location.reload();
  }

  return (
    <button
      onClick={reopen}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Cookie settings
    </button>
  );
}
