import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          header: "text-red-800"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          header: "text-yellow-800"
        };
      case "info":
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          header: "text-blue-800"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            {styles.icon}
            <CardTitle className={`text-lg ${styles.header}`}>
              {title}
            </CardTitle>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              className={styles.confirmButton}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
