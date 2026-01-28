import { useEffect, useRef } from "react";
import { backend_url } from "../config";
import { getSessionContext, saveSessionContext, roadmapTextToMarkdown, updateLearningTree, normalizeTopicKey, LEARN_TOPIC_CACHE_KEY } from "../utils/learnHelpers";

export const useSSEConnection = ({
    setLearningTree,
    setContentBlocks,
    setActiveField,
    setActiveDay,
    setIsNextLoading,
    addToTypingQueue,
    setContentCache,
    // Session handlers from useLearnSession
    setSessionActive,
    setDailyActive,
    setIntroActive,
    setSessionStatus,
    setPendingSessionData,
    setShowNewSessionModal,
    showPopup,
    dailyActive,
    // New: for marking topic completed on session stop
    activeTopicRef,
    // New: for updating username from SSE
    setUserName,
    // New: callback to scroll to new content
    onNewContentArrived,
}) => {
    const sseRef = useRef(null);

    // Track if intro is currently being processed
    const introContentRef = useRef("");
    const pendingRoadmapRef = useRef(null);

    // Track current session_id to detect new sessions
    const currentSessionIdRef = useRef(null);

    // Helper to mark current topic as completed
    const markTopicCompletedOnStop = async () => {
        const ctx = getSessionContext();
        const activeTopic = activeTopicRef?.current;

        if (!ctx?.user_id || !ctx?.field || !activeTopic?.title) return;

        try {
            await fetch(`${backend_url}/api/lesson-view-completed`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: ctx.user_id,
                    field: ctx.field,
                    subtopic: activeTopic.title,
                }),
            });
        } catch (err) {
            console.error("❌ Failed to mark topic completed:", err);
        }
    };

    // Handle Introduction SSE
    const handleIntroductionSSE = (data) => {
        const { user_id, field, session_id, session_day, topic, introduction, name } = data;

        const ctx = getSessionContext();
        if (user_id !== ctx?.user_id || field !== ctx?.field) return;

        // Update username if provided in SSE data
        if (name && setUserName) {
            setUserName(name);
            saveSessionContext({ ...ctx, user_name: name });
        }

        // Detect if this is a NEW session (different session_id)
        const isNewSession = currentSessionIdRef.current && currentSessionIdRef.current !== session_id;

        // Update the tracked session_id
        currentSessionIdRef.current = session_id;

        // Update session context with session_id
        if (!ctx.session_id || ctx.session_id !== session_id) {
            saveSessionContext({ ...ctx, session_id });
        }

        // Update learning tree
        setLearningTree((prevTree) => updateLearningTree(prevTree, {
            field,
            session_id,
            session_day,
            topic: topic || "Introduction and Roadmap",
            type: "INTRO"
        }));

        setActiveField(field);
        setActiveDay(session_day);

        const blockId = `INTRO_${session_id}`;

        // Store intro content for later reference
        introContentRef.current = introduction;

        // If new session, CLEAR content blocks for fresh display
        if (isNewSession) {
            setContentBlocks([{
                id: blockId,
                type: "INTRO",
                session_id: session_id,
                session_day: session_day,
                topic: topic || "Introduction and Roadmap",
                title: `Introduction & Roadmap – ${field}`,
                content: introduction,
                introduction: introduction,
                roadmap: null,
            }]);
        } else {
            // Create or update the INTRO block (same session)
            setContentBlocks((prev) => {
                const existingIntro = prev.find(b => b.type === "INTRO" && b.session_id === session_id);

                if (existingIntro) {
                    return prev.map(b => {
                        if (b.type === "INTRO" && b.session_id === session_id) {
                            return {
                                ...b,
                                content: introduction,
                                introduction: introduction,
                            };
                        }
                        return b;
                    });
                }

                return [{
                    id: blockId,
                    type: "INTRO",
                    session_id: session_id,
                    session_day: session_day,
                    topic: topic || "Introduction and Roadmap",
                    title: `Introduction & Roadmap – ${field}`,
                    content: introduction,
                    introduction: introduction,
                    roadmap: null,
                }];
            });
        }

        // Add intro to typing queue
        addToTypingQueue(blockId, introduction, "", null, "INTRO");

        // Trigger scroll to new content
        if (onNewContentArrived) {
            setTimeout(() => onNewContentArrived(blockId), 100);
        }
    };

    // Handle Roadmap SSE - This queues AFTER intro in the typing queue
    const handleRoadmapSSE = (data) => {
        const { user_id, field, session_id, roadmap } = data;

        const ctx = getSessionContext();
        if (user_id !== ctx?.user_id || field !== ctx?.field) return;

        const blockId = `INTRO_${session_id}`;
        const roadmapContent = "\n\n---\n\n## Learning Roadmap\n\n" + roadmapTextToMarkdown(roadmap);

        // Get the stored intro content
        const introText = introContentRef.current || "";

        // Update the content block with combined content
        setContentBlocks((prev) => {
            const existingIntro = prev.find(b => b.type === "INTRO" && b.session_id === session_id);

            if (existingIntro) {
                return prev.map(b => {
                    if (b.type === "INTRO" && b.session_id === session_id) {
                        return {
                            ...b,
                            content: (b.introduction || "") + roadmapContent,
                            roadmap: roadmap,
                        };
                    }
                    return b;
                });
            }

            return [{
                id: blockId,
                type: "INTRO",
                session_id: session_id,
                title: `📘 Introduction & Roadmap – ${field}`,
                content: roadmapContent,
                introduction: null,
                roadmap: roadmap,
            }];
        });

        // Queue roadmap typing - it will wait for intro to complete due to queue mechanism
        // The prefix is the intro text that was already typed
        addToTypingQueue(blockId, roadmapContent, introText, null, "INTRO");
    };

    // Handle Lesson SSE - Each lesson in its own container
    const appendLessonFromSSE = (lessonData) => {
        const ctx = getSessionContext();
        if (!ctx) return;

        const { user_id, field, session_id, topic, lesson, path, name } = lessonData;

        if (user_id !== ctx.user_id || field !== ctx.field) return;

        // Update username if provided in SSE lesson data
        if (name && setUserName) {
            setUserName(name);
            saveSessionContext({ ...ctx, user_name: name });
        }

        // Detect if this is a NEW session (different session_id)
        const isNewSession = currentSessionIdRef.current && currentSessionIdRef.current !== session_id;

        // Update the tracked session_id
        currentSessionIdRef.current = session_id;

        const blockId = `LESSON_${session_id}_${topic}_${Date.now()}`;

        const lessonBlock = {
            id: blockId,
            type: "LESSON",
            session_id: session_id,
            topic: topic,
            title: topic,
            content: lesson,
            path: path || [topic],
        };

        // If new session, CLEAR content blocks and start fresh
        if (isNewSession) {
            setContentBlocks([lessonBlock]);
        } else {
            setContentBlocks((prev) => {
                // Check if this lesson topic already exists for this session
                if (prev.some((b) => b.topic === topic && b.session_id === session_id)) return prev;
                return [...prev, lessonBlock];
            });
        }

        setLearningTree((prevTree) => updateLearningTree(prevTree, {
            field,
            session_id,
            topic,
            type: "LESSON"
        }));

        // Add lesson to typing queue - each lesson is separate
        addToTypingQueue(blockId, lesson, "", topic, "LESSON");

        if (ctx.session_id !== session_id) {
            saveSessionContext({ ...ctx, session_id });
        }

        // Save to cache
        const key = normalizeTopicKey(topic);
        setContentCache((prev) => ({
            ...prev,
            [key]: lesson,
        }));

        const cache = JSON.parse(localStorage.getItem(LEARN_TOPIC_CACHE_KEY) || "{}");
        cache[key] = lesson;
        localStorage.setItem(LEARN_TOPIC_CACHE_KEY, JSON.stringify(cache));

        // Trigger scroll to new content
        if (onNewContentArrived) {
            setTimeout(() => onNewContentArrived(blockId), 100);
        }
    };

    // SSE Connection Effect
    useEffect(() => {
        const ctx = getSessionContext();
        if (!ctx?.user_id) return;
        const es = new EventSource(`${backend_url}/sse?user_id=${ctx.user_id}`);
        sseRef.current = es;

        es.addEventListener("message", (event) => {
            try {
                const payload = JSON.parse(event.data);
                // LESSON DELIVERED
                if (payload.channel === "LESSON_DELIVERED") {
                    appendLessonFromSSE(payload.data);
                    setIsNextLoading(false);
                }

                // FIELD INTRODUCTION
                if (payload.channel === "field_introduction_generated") {
                    handleIntroductionSSE(payload.data);
                }

                // FIELD ROADMAP
                if (payload.channel === "field_roadmap_generated") {
                    handleRoadmapSSE(payload.data);
                }

                // DOUBT ANSWER
                if (payload.channel === "doubt_answer") {
                    const data = payload.data;
                    const currentCtx = getSessionContext();

                    if (data.user_id !== currentCtx?.user_id || data.session_id !== currentCtx?.session_id) return;

                    window.dispatchEvent(new CustomEvent("DOUBT_ANSWER", { detail: data }));
                }

                // SESSION START
                if (payload.channel === "session_start") {
                    const data = payload.data;
                    const currentCtx = getSessionContext();

                    if (data.user_id !== currentCtx?.user_id) return;

                    setPendingSessionData({
                        user_id: data.user_id,
                        field: data.field || currentCtx?.field,
                        session_id: data.session_id,
                    });
                    setShowNewSessionModal(true);
                }

                // SESSION STOP
                if (payload.channel === "session_stop") {
                    const data = payload.data;
                    const currentCtx = getSessionContext();

                    if (data.user_id !== currentCtx?.user_id) return;

                    // Mark current topic as completed before ending session
                    markTopicCompletedOnStop();

                    setSessionActive(false);
                    setDailyActive(false);
                    setSessionStatus("red");
                    showPopup("info", "📚 Your daily session has ended. Great progress today! See you tomorrow.");
                }

                // INTRO SESSION STOP
                if (payload.channel === "intro_session_stop") {
                    const data = payload.data;
                    const currentCtx = getSessionContext();

                    if (data.user_id !== currentCtx?.user_id) return;

                    // Mark current topic as completed before ending intro session
                    markTopicCompletedOnStop();

                    setIntroActive(false);
                    setSessionStatus(dailyActive ? "green" : "red");
                    showPopup("info", "✅ Introduction completed! Your learning journey begins.");
                }

                // SESSION STATUS UPDATE
                if (payload.channel === "session_status_update") {
                    const data = payload.data;
                    const currentCtx = getSessionContext();

                    if (data.user_id !== currentCtx?.user_id || data.field !== currentCtx?.field) return;

                    setSessionStatus(data.session_status || "red");
                    setIntroActive(data.intro_active || false);
                    setDailyActive(data.lesson_active || false);
                    setSessionActive(data.intro_active || data.lesson_active);
                }

            } catch (e) {
                console.error("❌ SSE Parse error:", e);
            }
        });

        es.onerror = (err) => {
            console.error("❌ SSE Error:", err);
        };

        return () => {
            es.close();
        };
    }, []);

    return {
        sseRef,
        handleIntroductionSSE,
        handleRoadmapSSE,
        appendLessonFromSSE,
    };
};

export default useSSEConnection;
