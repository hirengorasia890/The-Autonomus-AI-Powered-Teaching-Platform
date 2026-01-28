import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import AITypingIndicator, { TypingCursor } from "./AITypingIndicator";
import { parseSourceTags } from "../../utils/parseSourceTags";

const ContentBlock = ({
    block,
    isTyping,
    typedContent,
    typingScrollRef,
    colorMode
}) => {
    const isDark = colorMode === "dark";

    // Parse SOURCE tags in content to convert to clickable links
    const processedContent = useMemo(() => {
        if (!typedContent) return "";
        return parseSourceTags(typedContent);
    }, [typedContent]);

    return (
        <Card
            data-block-id={block.id}
            className={isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
        >
            <CardHeader className={`p-6 rounded-t-2xl overflow-y-auto ${isDark
                ? "bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-700"
                : "bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"
                }`}>
                <div className="flex items-center justify-between w-full">
                    <CardTitle className={`text-2xl font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-gray-800"
                        }`}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Render everything inline for titles - no block elements
                                p: ({ children }) => <span>{children}</span>,
                                h1: ({ children }) => <span>{children}</span>,
                                h2: ({ children }) => <span>{children}</span>,
                                h3: ({ children }) => <span>{children}</span>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => <code className="bg-gray-700/30 px-1 rounded">{children}</code>,
                            }}
                        >
                            {block.title || ""}
                        </ReactMarkdown>
                    </CardTitle>
                    {/* AI Typing Indicator - shown at top right when typing */}
                    {isTyping && <AITypingIndicator colorMode={colorMode} />}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div
                    className={`h-[calc(100vh-280px)] overflow-y-auto px-6 py-4 prose prose-lg max-w-none 
                        ${isDark
                            ? "prose-invert"
                            : "prose-gray"
                        } 
                        prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl 
                        prose-p:mb-5 prose-p:leading-relaxed
                        prose-hr:my-10 prose-hr:border-t-2
                        prose-a:text-blue-500 hover:prose-a:text-blue-600`}
                    ref={isTyping ? typingScrollRef : null}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom paragraph renderer for consistent spacing
                            p: ({ node, children, ...props }) => (
                                <p className="mb-5 leading-relaxed" {...props}>
                                    {children}
                                </p>
                            ),
                            // Custom link renderer for better styling of source links
                            a: ({ node, children, href, ...props }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
                                    {...props}
                                >
                                    {children}
                                </a>
                            ),
                            // Custom hr renderer for more spacing between sections
                            hr: () => (
                                <div className="my-10">
                                    <hr className={`border-t-2 ${isDark ? "border-gray-600" : "border-gray-300"}`} />
                                </div>
                            ),
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>
                    {/* ChatGPT-style blinking cursor at end of text while typing */}
                    {/* {isTyping && <TypingCursor colorMode={colorMode} />} */}
                </div>
            </CardContent>
        </Card>
    );
};

export default ContentBlock;
