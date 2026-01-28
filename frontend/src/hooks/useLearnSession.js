import { useState, useCallback } from "react";
import { backend_url } from "../config";
import { getSessionContext, saveSessionContext, buildLearningTreeFromAPI } from "../utils/learnHelpers";

export const useLearnSession = () => {
    // Session state
    const [sessionStatus, setSessionStatus] = useState("red"); // red, blue, green
    const [sessionActive, setSessionActive] = useState(false);
    const [introActive, setIntroActive] = useState(false);
    const [dailyActive, setDailyActive] = useState(false);

    // Popup state
    const [popup, setPopup] = useState({ show: false, type: "", message: "" });

    // New session modal state
    const [showNewSessionModal, setShowNewSessionModal] = useState(false);
    const [pendingSessionData, setPendingSessionData] = useState(null);

    // Popup helpers
    const showPopup = (type, message) => {
        setPopup({ show: true, type, message });
    };

    const closePopup = () => {
        setPopup({ show: false, type: "", message: "" });
    };

    // Fetch session status
    const fetchSessionStatus = useCallback(async () => {
        const ctx = getSessionContext();
        if (!ctx?.user_id || !ctx?.field || !ctx?.session_id) return;

        try {
            const res = await fetch(
                `${backend_url}/api/session/status?user_id=${ctx.user_id}&field=${ctx.field}&session_id=${ctx.session_id}`
            );
            if (!res.ok) return;

            const data = await res.json();
            setSessionStatus(data.status || "red");
            setIntroActive(data.intro_active || false);
            setDailyActive(data.lesson_active || false);
            setSessionActive(data.intro_active || data.lesson_active);
        } catch (e) {
            console.error("❌ Session status fetch error:", e);
        }
    }, []);

    // Start session
    const handleStartSession = async () => {
        const ctx = getSessionContext();
        if (!ctx?.user_id || !ctx?.field || !ctx?.session_id) return;

        try {
            const res = await fetch(`${backend_url}/api/user/ready`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: ctx.user_id,
                    field: ctx.field,
                    session_id: ctx.session_id,
                }),
            });

            const data = await res.json();

            if (data.status === "error") {
                showPopup("error", data.message || "No active session available.");
            } else if (data.status === "info") {
                showPopup("info", data.message || "Intro session is active. Please wait for daily session.");
            } else if (data.status === "success") {
                showPopup("success", data.message || "Session started! Lessons will appear shortly.");
                setSessionActive(true);
            }
        } catch (e) {
            console.error("❌ Start session error:", e);
            showPopup("error", "Failed to start session. Please try again.");
        }
    };

    // End session
    const endSession = async () => {
        const ctx = getSessionContext();
        if (!ctx?.user_id || !ctx?.field || !ctx?.session_id) return;

        try {
            await fetch(`${backend_url}/api/action/end-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: ctx.user_id,
                    field: ctx.field,
                    session_id: ctx.session_id,
                }),
            });

            showPopup("info", "Session ended. Your progress has been saved! ✅");
            setSessionActive(false);
        } catch (e) {
            console.error("❌ End session error:", e);
        }
    };

    // Handle new session accept
    const handleNewSessionAccept = async (setLearningTree) => {
        if (!pendingSessionData) return;

        const { user_id, field, session_id } = pendingSessionData;
        const ctx = getSessionContext();

        // Update session context with new session_id
        saveSessionContext({
            ...ctx,
            user_id: user_id,
            field: field,
            session_id: session_id,
        });

        try {
            const res = await fetch(`${backend_url}/leftside/details?user_id=${user_id}`);
            const result = await res.json();

            if (result.status === "success" && result.data) {
                const tree = buildLearningTreeFromAPI(result.data);

                // Find field and check if new session already exists
                const fieldIndex = tree.findIndex(f => f.field === field);

                if (fieldIndex !== -1) {
                    const existingSession = tree[fieldIndex].sessions.find(
                        s => s.session_id === session_id
                    );

                    if (!existingSession) {
                        tree[fieldIndex].sessions.push({
                            session_day: null,
                            session_id: session_id,
                            topics: [],
                            isLoading: true,
                        });
                    }
                } else {
                    tree.push({
                        field: field,
                        sessions: [{
                            session_day: null,
                            session_id: session_id,
                            topics: [],
                            isLoading: true,
                        }]
                    });
                }

                setLearningTree(tree);
            }
        } catch (err) {
            console.error("Failed to fetch leftside details:", err);
        }

        setSessionActive(true);
        setDailyActive(true);
        setSessionStatus("green");
        setShowNewSessionModal(false);
        setPendingSessionData(null);

        return field;
    };

    return {
        // State
        sessionStatus,
        setSessionStatus,
        sessionActive,
        setSessionActive,
        introActive,
        setIntroActive,
        dailyActive,
        setDailyActive,
        popup,
        showNewSessionModal,
        setShowNewSessionModal,
        pendingSessionData,
        setPendingSessionData,

        // Actions
        showPopup,
        closePopup,
        fetchSessionStatus,
        handleStartSession,
        endSession,
        handleNewSessionAccept,
    };
};

export default useLearnSession;
