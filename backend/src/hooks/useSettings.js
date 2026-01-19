import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/client";
import { saveSettings, loadSettings } from "../utils/settingsStorage";

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    (async () => {
      // 1️⃣ Load cached settings instantly
      const cached = await loadSettings();
      if (cached && mounted.current) {
        setSettings(cached);
      }

      // 2️⃣ Sync with backend
      try {
        const { data } = await api.get("/settings");
        if (mounted.current) {
          setSettings(data);
          saveSettings(data);
        }
      } catch (err) {
        console.warn("Settings sync failed");
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, []);

  const updateSetting = useCallback(async patch => {
    if (!patch || typeof patch !== "object") return;

    let previous;

    setSettings(prev => {
      previous = prev;
      return { ...prev, ...patch };
    });

    try {
      const { data } = await api.put("/settings", patch);
      setSettings(data);
      saveSettings(data);
    } catch (err) {
      console.warn("Setting update failed, rolling back");
      if (previous) {
        setSettings(previous);
        saveSettings(previous);
      }
    }
  }, []);

  return {
    settings,
    loading,
    updateSetting,
  };
}
