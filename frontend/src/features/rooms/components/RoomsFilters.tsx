"use client";

import { todayISO } from "../../../lib/dates";

type RoomsFiltersProps = {
  checkIn: string;
  checkOut: string;
  onlyAvail: boolean;
  onChange: (next: Partial<{ checkIn: string; checkOut: string; onlyAvail: boolean }>) => void;
};

export default function RoomsFilters({
  checkIn,
  checkOut,
  onlyAvail,
  onChange,
}: RoomsFiltersProps) {
  const minCheckIn = todayISO();
  const minCheckOut = checkIn || minCheckIn;

  return (
    <div className="w-full rounded-2xl border p-4 md:p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Check-in</span>
          <input
            type="date"
            className="rounded-xl border px-3 py-2"
            value={checkIn}
            min={minCheckIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Check-out</span>
          <input
            type="date"
            className="rounded-xl border px-3 py-2"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2 md:justify-center">
          <input
            type="checkbox"
            className="size-4"
            checked={onlyAvail}
            onChange={(e) => onChange({ onlyAvail: e.target.checked })}
          />
          <span className="text-sm">Only show available</span>
        </label>

        <div className="flex md:justify-end">
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => onChange({ checkIn: "", checkOut: "", onlyAvail: false })}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
