import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const NewSessionModal = ({ show, sessionData, onAccept }) => {
    if (!show || !sessionData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-green-400"
                >
                    <div className="text-center text-white">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold mb-2">New Learning Session!</h3>
                        <p className="text-white/90 mb-4">
                            Your daily session for <strong>{sessionData.field}</strong> is ready!
                        </p>
                        <p className="text-white/70 text-sm mb-6">
                            New lessons will appear as they're prepared for you.
                        </p>
                        <button
                            onClick={onAccept}
                            className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg"
                        >
                            ▶️ Start Learning
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NewSessionModal;
