/**
 * Parse SOURCE XML tags in lesson content and convert to clickable markdown links
 * 
 * Input format:
 * <SOURCE id="S#">
 *   <TITLE>{{source_title}}</TITLE>
 *   <URL>{{source_url}}</URL>
 * </SOURCE>
 * 
 * Output format:
 * [📚 S#: source_title](source_url)
 */

export const parseSourceTags = (content) => {
    if (!content || typeof content !== 'string') return content;

    // Regex to match SOURCE tags with their content
    const sourceRegex = /<SOURCE\s+id="([^"]+)">\s*<TITLE>([^<]*)<\/TITLE>\s*<URL>([^<]*)<\/URL>\s*<\/SOURCE>/gi;

    return content.replace(sourceRegex, (match, id, title, url) => {
        const cleanTitle = title.trim();
        const cleanUrl = url.trim();
        const cleanId = id.trim();

        if (!cleanUrl) {
            // If no URL, just return the title with reference
            return `**[${cleanId}]** ${cleanTitle}`;
        }

        // Return as a styled markdown link
        return `• [${cleanId}: ${cleanTitle}](${cleanUrl})\n\n`;

    });
};

/**
 * Extract all sources from content as an array
 * Useful for displaying a references section
 */
export const extractSources = (content) => {
    if (!content || typeof content !== 'string') return [];

    const sourceRegex = /<SOURCE\s+id="([^"]+)">\s*<TITLE>([^<]*)<\/TITLE>\s*<URL>([^<]*)<\/URL>\s*<\/SOURCE>/gi;
    const sources = [];
    let match;

    while ((match = sourceRegex.exec(content)) !== null) {
        sources.push({
            id: match[1].trim(),
            title: match[2].trim(),
            url: match[3].trim(),
        });
    }

    return sources;
};

export default parseSourceTags;
