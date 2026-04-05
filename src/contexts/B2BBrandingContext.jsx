import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const B2BBrandingContext = createContext(null);

const DEFAULT_BRANDING = {
  name: "Evertrace",
  tagline: "",
  logo_url: "",
  accent_color: "#c9a96e",
  whitelabel_enabled: false,
  plan: "free",
};

export function B2BBrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      base44.entities.FuneralHome.filter({ created_by: u.email }, "-created_date", 1)
        .then(([home]) => {
          if (home) {
            setBranding({
              name: home.name || DEFAULT_BRANDING.name,
              tagline: home.tagline || "",
              logo_url: home.logo_url || "",
              accent_color: home.accent_color || DEFAULT_BRANDING.accent_color,
              whitelabel_enabled: home.whitelabel_enabled || false,
              plan: home.plan || "free",
            });
          }
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }).catch(() => setLoaded(true));
  }, []);

  // Update branding (called from Settings when user saves)
  const updateBranding = (updates) => {
    setBranding(prev => ({ ...prev, ...updates }));
  };

  // CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty("--b2b-accent", branding.accent_color);
    document.documentElement.style.setProperty("--b2b-accent-light", branding.accent_color + "1A");
    document.documentElement.style.setProperty("--b2b-accent-border", branding.accent_color + "4D");
  }, [branding.accent_color]);

  return (
    <B2BBrandingContext.Provider value={{ branding, updateBranding, loaded }}>
      {children}
    </B2BBrandingContext.Provider>
  );
}

export function useB2BBranding() {
  return useContext(B2BBrandingContext);
}