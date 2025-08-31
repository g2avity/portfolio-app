import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-2xl",
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto ${maxWidth}`}
        style={{ backgroundColor: 'var(--bg-modal)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
