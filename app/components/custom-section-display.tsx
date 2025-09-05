import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import type { CustomSection } from "../lib/db.server";
import { RichTextDisplay } from "./rich-text-display";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";


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
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle click outside to close preview
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHovered]);
  
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
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          <RichTextDisplay content={truncatedContent} />
        </div>
        {/* Full-width gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ 
          background: 'linear-gradient(to top, var(--bg-card), transparent)' 
        }} />
        
        {/* Custom hover preview - rendered via portal to break out of container constraints */}
        {isHovered && createPortal(
          <div 
            ref={previewRef}
            style={{
              position: 'fixed',
              top: '50vh',
              left: '50vw',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: '90vw',
              maxWidth: '800px',
              minWidth: '300px',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '1rem'
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Content Preview</h4>
              <button 
                onClick={() => setIsHovered(false)}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
              <RichTextDisplay content={content} />
            </div>
          </div>,
          document.body
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
      <div key={entry.id || index} className="border rounded-lg p-4" style={{ 
        borderColor: 'var(--border-color)', 
        backgroundColor: 'var(--bg-card-content)' 
      }}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3 min-w-0 card-content-constrained">
            {/* Render header fields (title, name, heading) */}
            {section.content?.fields?.filter(isHeaderField).map((headerField: string) => {
              const headerValue = entry[headerField];
              if (!headerValue) return null;
              
              return (
                <h4 key={headerField} className="font-medium" style={{ color: 'var(--text-primary)' }}>
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
                  
                  // Check if this is a tags field by looking at the section template
                  const fieldConfig = section.content?.template?.[fieldName];
                  const isTagsField = fieldConfig?.type === 'tags';
                  
                  return (
                    <div key={fieldName}>
                      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                      </label>
                      
                      {isTagsField && Array.isArray(fieldValue) ? (
                        // Render tags as badges
                        <div className="flex flex-wrap gap-2 mt-1">
                          {fieldValue.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 rounded-full text-sm" 
                              style={{ 
                                backgroundColor: 'var(--success-bg)', 
                                color: 'var(--success-text)' 
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        // Render other fields as text with truncation
                        <TruncatedField 
                          content={Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue} 
                          maxChars={300}
                          className="mt-1"
                          isExpanded={isEntryExpanded(entry.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {entry.createdAt && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Created: {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
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
    <div className="border rounded-lg p-4 content-transition" style={{ 
      borderColor: 'var(--border-color)', 
      backgroundColor: 'var(--bg-card)' 
    }}>
      {/* Section Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
          {section.description && (
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{section.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 rounded-full text-sm" style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success-text)' 
            }}>
              {section.type}
            </span>
            <span className="px-2 py-1 rounded-full text-sm" style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success-text)' 
            }}>
              {section.layout}
            </span>
            <span className="px-2 py-1 rounded-full text-sm" style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success-text)' 
            }}>
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
              <div className="border-2 border-dashed rounded-lg p-3 transition-all duration-200" style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-card-content)'
              }}>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0" style={{ backgroundColor: 'var(--border-light)' }}>
                    <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Add Entry
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Click to add another entry to this section
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state for entries */
          <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">Start adding content to this section</p>
            
            {/* Add Entry Button for empty sections */}
            <div
              onClick={() => onAddEntry(section.id)}
              className="group cursor-pointer mt-3"
            >
              <div className="border-2 border-dashed rounded-lg p-3 transition-all duration-200" style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-card-content)'
              }}>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0" style={{ backgroundColor: 'var(--border-light)' }}>
                    <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Add Your First Entry
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
