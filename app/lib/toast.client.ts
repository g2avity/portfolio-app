import { toast } from "sonner";

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Success toast - green theme
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

// Error toast - red theme
export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000, // Longer for errors
    action: options?.action,
  });
}

// Info toast - blue theme
export function showInfo(message: string, options?: ToastOptions) {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

// Warning toast - yellow theme
export function showWarning(message: string, options?: ToastOptions) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action,
  });
}

// Loading toast - for async operations
export function showLoading(message: string, options?: Omit<ToastOptions, 'duration'>) {
  return toast.loading(message, {
    description: options?.description,
  });
}

// Promise toast - automatically handles loading/success/error states
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: options?.duration,
    action: options?.action,
  });
}

// Dismiss all toasts
export function dismissAll() {
  toast.dismiss();
}

// Dismiss specific toast
export function dismiss(toastId: string | number) {
  toast.dismiss(toastId);
}

// Experience-specific toast helpers
export const experienceToasts = {
  created: (title: string, company: string) =>
    showSuccess("Experience Added!", {
      description: `${title} at ${company} has been added to your portfolio.`,
    }),

  updated: (title: string, company: string) =>
    showSuccess("Experience Updated!", {
      description: `${title} at ${company} has been successfully updated.`,
    }),

  deleted: (title: string, company: string) =>
    showSuccess("Experience Deleted", {
      description: `${title} at ${company} has been removed from your portfolio.`,
    }),

  createError: () =>
    showError("Failed to Add Experience", {
      description: "Please check your information and try again.",
    }),

  updateError: () =>
    showError("Failed to Update Experience", {
      description: "Please check your information and try again.",
    }),

  deleteError: () =>
    showError("Failed to Delete Experience", {
      description: "Please try again or contact support if the problem persists.",
    }),
};

// Skill-specific toast helpers
export const skillToasts = {
  created: (name: string) =>
    showSuccess("Skill Added!", {
      description: `${name} has been added to your portfolio.`,
    }),

  updated: (name: string) =>
    showSuccess("Skill Updated!", {
      description: `${name} has been successfully updated.`,
    }),

  deleted: (name: string) =>
    showSuccess("Skill Deleted", {
      description: `${name} has been removed from your portfolio.`,
    }),

  createError: () =>
    showError("Failed to Add Skill", {
      description: "Please check your information and try again.",
    }),

  updateError: () =>
    showError("Failed to Update Skill", {
      description: "Please check your information and try again.",
    }),

  deleteError: () =>
    showError("Failed to Delete Skill", {
      description: "Please try again or contact support if the problem persists.",
    }),
};

// Profile-specific toast helpers
export const profileToasts = {
  updated: () =>
    showSuccess("Profile Updated!", {
      description: "Your profile information has been successfully saved.",
    }),

  updateError: () =>
    showError("Failed to Update Profile", {
      description: "Please check your information and try again.",
    }),

  avatarUploaded: () =>
    showSuccess("Avatar Uploaded!", {
      description: "Your profile picture has been successfully updated.",
    }),

  avatarUploadError: () =>
    showError("Failed to Upload Avatar", {
      description: "Please check the image file and try again.",
    }),
};
