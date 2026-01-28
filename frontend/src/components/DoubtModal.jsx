import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiX, FiSend, FiMinimize2, FiMaximize2, FiHelpCircle } from "react-icons/fi";
import { backend_url } from "../config";

export default function DoubtModal({ open, onClose, onSend, user, activeTopic, field, colorMode = "dark" }) {
    const modalRef = useRef(null);
    const chatContainerRef = useRef(null);
    const shouldScrollRef = useRef(false);

    const [question, setQuestion] = useState("");
    const [error, setError] = useState("");
    const [minimized, setMinimized] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [isWaitingForAI, setIsWaitingForAI] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isReadyToShow, setIsReadyToShow] = useState(false);  // Controls visibility after scroll is set

    const isDark = colorMode === "dark";

    // Modal size logic
    const getModalStyle = () => {
        if (minimized) return "w-[380px] h-[56px] fixed bottom-6 right-6 cursor-pointer";
        if (maximized) return "w-[95vw] h-[90vh]";
        return "w-[720px] max-w-[95vw] h-[520px]";
    };

    // Auto-scroll to bottom only when user sends a message
    useEffect(() => {
        if (chatContainerRef.current && shouldScrollRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            shouldScrollRef.current = false;
        }
    }, [chatHistory, isWaitingForAI]);

    // ESC key close
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    // Fetch existing doubts on open
    useEffect(() => {
        if (!open) return;

        const ctx = JSON.parse(localStorage.getItem("learn_session_context"));
        if (!ctx?.user_id || !ctx?.session_id || !field) return;

        let cancelled = false;
        setInitialLoading(true);

        fetch(
            `${backend_url}/api/session/all_doubts?` +
            new URLSearchParams({
                user_id: ctx.user_id,
                field,
                session_id: ctx.session_id,
            })
        )
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (data.status === "success" && Array.isArray(data.data)) {
                    const formatted = data.data.flatMap(d => [
                        { role: "user", text: d.question },
                        { role: "assistant", text: d.answer },
                    ]);
                    setChatHistory(formatted);

                    // Scroll to bottom after loading chat history
                    setTimeout(() => {
                        if (chatContainerRef.current) {
                            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                        }
                    }, 100);
                }
            })
            .finally(() => {
                if (!cancelled) setInitialLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, field]);

    // Listen for doubt answers from SSE
    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            setChatHistory(prev => [
                ...prev,
                { role: "assistant", text: data.answer }
            ]);
            setIsWaitingForAI(false);
        };

        window.addEventListener("DOUBT_ANSWER", handler);
        return () => window.removeEventListener("DOUBT_ANSWER", handler);
    }, []);

    const handleSend = async () => {
        if (!question.trim()) {
            setError("Please enter a question");
            return;
        }

        setError("");
        setIsWaitingForAI(true);
        shouldScrollRef.current = true; // Enable scroll when user sends message

        const ctx = JSON.parse(localStorage.getItem("learn_session_context"));
        const userQuestion = question;
        setQuestion("");

        // Optimistic UI - add user message
        setChatHistory(prev => [
            ...prev,
            { role: "user", text: userQuestion }
        ]);

        await fetch(`${backend_url}/api/doubt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: ctx.user_id,
                field,
                session_id: ctx.session_id,
                topic: "abc",
                subtopic: activeTopic?.title || "general",
                question: userQuestion,
            }),
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-2xl shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300 ${getModalStyle()} ${isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                            }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-gray-50"
                            }`}>
                            <div className="flex items-center gap-3">
                                <FiHelpCircle className={`text-xl ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                                    Ask Your Doubt
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized(prev => !prev);
                    setMaximized(false);
                  }}
                  className={`p-2 rounded-lg transition-colors ${isDark
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                  title="Minimize"
                >
                  <FiMinimize2 size={16} />
                </button> */}

                                {/* Maximize */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMaximized(prev => !prev);
                                        setMinimized(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isDark
                                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                                        : "bg-blue-50 hover:bg-gray-200 text-gray-600 hover:text-gray-700"
                                        }`}
                                    title="Maximize"
                                >
                                    <FiMaximize2 size={16} />
                                </button>

                                {/* Close */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${isDark
                                        ? "bg-red-400 hover:bg-red-700 text-gray-200 hover:text-red-400"
                                        : "bg-red-400 hover:bg-red-500 text-gray-200 hover:text-gray-300"
                                        }`}
                                    title="Close"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Minimized State */}
                        {minimized && (
                            <div
                                onClick={() => setMinimized(false)}
                                className={`flex items-center justify-between px-5 py-3 text-sm cursor-pointer ${isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                <span className="font-medium">Doubt Solver</span>
                                <span className="opacity-70 text-xs">Click to restore</span>
                            </div>
                        )}

                        {/* Chat Body */}
                        {!minimized && (
                            <>
                                {/* Messages Area */}
                                <div
                                    ref={chatContainerRef}
                                    className={`flex-1 overflow-y-auto px-5 py-4 space-y-4 ${isDark ? "bg-gray-800" : "bg-gray-50"
                                        }`}
                                >
                                    {chatHistory.length === 0 && !initialLoading && (
                                        <div className={`text-center py-12 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                            <FiHelpCircle className="mx-auto text-5xl mb-4 opacity-50" />
                                            <p className="font-medium">No doubts yet!</p>
                                            <p className="text-sm mt-1">Ask any question about your current topic</p>
                                        </div>
                                    )}

                                    {chatHistory.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${item.role === "user"
                                                    ? `${isDark
                                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                    }`
                                                    : `${isDark
                                                        ? "bg-gray-700 text-gray-100"
                                                        : "bg-white text-gray-800 shadow-sm border border-gray-100"
                                                    }`
                                                    }`}
                                            >
                                                {item.role === "assistant" ? (
                                                    <div className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : "prose-gray"} 
                            prose-headings:font-semibold prose-headings:my-3 
                            prose-p:mb-4 prose-p:leading-relaxed
                            prose-ul:my-3 prose-li:my-1
                            prose-a:text-blue-400 hover:prose-a:text-blue-300`}>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({ node, children, ...props }) => (
                                                                    <p className="mb-4 leading-relaxed" {...props}>
                                                                        {children}
                                                                    </p>
                                                                ),
                                                            }}
                                                        >
                                                            {item.text}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    item.text
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator while waiting for AI response */}
                                    {isWaitingForAI && (
                                        <div className={`mr-auto inline-block px-4 py-3 rounded-2xl text-sm ${isDark
                                            ? "bg-gray-700 text-gray-300"
                                            : "bg-white text-gray-600 shadow-sm border border-gray-100"
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                                </div>
                                                <span className="text-xs opacity-70">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className={`border-t px-5 py-4 ${isDark
                                    ? "border-gray-700 bg-gray-900"
                                    : "border-gray-200 bg-white"
                                    }`}>
                                    <div className="flex gap-3 items-end">
                                        <input
                                            value={question ?? ""}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your question here..."
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none transition-colors resize-none ${isDark
                                                ? `bg-gray-800 text-white placeholder-gray-500 ${error ? "border-red-500" : "border-gray-600 focus:border-blue-500"
                                                }`
                                                : `bg-gray-50 text-gray-800 placeholder-gray-400 ${error ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                                                }`
                                                }`}
                                        />

                                        <button
                                            onClick={handleSend}
                                            disabled={!question.trim() || isWaitingForAI}
                                            className={`p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${question.trim() && !isWaitingForAI
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105"
                                                : isDark
                                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <FiSend size={20} />
                                        </button>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-sm mt-2">{error}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
