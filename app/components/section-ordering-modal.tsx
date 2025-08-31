import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings,
  User,
  Briefcase,
  Star,
  Palette,
  Info
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  type: 'profile' | 'experiences' | 'skills' | 'custom';
  slug?: string;
  isPublic?: boolean;
  order: number;
  description?: string | null;
}

interface SectionOrderingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  onReorder?: (sections: Section[]) => void;
}

export default function SectionOrderingModal({ 
  isOpen, 
  onClose, 
  sections, 
  onReorder 
}: SectionOrderingModalProps) {
  const [orderedSections, setOrderedSections] = useState<Section[]>(sections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Get section icon based on type
  const getSectionIcon = (type: Section['type']) => {
    switch (type) {
      case 'profile':
        return <User className="w-5 h-5" />;
      case 'experiences':
        return <Briefcase className="w-5 h-5" />;
      case 'skills':
        return <Star className="w-5 h-5" />;
      case 'custom':
        return <Settings className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Get section description
  const getSectionDescription = (section: Section) => {
    switch (section.type) {
      case 'profile':
        return 'Personal information and contact details';
      case 'experiences':
        return 'Work history and professional experience';
      case 'skills':
        return 'Technical and soft skills';
      case 'custom':
        return section.description || 'Custom content section';
      default:
        return 'Content section';
    }
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...orderedSections];
    const draggedSection = newSections[draggedIndex];
    
    // Remove dragged item from original position
    newSections.splice(draggedIndex, 1);
    
    // Insert at new position
    newSections.splice(index, 0, draggedSection);
    
    // Update order numbers
    newSections.forEach((section, idx) => {
      section.order = idx + 1;
    });
    
    setOrderedSections(newSections);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle save
  const handleSave = () => {
    if (onReorder) {
      onReorder(orderedSections);
    }
    onClose();
  };

  // Handle reset
  const handleReset = () => {
    setOrderedSections(sections);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Section Ordering" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Current Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GripVertical className="w-5 h-5" style={{ color: 'var(--focus-ring)' }} />
              Current Section Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderedSections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'var(--bg-card-content)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>

                  {/* Section Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--border-light)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {getSectionIcon(section.type)}
                      </div>
                    </div>
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {section.title}
                      </h4>
                      {section.type === 'custom' && section.slug && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ 
                          backgroundColor: 'var(--border-light)', 
                          color: 'var(--text-secondary)' 
                        }}>
                          {section.slug}
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {getSectionDescription(section)}
                    </p>
                  </div>

                  {/* Order Number */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ 
                      backgroundColor: 'var(--focus-ring)', 
                      color: 'var(--text-inverse)' 
                    }}>
                      {section.order}
                    </div>
                  </div>

                  {/* Visibility Status */}
                  <div className="flex-shrink-0">
                    {section.isPublic ? (
                      <Eye className="w-5 h-5" style={{ color: 'var(--success-text)' }} />
                    ) : (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" style={{ color: 'var(--focus-ring)' }} />
              How to Reorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ 
                  backgroundColor: 'var(--focus-ring)', 
                  color: 'var(--text-inverse)' 
                }}>
                  1
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Drag and drop sections using the grip handle on the left
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ 
                  backgroundColor: 'var(--focus-ring)', 
                  color: 'var(--text-inverse)' 
                }}>
                  2
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  The order number will automatically update as you move sections
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ 
                  backgroundColor: 'var(--focus-ring)', 
                  color: 'var(--text-inverse)' 
                }}>
                  3
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Click Save to apply the new order to your portfolio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" style={{ color: 'var(--focus-ring)' }} />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'var(--border-light)', 
                borderColor: 'var(--border-color)' 
              }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Advanced Layout Options
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Grid layouts and column configurations</li>
                  <li>• Section-specific styling and themes</li>
                  <li>• Responsive breakpoint controls</li>
                  <li>• Custom spacing and padding options</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'var(--border-light)', 
                borderColor: 'var(--border-color)' 
              }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Portfolio Templates
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Pre-designed portfolio layouts</li>
                  <li>• Industry-specific templates</li>
                  <li>• One-click layout switching</li>
                  <li>• Template marketplace</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Order
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
