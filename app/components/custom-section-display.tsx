import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import type { CustomSection } from "../lib/db.server";
import { RichTextDisplay } from "./rich-text-display";
import { useState, useEffect, useRef } from "react";


// Truncated field component with gradient fade and custom hover preview
function TruncatedField({ 
  content, 
  maxChars = 300, 
  className = "",
  isExpanded = false
}: { 
  content: string; 
  maxChars?: number; 
  className?: string; 
  isExpanded?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  if (!content) return null;
  
  const shouldTruncate = content.length > maxChars && !isExpanded;
  
  if (!shouldTruncate) {
    return (
      <div className={className}>
        <RichTextDisplay content={content} />
      </div>
    );
  }
  
  const truncatedContent = content.substring(0, maxChars);
  
  const handleMouseEnter = () => {
    // Clear any existing timeout first
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Set new timeout for 1 second delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 1000);
  };
  
  const handleMouseLeave = () => {
    // Clear timeout and hide immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
  };
  
  return (
    <div className={className}>
      <div 
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="text-sm text-gray-800">
          <RichTextDisplay content={truncatedContent} />
        </div>
        {/* Full-width gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
        
        {/* Custom hover preview - fixed positioned */}
        {isHovered && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[600px] max-h-[500px] overflow-y-auto bg-white border rounded-lg shadow-lg p-4">
            <div className="text-sm">
              <RichTextDisplay content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomSectionDisplayProps {
  section: CustomSection;
  onEdit: (section: CustomSection) => void;
  onDelete: (section: CustomSection) => void;
  onAddEntry: (sectionId: string) => void;
  onEditEntry: (sectionId: string, entryId: string) => void;
  onDeleteEntry: (sectionId: string, entryId: string) => void;
}

export function CustomSectionDisplay({
  section,
  onEdit,
  onDelete,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}: CustomSectionDisplayProps) {
  const entries = section.content?.entries || [];
  const hasEntries = entries.length > 0;
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [collapsedEntries, setCollapsedEntries] = useState<Set<string>>(new Set());

  // Helper function to determine which fields should be treated as headers
  const isHeaderField = (fieldName: string): boolean => {
    const headerFields = ['title', 'name', 'heading'];
    return headerFields.includes(fieldName.toLowerCase());
  };

  // Load collapsed state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(`collapsed-entries-${section.id}`);
    if (saved) {
      setCollapsedEntries(new Set(JSON.parse(saved)));
    }
  }, [section.id]);

  // Save collapsed state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem(
      `collapsed-entries-${section.id}`, 
      JSON.stringify(Array.from(collapsedEntries))
    );
  }, [collapsedEntries, section.id]);
  
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const toggleEntryCollapse = (entryId: string) => {
    setCollapsedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const isEntryCollapsed = (entryId: string) => collapsedEntries.has(entryId);
  
  const isEntryExpanded = (entryId: string) => expandedEntries.has(entryId);

  // Generic entry renderer with collapsible functionality
  const renderGenericEntry = (entry: any, index: number) => {
    return (
      <div key={entry.id || index} className="border rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3 min-w-0 card-content-constrained">
            {/* Render header fields (title, name, heading) */}
            {section.content?.fields?.filter(isHeaderField).map((headerField: string) => {
              const headerValue = entry[headerField];
              if (!headerValue) return null;
              
              return (
                <h4 key={headerField} className="font-medium text-gray-900">
                  {headerValue}
                </h4>
              );
            })}
            
            {/* Entry content - collapsible */}
            <div className={`entry-content ${
              isEntryCollapsed(entry.id) ? 'collapsed' : 'expanded'
            }`}>
              <div className="space-y-3">
                {/* Use fields array for proper ordering - exclude header fields */}
                {section.content?.fields?.filter((fieldName: string) => !isHeaderField(fieldName)).map((fieldName: string) => {
                  const fieldValue = entry[fieldName];
                  if (!fieldValue) return null;
                  
                  return (
                    <div key={fieldName}>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      </label>
                      <TruncatedField 
                        content={fieldValue} 
                        maxChars={300}
                        className="mt-1"
                        isExpanded={isEntryExpanded(entry.id)}
                      />
                    </div>
                  );
                })}
              </div>
              {entry.createdAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditEntry(section.id, entry.id)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            
            {/* View button - only when expanded */}
            {!isEntryCollapsed(entry.id) && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => toggleEntryExpansion(entry.id)}
              >
                {isEntryExpanded(entry.id) ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => onDeleteEntry(section.id, entry.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
            
            {/* Collapse toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEntryCollapse(entry.id)}
              className="text-gray-600"
            >
              {isEntryCollapsed(entry.id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render entry based on section type
  const renderEntry = (entry: any, index: number) => {
    switch (section.type) {
      case 'star-memo':
        return renderGenericEntry(entry, index);

      case 'project-showcase':
        return renderGenericEntry(entry, index);

      default:
        // Generic entry renderer for unknown types
        return renderGenericEntry(entry, index);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white content-transition">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-gray-600 mt-1">{section.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {section.type}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {section.layout}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
              {entries.length} entries
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(section)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Section
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => onDelete(section)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Section
          </Button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {hasEntries ? (
          <>
            {entries.map((entry, index) => renderEntry(entry, index))}
            
            {/* Add Entry Button - Always shown when there are entries */}
            <div
              onClick={() => onAddEntry(section.id)}
              className="group cursor-pointer"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-700 group-hover:text-blue-700 text-sm">
                      Add Entry
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-blue-600">
                      Click to add another entry to this section
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state for entries */
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">Start adding content to this section</p>
            
            {/* Add Entry Button for empty sections */}
            <div
              onClick={() => onAddEntry(section.id)}
              className="group cursor-pointer mt-3"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-700 group-hover:text-blue-700 text-sm">
                      Add Your First Entry
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-blue-600">
                      Click to create your first entry
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
