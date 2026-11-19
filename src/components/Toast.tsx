import type { ToastMessage } from "@/lib/useToast"
import { cn } from "@/lib/utils"

/** A short message that floats up into view and keeps rising as it fades out. A success shows in a white box, with any points it earned rising beside it on their own. Its parent places it. */
export function Toast(
  /** The component props. */
  { message }: Props,
) {
  if (!message) return null
  return (
    <div
      key={message.id}
      className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2"
    >
      <div
        role="status"
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
          message.success
            ? "bg-background text-foreground border"
            : "bg-primary text-primary-foreground shadow-md",
          message.leaving
            ? "animate-out fade-out motion-safe:slide-out-to-top-3 fill-mode-forwards duration-200 ease-in"
            : "animate-in fade-in motion-safe:slide-in-from-bottom-2 duration-200 ease-out",
        )}
      >
        {message.text}
      </div>
      {message.points !== undefined && (
        <span className="absolute inset-y-0 left-full ml-3 flex items-center">
          <span className="text-muted-foreground motion-safe:animate-points-rise motion-reduce:animate-points-fade text-base font-semibold">
            +{message.points}
          </span>
        </span>
      )}
    </div>
  )
}

type Props = {
  /** The message to show. */
  message?: ToastMessage
}
