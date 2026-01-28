// frontend/src/components/FieldForm.jsx
import React, { useState, useEffect } from "react";
import { USER_TIMEZONES } from "../utils/userTimezones"

// Get browser's default timezone and ensure it's a valid option
const getDefaultTimezone = () => {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Check if browser timezone exists in our list, otherwise use first available
  if (USER_TIMEZONES && USER_TIMEZONES.includes(browserTimezone)) {
    return browserTimezone;
  }
  // Fallback to Asia/Kolkata (same as Asia/Calcutta) or first in list
  if (USER_TIMEZONES && USER_TIMEZONES.length > 0) {
    return USER_TIMEZONES.includes("Asia/Kolkata") ? "Asia/Kolkata" : USER_TIMEZONES[0];
  }
  return "Asia/Kolkata"; // Ultimate fallback
};

export default function FieldForm({
  theme = "light",
  submitText = "Select Field",
  button_text = "Submit",
  onSubmit,
  showClose = false,
  onClose,
  initialData = {},
  containerClass = "",   // ✅ NEW
}) {

  const isDark = theme === "dark";
  const [timezone, setTimezone] = useState(initialData.timezone || getDefaultTimezone());



  // ✅ SAFE state initialization
  const [branch, setBranch] = useState(initialData.branch || "");
  const [field, setField] = useState(initialData.field || "");
  const [fromTime, setFromTime] = useState(initialData.fromTime || "00:00");
  const [toTime, setToTime] = useState(initialData.toTime || "00:00");
  const [error, setError] = useState("");

  // Auto set start time (only if empty)
  // useEffect(() => {
  //   if (!initialData.fromTime) {
  //     const now = new Date().toISOString().slice(11, 16);
  //     setFromTime(now);
  //   }
  // }, [initialData.fromTime]);

  const validate = () => {
    if (!branch) return "Please select category.";
    if (!field.trim()) return "Please enter field.";

    const [fh, fm] = fromTime.split(":").map(Number);
    const [th, tm] = toTime.split(":").map(Number);

    const start = fh * 60 + fm;
    const end = th * 60 + tm;

    if (end <= start) return "End time must be after start time.";
    if (end - start > 60) return "Session cannot be more than 1 hour.";

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    onSubmit({
      branch,
      field: field.trim(),
      timezone,
      fromTime,
      toTime,
    });
  };

  const bg = isDark ? "bg-gray-800 text-white" : "bg-white text-black";
  const inputBg = isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-black";

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${containerClass || `rounded-xl shadow-xl ${bg} p-6 w-full max-w-md`}`}
    >

      {/* ✅ CLOSE BUTTON (ONLY WHEN NEEDED) */}
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 px-3 py-1 text-2xl text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      )}

      <h2 className="text-xl font-bold mb-4">{submitText}</h2>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm mb-1 text-gray-300 text-left">
          Category
        </label>
        <select
          className={`${inputBg} p-2 rounded w-full`}
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="" hidden>
            Select Category
          </option>
          <option value="Technical">Technical</option>
          <option value="Non-Technical">Non-Technical</option>
        </select>
      </div>

      {/* Field */}
      <div className="mb-4">
        <label className="block mb-1 text-left">Field</label>
        <input
          className={`${inputBg} p-2 rounded w-full`}
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="Enter field"
        />
      </div>

      {/* Timezone */}
      <div className="mb-4 text-left">
        <label className="block text-sm mb-1 text-gray-300">
          Select Timezone
        </label>

        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        >
          {USER_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>


      {/* Time */}
      <div className="flex gap-3 mb-4">
        <div className="w-full">
          <label className="block mb-1 text-left">From</label>
          <input
            type="time"
            className={`${inputBg} p-2 rounded w-full`}
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
        </div>
        <div className="w-full">
          <label className="block mb-1 text-left">To</label>
          <input
            type="time"
            className={`${inputBg} p-2 rounded w-full`}
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        {button_text}
      </button>
    </form>
  );
}
