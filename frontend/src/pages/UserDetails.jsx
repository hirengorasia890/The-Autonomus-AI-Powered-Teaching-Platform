// User Details page - Shows profile from API
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiEdit2, FiUser, FiMail, FiPhone, FiCalendar, FiBook } from "react-icons/fi";
import { backend_url } from "../config";

export default function UserDetails() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [colorMode, setColorMode] = useState(() => {
        return localStorage.getItem("colorMode") || "dark";
    });

    useEffect(() => {
        const fetchProfile = async () => {
            // Get user_id from session context or currentUser
            const sessionContext = JSON.parse(localStorage.getItem("learn_session_context") || "{}");
            const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
            const user_id = sessionContext?.user_id || currentUser?.user_id;

            if (!user_id) {
                navigate("/login");
                return;
            }

            try {
                const res = await fetch(`${backend_url}/user-profile?user_id=${user_id}`);
                const data = await res.json();

                if (data.status === "error") {
                    setError(data.message || "Failed to load profile");
                } else {
                    setProfile(data);
                }
            } catch (e) {
                console.error("❌ Profile fetch error:", e);
                setError("Failed to load profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const isDark = colorMode === "dark";

    // Loading state
    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/learn")}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-100 via-white to-gray-100"}`}>
            {/* Header */}
            <div className={`sticky top-0 z-50 ${isDark ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"} border-b backdrop-blur-sm`}>
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/learn")}
                        className={`flex items-center gap-2 ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition`}
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        <span>Back to Learning</span>
                    </button>

                    <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        My Profile
                    </h1>

                    <div className="w-24"></div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-2xl p-8 ${isDark
                        ? "bg-gray-800/50 border border-gray-700 shadow-xl"
                        : "bg-white border border-gray-200 shadow-lg"}`}
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDark ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-cyan-400 to-blue-500"}`}>
                            <FiUser className="w-12 h-12 text-white" />
                        </div>
                        <h2 className={`mt-4 text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {profile?.name || "User"}
                        </h2>
                        <span className={`mt-1 px-3 py-1 rounded-full text-sm ${isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
                            {profile?.category || "Learner"}
                        </span>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-4">
                        <ProfileField
                            icon={<FiMail />}
                            label="Email"
                            value={profile?.email || "Not provided"}
                            isDark={isDark}
                        />

                        <ProfileField
                            icon={<FiPhone />}
                            label="Phone"
                            value={profile?.phone || "Not provided"}
                            isDark={isDark}
                        />

                        <ProfileField
                            icon={<FiCalendar />}
                            label="Date of Birth"
                            value={profile?.dob || "Not provided"}
                            isDark={isDark}
                        />

                        <ProfileField
                            icon={<FiBook />}
                            label="Category"
                            value={profile?.category || "Not specified"}
                            isDark={isDark}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4 justify-center">
                        <button
                            onClick={() => navigate("/learn")}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                ? "bg-gray-700 text-white hover:bg-gray-600"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                        >
                            Back to Learning
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Profile Field Component
const ProfileField = ({ icon, label, value, isDark }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}>
        <div className={`p-3 rounded-lg ${isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"}`}>
            {icon}
        </div>
        <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
        </div>
    </div>
);
