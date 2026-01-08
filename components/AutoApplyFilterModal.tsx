"use client";

import { useState } from "react";

export default function AutoApplyFilterModal({
  open,
  onClose,
  onProceed,
}: {
  open: boolean;
  onClose: () => void;
  onProceed: (filters: any) => void;
}) {
  const [filters, setFilters] = useState<any>(() => {
    if (typeof window === "undefined") return {
      keywords: [],
      location: "",
      period: "",
      easyApplyOnly: true
    };

    return (
      JSON.parse(localStorage.getItem("autoApplyFilters") || "null") || {
        keywords: [],
        location: "",
        period: "",
        easyApplyOnly: true
      }
    );
  });

  if (!open) return null;

  const update = (k: string, v: any) =>
    setFilters((p: any) => ({ ...p, [k]: v }));

  const proceed = () => {
    // 🛑 Hard validation
    if (!filters.keywords?.length || !filters.location) {
      alert("Keywords and location are required");
      return;
    }

    // Persist
    localStorage.setItem("autoApplyFilters", JSON.stringify(filters));

    // 🚀 Send clean filters to parent
    onProceed({
      keywords: filters.keywords,      // array
      location: filters.location,      // string
      period: filters.period || "",    // r86400 | r604800 | ""
      easyApplyOnly: !!filters.easyApplyOnly
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[420px]">
        <h2 className="text-xl font-bold mb-4">Auto-Apply Filters</h2>

        <input
          className="w-full border p-2 rounded mb-2"
          placeholder="Keywords (comma separated)"
          defaultValue={filters.keywords?.join(", ")}
          onChange={(e) =>
            update(
              "keywords",
              e.target.value
                .split(",")
                .map(k => k.trim())
                .filter(Boolean)
            )
          }
        />

        <input
          className="w-full border p-2 rounded mb-2"
          placeholder="Location"
          defaultValue={filters.location}
          onChange={(e) => update("location", e.target.value)}
        />

        <select
          className="w-full border p-2 rounded mb-2"
          value={filters.period}
          onChange={(e) => update("period", e.target.value)}
        >
          <option value="">Any time</option>
          <option value="r86400">Past 24 hours</option>
          <option value="r604800">Past week</option>
        </select>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={filters.easyApplyOnly}
            onChange={(e) => update("easyApplyOnly", e.target.checked)}
          />
          Easy Apply only
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={proceed}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
