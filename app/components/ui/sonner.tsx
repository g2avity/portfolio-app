import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--bg-card)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-color)",
          "--success-bg": "var(--success-bg)",
          "--success-text": "var(--success-text)",
          "--success-border": "var(--success-border)",
          "--error-bg": "var(--error-bg)",
          "--error-text": "var(--error-text)",
          "--error-border": "var(--error-border)",
          "--warning-bg": "var(--warning-bg)",
          "--warning-text": "var(--warning-text)",
          "--warning-border": "var(--warning-border)",
          "--info-bg": "var(--info-bg)",
          "--info-text": "var(--info-text)",
          "--info-border": "var(--info-border)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
