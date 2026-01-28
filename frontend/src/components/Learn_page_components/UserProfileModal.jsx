import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiTag } from "react-icons/fi";
import { backend_url } from "../../config";
import { getSessionContext } from "../../utils/learnHelpers";

// Format date from YYYY/MM/DD or YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "N/A") return "N/A";
    // Handle both / and - separators
    const parts = dateStr.split(/[\/-]/);
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

export default function UserProfileModal({ open, onClose, colorMode, profileData: preloadedData }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!open) return;

        // Use pre-loaded data if available
        if (preloadedData) {
            setProfileData(preloadedData);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);

            try {
                const ctx = getSessionContext();
                if (!ctx?.user_id) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${backend_url}/user-profile?user_id=${ctx.user_id}`);
                const data = await res.json();

                if (data.status === "error") {
                    setError(data.message || "Failed to load profile");
                } else {
                    setProfileData(data);
                }
            } catch (e) {
                console.error("Profile fetch error:", e);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [open, preloadedData]);

    // Handle ESC key
    useEffect(() => {
        if (!open) return;

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    const isDark = colorMode === "dark";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-[420px] max-w-[90vw] rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"
                            }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                            }`}>
                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                                👤 User Profile
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-colors ${isDark
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4" />
                                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                                        Loading profile...
                                    </p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="text-center py-8">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}

                            {profileData && !loading && (
                                <div className="space-y-4">
                                    {/* Avatar */}
                                    <div className="flex justify-center mb-6">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                                            }`}>
                                            {profileData.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                    </div>

                                    {/* Profile Fields */}
                                    <ProfileField
                                        icon={<FiUser />}
                                        label="Name"
                                        value={profileData.name || "N/A"}
                                        isDark={isDark}
                                    />
                                    <ProfileField
                                        icon={<FiMail />}
                                        label="Email"
                                        value={profileData.last_name || "N/A"}
                                        isDark={isDark}
                                    />
                                    <ProfileField
                                        icon={<FiCalendar />}
                                        label="Date of Birth"
                                        value={formatDate(profileData.dob) || "N/A"}
                                        isDark={isDark}
                                    />
                                    <ProfileField
                                        icon={<FiMail />}
                                        label="Email"
                                        value={profileData.email || "N/A"}
                                        isDark={isDark}
                                    />
                                    <ProfileField
                                        icon={<FiPhone />}
                                        label="Phone"
                                        value={profileData.phone || "N/A"}
                                        isDark={isDark}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 border-t ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
                            }`}>
                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Profile field component
function ProfileField({ icon, label, value, isDark }) {
    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
            <div className={`text-lg ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {label}
                </p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
