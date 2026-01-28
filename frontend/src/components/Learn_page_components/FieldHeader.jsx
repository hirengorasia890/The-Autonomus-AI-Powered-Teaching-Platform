import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiClock, FiBarChart2 } from "react-icons/fi";
import SessionStatusBulb from "./SessionStatusBulb";
import { backend_url } from "../../config";

// ================= UPDATE SESSION MODAL =================
const UpdateSessionModal = ({ open, onClose, field, colorMode, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [error, setError] = useState(null);

    const isDark = colorMode === "dark";

    // Fetch current schedule when modal opens
    useEffect(() => {
        if (!open || !field) return;

        const fetchSchedule = async () => {
            setLoading(true);
            setError(null);

            try {
                const ctx = JSON.parse(localStorage.getItem("learn_session_context") || "{}");
                if (!ctx?.user_id) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${backend_url}/api/schedule-time?user_id=${ctx.user_id}&field=${encodeURIComponent(field)}`
                );
                const data = await res.json();

                if (data.status === "success") {
                    setStartTime(data.start_time || "");
                    setEndTime(data.end_time || "");
                } else {
                    setError(data.detail || "Failed to load schedule");
                }
            } catch (e) {
                console.error("Schedule fetch error:", e);
                setError("Failed to load schedule");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [open, field]);

    // Handle update
    const handleUpdate = async () => {
        if (!startTime || !endTime) {
            setError("Please set both start and end time");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const ctx = JSON.parse(localStorage.getItem("learn_session_context") || "{}");

            const res = await fetch(`${backend_url}/schedule_update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: ctx.user_id,
                    field: field,
                    start_time: startTime,
                    end_time: endTime
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                onSuccess(`${field} Session updated`);
                onClose();
            } else {
                setError(data.detail || "Update failed");
            }
        } catch (e) {
            console.error("Schedule update error:", e);
            setError("Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Handle ESC key
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-[380px] max-w-[90vw] rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"
                            }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                            }`}>
                            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                                <FiClock className="text-blue-500" />
                                Update Session Time
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-1.5 rounded-full transition-colors ${isDark
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent mb-3" />
                                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>Loading schedule...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Field (readonly) */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                            Field
                                        </label>
                                        <input
                                            type="text"
                                            value={field}
                                            disabled
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDark
                                                ? "bg-gray-700/50 text-gray-400 border border-gray-600"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                                }`}
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDark
                                                ? "bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                                                : "bg-white text-gray-800 border border-gray-300 focus:border-blue-500"
                                                } outline-none transition-colors`}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg text-sm ${isDark
                                                ? "bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                                                : "bg-white text-gray-800 border border-gray-300 focus:border-blue-500"
                                                } outline-none transition-colors`}
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <p className="text-red-500 text-sm text-center">{error}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!loading && (
                            <div className={`px-5 py-4 border-t flex gap-3 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                                }`}>
                                <button
                                    onClick={onClose}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${isDark
                                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update"
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ================= POPUP NOTIFICATION =================
const PopupNotification = ({ show, message, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 
                        bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl
                        flex items-center gap-3 min-w-[280px]"
                >
                    <span className="text-xl">✓</span>
                    <span className="font-medium">{message}</span>
                    <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">✕</button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ================= MAIN FIELD HEADER COMPONENT =================
const FieldHeader = ({
    activeField,
    sessionStatus,
    sessionActive,
    onStartSession,
    colorMode,
    onOpenProgress // For responsive - opens progress sidebar/modal
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [popup, setPopup] = useState({ show: false, message: "" });
    const menuRef = useRef(null);

    const isDark = colorMode === "dark";

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!activeField) return null;

    const handleUpdateSuccess = (message) => {
        setPopup({ show: true, message });
    };

    return (
        <>
            <PopupNotification
                show={popup.show}
                message={popup.message}
                onClose={() => setPopup({ show: false, message: "" })}
            />

            <UpdateSessionModal
                open={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                field={activeField}
                colorMode={colorMode}
                onSuccess={handleUpdateSuccess}
            />

            <div className={`sticky top-0 z-30 backdrop-blur-sm border-b ${isDark
                ? "bg-gray-900/95 border-gray-700"
                : "bg-white/95 border-gray-200"
                }`}>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Session Status Bulb */}
                        <SessionStatusBulb status={sessionStatus} />

                        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            {activeField}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Start Session Button */}
                        <button
                            onClick={onStartSession}
                            disabled={sessionActive}
                            className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-lg transition-all ${sessionActive
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:-translate-y-1 hover:shadow-xl"
                                }
                                ${isDark
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                        >
                            <span className="hidden sm:inline">{sessionActive ? "🟢 Session Active" : "▶️ Start Session"}</span>
                            <span className="sm:hidden">{sessionActive ? "🟢 Active" : "▶️ Start"}</span>
                        </button>

                        {/* Hamburger Menu Button */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`p-2.5 rounded-lg transition-all ${isDark
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                                title="Session Options"
                            >
                                <FiMenu className="w-5 h-5" />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 ${isDark
                                            ? "bg-gray-800 border-gray-700"
                                            : "bg-white border-gray-200"
                                            }`}
                                    >
                                        {/* Update Session */}
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setShowUpdateModal(true);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${isDark
                                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                }`}
                                        >
                                            <FiClock className="text-blue-500" />
                                            Update Session
                                        </button>

                                        {/* View Progress - Only visible on mobile */}
                                        {onOpenProgress && (
                                            <button
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    onOpenProgress();
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors md:hidden ${isDark
                                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                                    }`}
                                            >
                                                <FiBarChart2 className="text-green-500" />
                                                View Progress
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FieldHeader;
