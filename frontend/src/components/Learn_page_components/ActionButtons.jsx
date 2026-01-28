import React from "react";
import { FiSkipForward, FiLoader, FiStopCircle } from "react-icons/fi";

// Action buttons for INTRO blocks
export const IntroActionButtons = ({
    onNextTopic,
    onEndSession,
    isNextLoading,
    sessionActive,
    colorMode
}) => {
    const isDark = colorMode === "dark";

    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <button
                onClick={onNextTopic}
                disabled={isNextLoading || !sessionActive}
                className={`px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2 ${!sessionActive
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:scale-105"
                    }`}
            >
                {isNextLoading ? (
                    <>
                        <FiLoader className="animate-spin" size={18} />
                        Loading...
                    </>
                ) : (
                    <>
                        <FiSkipForward size={18} />
                        Next Topic
                    </>
                )}
            </button>

            <button
                onClick={onEndSession}
                disabled={!sessionActive}
                className={`px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2 ${!sessionActive
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:scale-105"
                    }`}
            >
                <FiStopCircle size={18} />
                End Session
            </button>
        </div>
    );
};

// Action buttons for LESSON blocks
export const LessonActionButtons = ({
    onNextTopic,
    onEndSession,
    isNextLoading,
    sessionActive,
    colorMode
}) => {
    const isDark = colorMode === "dark";

    return (
        <div className="flex items-center justify-center gap-4 py-4 mb-5">
            {/* Next Button */}
            <button
                onClick={onNextTopic}
                disabled={isNextLoading || !sessionActive}
                className={`px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2 ${!sessionActive
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-xl hover:scale-105"
                    }`}
            >
                {isNextLoading ? (
                    <>
                        <FiLoader className="animate-spin" size={18} />
                        Loading...
                    </>
                ) : (
                    <>
                        <FiSkipForward size={18} />
                        Next
                    </>
                )}
            </button>

            {/* End Session Button */}
            <button
                onClick={onEndSession}
                disabled={!sessionActive}
                className={`px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2 ${!sessionActive
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:scale-105"
                    }`}
            >
                <FiStopCircle size={18} />
                End
            </button>
        </div>
    );
};

// Main ActionButtons component that renders based on block type
const ActionButtons = ({
    blockType,
    onNextTopic,
    onEndSession,
    isNextLoading,
    sessionActive,
    colorMode
}) => {
    if (blockType === "INTRO") {
        return (
            <IntroActionButtons
                onNextTopic={onNextTopic}
                onEndSession={onEndSession}
                isNextLoading={isNextLoading}
                sessionActive={sessionActive}
                colorMode={colorMode}
            />
        );
    }

    if (blockType === "LESSON") {
        return (
            <LessonActionButtons
                onNextTopic={onNextTopic}
                onEndSession={onEndSession}
                isNextLoading={isNextLoading}
                sessionActive={sessionActive}
                colorMode={colorMode}
            />
        );
    }

    return null;
};

export default ActionButtons;
