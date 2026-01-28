import React from "react";

// Reusable Card UI Components
export const Card = ({ className = "", children, ...props }) => (
    <div className={`rounded-2xl shadow-lg border ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className = "", children }) => (
    <div className={`p-4 border-b ${className}`}>{children}</div>
);

export const CardTitle = ({ className = "", children }) => (
    <div className={`font-semibold text-lg ${className}`}>{children}</div>
);

export const CardContent = ({ className = "", children }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);
