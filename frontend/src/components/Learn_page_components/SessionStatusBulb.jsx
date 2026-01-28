import React from "react";

const SessionStatusBulb = ({ status }) => {
    const getColor = () => {
        switch (status) {
            case "green": return "bg-green-500 shadow-green-500/50";
            case "blue": return "bg-blue-500 shadow-blue-500/50";
            case "red":
            default: return "bg-red-500 shadow-red-500/50";
        }
    };

    const getTooltip = () => {
        switch (status) {
            case "green": return "Daily Session Active";
            case "blue": return "Intro Session Active";
            case "red":
            default: return "No Active Session";
        }
    };

    return (
        <div className="relative group">
            <div className={`w-4 h-4 rounded-full ${getColor()} shadow-lg animate-pulse`} />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {getTooltip()}
            </div>
        </div>
    );
};

export default SessionStatusBulb;
