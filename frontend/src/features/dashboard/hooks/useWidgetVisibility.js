import { useState, useCallback, useEffect } from "react";

const DEFAULT_WIDGETS = {
  quickStats: true,
  financialSummary: true,
  performanceMetrics: true,
  vehicleOperations: true,
  instructorPerformance: true,
  trendsForecasts: true,
  advancedCharts: true,
};

const STORAGE_KEY = "overview-dashboard-widgets";

export function useWidgetVisibility() {
  const [widgets, setWidgets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const toggleWidget = useCallback((widgetKey) => {
    setWidgets((prev) => {
      const updated = { ...prev, [widgetKey]: !prev[widgetKey] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save widget preferences:", e);
      }
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to reset widget preferences:", e);
    }
  }, []);

  const isWidgetVisible = useCallback((widgetKey) => {
    return widgets[widgetKey] !== false;
  }, [widgets]);

  return { widgets, toggleWidget, resetToDefaults, isWidgetVisible };
}
