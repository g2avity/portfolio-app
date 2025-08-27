import React from "react";
import ReactMarkdown from "react-markdown";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  if (!content) return null;

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-800 mb-2 mt-2">{children}</h3>
          ),
          // Customize paragraph spacing
          p: ({ children }) => (
            <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>
          ),
          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">{children}</li>
          ),
          // Customize blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
              {children}
            </blockquote>
          ),
          // Customize code blocks
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-100 text-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          // Customize links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Customize strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800">{children}</strong>
          ),
          // Customize emphasis
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Keep the simple version for basic text display
export function SimpleRichText({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div className={`text-gray-700 leading-relaxed whitespace-pre-line ${className}`}>
      {content}
    </div>
  );
}

// Legacy function for backward compatibility
export function MarkdownDisplay({ content, className = "" }: RichTextDisplayProps) {
  return <RichTextDisplay content={content} className={className} />;
}
