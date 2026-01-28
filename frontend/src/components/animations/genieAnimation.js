/**
 * Simple Fade Animation for Doubt Modal
 * Instant center appearance with subtle fade
 */

export const fadeAnimation = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.15,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.1,
            ease: "easeIn",
        },
    },
};

/**
 * Background overlay animation
 */
export const overlayAnimation = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.15,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.1,
        },
    },
};

/**
 * Icon morph animation (for close button rotation)
 */
export const iconMorphAnimation = {
    initial: {
        scale: 1,
        rotate: 0,
    },
    hover: {
        scale: 1.1,
        rotate: 90,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
        },
    },
    tap: {
        scale: 0.9,
    },
};

// Legacy exports for backward compatibility
export const bottomSheetAnimation = fadeAnimation;
export const genieAnimation = fadeAnimation;
export const genieAnimationDramatic = fadeAnimation;
export const genieFillAnimation = fadeAnimation;

export default fadeAnimation;
