import type { ToastMessage } from "@/lib/useToast"
import { cn } from "@/lib/utils"

/** A short message that floats up into view and keeps rising as it fades out. Its parent places it. */
export function Toast(
  /** The component props. */
  { message }: Props,
) {
  if (!message) return null
  return (
    <div
      key={message.id}
      role="status"
      className={cn(
        "bg-primary text-primary-foreground pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-md",
        message.leaving
          ? "animate-out fade-out motion-safe:slide-out-to-top-3 fill-mode-forwards duration-200 ease-in"
          : "animate-in fade-in motion-safe:slide-in-from-bottom-2 duration-200 ease-out",
      )}
    >
      {message.text}
    </div>
  )
}

type Props = {
  /** The message to show. */
  message?: ToastMessage
}
