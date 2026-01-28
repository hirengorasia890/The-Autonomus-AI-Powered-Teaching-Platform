// ================= CONSTANTS =================
export const SESSION_KEY = "learn_session_context";
export const LEARN_TOPIC_CACHE_KEY = "learn_topic_cache";

// ================= SESSION CONTEXT HELPERS =================
export const getSessionContext = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
};

export const saveSessionContext = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

// ================= TOPIC HELPERS =================
export const normalizeTopicKey = (topic = "") =>
    topic.toLowerCase().replace(/\s+/g, "_").trim();

export const setTopicContentCache = (field, sessionId, topic, content, day) => {
    const cache = JSON.parse(localStorage.getItem(LEARN_TOPIC_CACHE_KEY) || "{}");
    const key = normalizeTopicKey(topic);
    cache[key] = content;
    localStorage.setItem(LEARN_TOPIC_CACHE_KEY, JSON.stringify(cache));
};

export const getTopicContentCache = (topic) => {
    const cache = JSON.parse(localStorage.getItem(LEARN_TOPIC_CACHE_KEY) || "{}");
    const key = normalizeTopicKey(topic);
    return cache[key] || null;
};

// ================= ROADMAP FORMATTING =================
export function roadmapTextToMarkdown(text = "") {
    if (!text) return "## 📋 Learning Roadmap\n\nContent not available.";

    const lines = text
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    const formatted = lines.map((line) => {
        const match = line.match(/^(\d+(?:\.\d+)*\.?)\s*(.*)$/);
        if (!match) return line;

        const numberPart = match[1];
        const titlePart = match[2];
        const level = numberPart.split(".").filter(Boolean).length;

        let indent = "";
        if (level === 2) indent = "    ";
        if (level === 3) indent = "        ";
        if (level === 4) indent = "            ";

        return `${indent}${numberPart} ${titlePart}`.trimEnd();
    });

    return "```\n" + formatted.join("\n") + "\n```";
}

// ================= LEARNING TREE HELPERS =================
export const buildLearningTreeFromAPI = (data) => {
    return data.map(fieldData => ({
        field: fieldData.field,
        sessions: (fieldData.sessions || []).map((s, i) => ({
            session_day: s.day || s.session_day || `Session_${String(i + 1).padStart(2, '0')}`,
            session_id: s.session_id,
            topics: (s.topics || []).map((t, idx) => ({
                id: `${s.session_id}_${idx}`,
                title: typeof t === 'string' ? t : t.title,
            }))
        }))
    }));
};

export const updateLearningTree = (prevTree, { field, session_id, session_day, topic, type }) => {
    // Find field
    let fieldIndex = prevTree.findIndex(f => f.field === field);

    if (fieldIndex === -1) {
        // Create new field entry with session
        const newField = {
            field: field,
            sessions: [{
                session_day: session_day || null,
                session_id: session_id,
                topics: topic ? [{ id: `${session_id}_0`, title: topic }] : [],
                isLoading: false,
            }]
        };
        return [...prevTree, newField];
    }

    const updatedTree = [...prevTree];
    const fieldData = { ...updatedTree[fieldIndex] };
    const sessions = [...(fieldData.sessions || [])];

    // Find session by session_id
    let sessionIndex = sessions.findIndex(s => s.session_id === session_id);

    if (sessionIndex === -1) {
        // session_id doesn't match any existing → CREATE NEW session
        sessions.push({
            session_day: session_day || null,
            session_id: session_id,
            topics: topic ? [{ id: `${session_id}_0`, title: topic }] : [],
            isLoading: false,
        });
    } else {
        // session_id MATCHES → MERGE into existing session
        const sessionData = { ...sessions[sessionIndex] };

        // Update session_day if provided
        if (session_day) {
            sessionData.session_day = session_day;
        }

        // Add topic if provided and not already exists
        const topics = [...(sessionData.topics || [])];
        if (topic && !topics.some(t => t.title === topic)) {
            topics.push({
                id: `${session_id}_${topics.length}`,
                title: topic
            });
        }

        sessionData.topics = topics;
        sessionData.isLoading = false;
        sessions[sessionIndex] = sessionData;
    }

    fieldData.sessions = sessions;
    updatedTree[fieldIndex] = fieldData;
    return updatedTree;
};

// ================= SESSION DAY HELPERS =================

/**
 * Find session_day from learning tree by session_id
 */
export const getSessionDayFromTree = (tree, field, sessionId) => {
    if (!tree || !Array.isArray(tree)) return null;

    const fieldData = tree.find(f => f.field === field);
    if (!fieldData?.sessions) return null;

    const session = fieldData.sessions.find(s => s.session_id === sessionId);
    return session?.session_day || null;
};

/**
 * Fetch session_day from API when not found in tree
 */
export const fetchSessionDayFromAPI = async (userId, field, sessionId, backendUrl) => {
    try {
        const res = await fetch(
            `${backendUrl}/get-session-day?user_id=${userId}&field=${field}&session_id=${sessionId}`
        );
        if (!res.ok) return null;

        const data = await res.json();
        if (data.status === "success") {
            return data.session_day || null;
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch session day:", e);
        return null;
    }
};

// ================= LOGIN EXPIRY HELPERS =================

const LOGIN_TIMESTAMP_KEY = "login_timestamp";
const LOGIN_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Set login timestamp when user logs in
 */
export const setLoginTimestamp = () => {
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
};

/**
 * Get login timestamp
 */
export const getLoginTimestamp = () => {
    const timestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Check if login has expired (12 hours from login time)
 * Returns true if expired, false otherwise
 */
export const checkLoginExpiry = () => {
    const loginTime = getLoginTimestamp();
    if (!loginTime) return false; // No login timestamp means user hasn't logged in

    const currentTime = Date.now();
    const elapsed = currentTime - loginTime;

    return elapsed >= LOGIN_EXPIRY_MS;
};

/**
 * Clear all session data (for logout)
 */
export const clearAllSessionData = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
    localStorage.removeItem(LEARN_TOPIC_CACHE_KEY);
};

// Initialize cache if not exists
if (typeof window !== 'undefined' && !localStorage.getItem(LEARN_TOPIC_CACHE_KEY)) {
    localStorage.setItem(LEARN_TOPIC_CACHE_KEY, JSON.stringify({}));
}
