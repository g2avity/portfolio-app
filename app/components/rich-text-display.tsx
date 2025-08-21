import React from "react";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  // Process the text to handle common formatting
  const processText = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Empty line - add spacing
        elements.push(<br key={`br-${index}`} />);
        return;
      }
      
      // Check for bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const bulletContent = trimmedLine.substring(1).trim();
        elements.push(
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
            <span>{bulletContent}</span>
          </div>
        );
      }
      // Check for numbered lists
      else if (/^\d+\./.test(trimmedLine)) {
        const numberMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
        if (numberMatch) {
          const [, number, content] = numberMatch;
          elements.push(
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-gray-600 font-medium mt-0 flex-shrink-0">{number}.</span>
              <span>{content}</span>
            </div>
          );
        }
      }
      // Check for headers (lines that end with :)
      else if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
        elements.push(
          <div key={index} className="font-semibold text-gray-800 mt-3 mb-1">
            {trimmedLine}
          </div>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={index} className="mb-2">
            {trimmedLine}
          </p>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className={`text-gray-700 leading-relaxed ${className}`}>
      {processText(content)}
    </div>
  );
}

// Alternative: Simple line break preservation
export function SimpleRichText({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div className={`text-gray-700 leading-relaxed whitespace-pre-line ${className}`}>
      {content}
    </div>
  );
}

// For future: Full markdown support
export function MarkdownDisplay({ content, className = "" }: RichTextDisplayProps) {
  // TODO: Implement markdown parsing if needed
  // Could use libraries like react-markdown or marked
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {content.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
}
