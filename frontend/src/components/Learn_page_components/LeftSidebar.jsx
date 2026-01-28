// LumosAI_frontend/src/components/Learn_page_components/LeftSidebar.jsx
import React, { useState } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiChevronLeft,
    FiFolder,
    FiBookOpen,
} from "react-icons/fi";
import { backend_url } from "../../config";

const SESSION_KEY = "learn_session_context";

const getSessionContext = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
};

const saveSessionContext = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export default function LeftSidebar({
    tree = [],
    activeField,
    setLearningTree,
    activeDay,
    activeTopic,
    onSelectField,
    onSelectTopic,
    onDayExpand,
    onDayIntroLoad,
    fetchIntroRoadmapSessionData,
    collapsed,
    onToggleCollapse,
    colorMode,
    setContentBlocks, // For clearing content on session switch
    onAddField, // Callback to open FieldForm modal
}) {
    const [openSessions, setOpenSessions] = useState({});
    const [loadingSession, setLoadingSession] = useState(null); // Track loading session
    const [sessionDataCache, setSessionDataCache] = useState({}); // Cache session data

    // Toggle session expansion
    const toggleSession = async (fieldName, sessionId, sessionDay) => {
        const key = `${fieldName}_${sessionId}`;

        // If opening for first time → fetch topics
        if (!openSessions[key]) {
            await fetchTopicsForSession(fieldName, sessionId);
        }

        setOpenSessions((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Fetch topics for a session from API
    const fetchTopicsForSession = async (fieldName, sessionId) => {

        try {
            const context = getSessionContext();
            if (!context?.user_id) return;

            const params = new URLSearchParams({
                user_id: context.user_id,
                field: fieldName,
                session_id: sessionId,
            });

            const response = await fetch(
                `${backend_url}/leftside/topic?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(`Topic API failed: ${response.status}`);
            }

            const result = await response.json();

            if (!Array.isArray(result.data)) return;

            // Update learning tree with topics
            setLearningTree((prevTree) =>
                prevTree.map((field) =>
                    field.field !== fieldName
                        ? field
                        : {
                            ...field,
                            sessions: (field.sessions || []).map((session) =>
                                session.session_id !== sessionId
                                    ? session
                                    : {
                                        ...session,
                                        topics: result.data.map((topic, idx) => ({
                                            id: `${sessionId}_${idx}`,
                                            title: topic,
                                            isIntro:
                                                topic.toLowerCase().includes("intro") ||
                                                topic.toLowerCase().includes("roadmap"),
                                        })),
                                    }
                            ),
                        }
                )
            );
        } catch (err) {
            console.error("❌ Topic fetch error:", err);
        }
    };

    // Handle session click - load intro/roadmap data with caching
    const handleSessionClick = async (fieldName, session) => {
        const ctx = getSessionContext();
        const cacheKey = `${fieldName}_${session.session_id}`;

        // Update session context
        saveSessionContext({
            ...ctx,
            field: fieldName,
            session_id: session.session_id,
        });

        // Check if session data is already cached
        if (sessionDataCache[cacheKey]) {
            // Use cached content - no need to clear and refetch
            return;
        }

        // Set loading state
        setLoadingSession(session.session_id);

        // Clear current content before loading new session  
        if (setContentBlocks) {
            setContentBlocks([]);
        }

        // Call parent handler to fetch session data
        if (fetchIntroRoadmapSessionData) {
            try {
                await fetchIntroRoadmapSessionData(session.session_id);
                // Cache this session as loaded
                setSessionDataCache(prev => ({
                    ...prev,
                    [cacheKey]: true
                }));
            } catch (err) {
                console.error("❌ Error loading session data:", err);
            }
        }

        // Clear loading state
        setLoadingSession(null);
    };

    // Handle topic click
    const handleTopicClick = (session, topic) => {
        if (onSelectTopic) {
            onSelectTopic(session, topic);
        }
    };

    return (
        <div
            className={`relative h-screen border-r transition-[width] duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${colorMode === "dark"
                    ? "bg-gray-900 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                }
      `}
        >
            {/* HEADER */}
            <div className="px-3 py-3 text-xs font-semibold uppercase text-gray-400 flex items-center justify-between">
                {!collapsed && "Learning"}
                {collapsed && "Learning"}
                {/* ADD FIELD BUTTON */}
                {/* {!collapsed && (
                    <button
                        onClick={onAddField}
                        className={`p-1.5 rounded-lg transition-all hover:scale-105 ${colorMode === "dark"
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        title="Add New Field"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )} */}
            </div>

            {/* FIELD NAMES (when collapsed - for responsive) */}
            {/* {collapsed && (
                <div className="flex justify-center px-2 py-2 space-y-2">
                    {tree.map((field) => {
                        const isFieldOpen = activeField === field.field;
                        const isDark = colorMode === "dark";
                        return (
                            <button
                                key={field.field}
                                // onClick={() => onSelectField(field.field)}
                                onClick={onAddField}
                                className={`flex items-center justify-center px-2 py-2 rounded text-xs font-medium truncate
                                    ${isFieldOpen
                                        ? isDark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                                        : isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-200 text-gray-700"
                                    }`}
                                title={field.field}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        );
                    })}
                </div>
            )} */}

            {/* TREE */}
            <div className="overflow-y-auto h-[calc(100vh-100px)] px-1">
                {tree.map((field) => {
                    const isFieldOpen = activeField === field.field;
                    const isDark = colorMode === "dark";

                    return (
                        <div key={field.field} className="mb-2">
                            {/* FIELD - Prominent styling */}
                            <button
                                onClick={() => onSelectField(field.field)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium mt-4
                  ${isFieldOpen
                                        ? isDark ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-800 border border-blue-200"
                                        : isDark ? "hover:bg-gray-800 text-gray-200" : "hover:bg-gray-200 text-gray-700"
                                    }
                `}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {!collapsed && <FiFolder className="w-4 h-4" />}
                                    {collapsed && <span>•</span>}
                                    <span className="font-semibold">{field.field}</span>
                                </div>
                                {!collapsed &&
                                    (isFieldOpen ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />)}
                            </button>

                            {/* SESSIONS - Compact styling */}
                            {isFieldOpen && !collapsed && (
                                <div className="ml-3 mt-1.5 space-y-1">
                                    {(field.sessions || []).map((session) => {
                                        const sessionKey = `${field.field}_${session.session_id}`;
                                        const isSessionOpen = openSessions[sessionKey];
                                        const ctx = getSessionContext();
                                        const isActiveSession = ctx?.session_id === session.session_id;
                                        const isLoading = loadingSession === session.session_id;

                                        return (
                                            <div key={sessionKey}>
                                                {/* SESSION HEADER - Compact pill style */}
                                                <button
                                                    onClick={() => handleSessionClick(field.field, session)}
                                                    disabled={isLoading}
                                                    className={`
                            group w-full flex items-center justify-between
                            px-2.5 py-1.5
                            text-[11px] font-medium
                            border rounded-md
                            transition-all duration-200
                            ${isLoading ? "opacity-70 cursor-wait" : ""}
                            ${isActiveSession
                                                            ? "bg-blue-500/90 border-blue-500 text-white shadow-sm"
                                                            : isDark
                                                                ? "bg-gray-800/50 border-gray-600 hover:bg-gray-800 hover:border-blue-400/60 text-gray-300"
                                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-400 text-gray-600"
                                                        }
                          `}
                                                >
                                                    {/* LEFT: Session Day text - handle loading state */}
                                                    <span className="select-none flex items-center gap-2">
                                                        {isLoading && (
                                                            <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                        )}
                                                        {session.session_day
                                                            ? session.session_day
                                                            : session.isLoading
                                                                ? "⏳ Loading..."
                                                                : "📅 New Session"}
                                                    </span>

                                                    {/* RIGHT: Arrow box for expanding topics - smaller */}
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSession(field.field, session.session_id, session.session_day);
                                                        }}
                                                        className={`
                              ml-2 flex items-center justify-center
                              w-5 h-5
                              rounded
                              border
                              transition-all
                              cursor-pointer
                              ${isDark
                                                                ? "bg-gray-700/50 border-gray-600 group-hover:bg-gray-700 group-hover:border-blue-400/60"
                                                                : "bg-gray-100 border-gray-200 group-hover:bg-gray-200 group-hover:border-blue-400"
                                                            }
                            `}
                                                    >
                                                        <FiChevronDown
                                                            className={`text-[10px] transition-transform ${isSessionOpen ? "rotate-180" : ""} ${isDark ? "text-gray-400" : "text-gray-500"
                                                                }`}
                                                        />
                                                    </span>
                                                </button>

                                                {/* TOPICS - Balanced medium size */}
                                                {isSessionOpen && (
                                                    <div className={`mt-1 ml-1 rounded border-l-2 pl-2 py-1 ${isDark ? "border-gray-600" : "border-gray-200"
                                                        }`}>
                                                        {(session.topics || []).length === 0 ? (
                                                            <div className={`px-2 py-1.5 text-[11px] italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                                No topics yet
                                                            </div>
                                                        ) : (
                                                            (session.topics || []).map((topic, index) => (
                                                                <div key={topic.id || `${session.session_id}_${index}`}>
                                                                    {/* TOPIC - Medium balanced styling */}
                                                                    <div
                                                                        onClick={() => handleTopicClick(session, topic)}
                                                                        className={`px-2 py-1.5 text-[11px] rounded cursor-pointer transition-colors ${activeTopic?.id === topic.id
                                                                            ? isDark ? "bg-blue-500/20 text-blue-300 border-l-2 border-blue-400 -ml-[2px] pl-[10px]" : "bg-blue-50 text-blue-600 border-l-2 border-blue-400 -ml-[2px] pl-[10px]"
                                                                            : isDark ? "hover:bg-gray-800/50 text-gray-300" : "hover:bg-gray-100 text-gray-600"
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-1.5">
                                                                            <FiBookOpen className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                                                            <span className="truncate">{topic.title}</span>
                                                                        </div>
                                                                    </div>
                                                                    {/* HORIZONTAL LINE (except last item) */}
                                                                    {index !== (session.topics || []).length - 1 && (
                                                                        <div className={`mx-3 border-b opacity-60 ${isDark ? "border-gray-600" : "border-gray-300"}`} />
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* COLLAPSE BUTTON */}
            <button
                onClick={onToggleCollapse}
                className="absolute top-1/2 -right-3 bg-blue-600 text-white p-2 rounded-full shadow-lg"
            >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
        </div>
    );
}
