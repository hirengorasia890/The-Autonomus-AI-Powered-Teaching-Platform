import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SessionPopup = ({ show, type, message, onClose }) => {
    if (!show) return null;

    const getStyles = () => {
        switch (type) {
            case "success":
                return "bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400";
            case "error":
                return "bg-gradient-to-r from-red-500 to-red-600 border-red-400";
            case "info":
                return "bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-400";
            case "warning":
                return "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400";
            default:
                return "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success": return "✅";
            case "error": return "❌";
            // case "error": return <CircleX strokeWidth={1.5} size={200}/>;

            case "info": return "ℹ️";
            case "warning": return "⚠️";
            default: return "📢";
        }
    };

    const getTitle = () => {
        switch (type) {
            case "success": return "Session Started!";
            case "error": return "Session Unavailable";
            case "info": return "Session Info";
            default: return "Notice";
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    className={`${getStyles()} text-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center">
                        <div className="text-4xl mb-3">{getIcon()}</div>
                        <h3 className="text-xl font-bold mb-2">{getTitle()}</h3>
                        <p className="text-white/90 mb-4">{message}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionPopup;
