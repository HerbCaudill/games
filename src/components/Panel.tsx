import { IconX } from "@tabler/icons-react"
import { useEffect, useRef, type ReactNode } from "react"
import { Button } from "./ui/button"

/** A modal panel: full screen on phones, a centered card on wider screens. */
export function Panel(
  /** The component props. */
  { open, title, onClose, children }: Props,
) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current!
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onClose={onClose}
      onClick={event => {
        if (event.target === dialog.current) onClose()
      }}
      className="bg-background text-foreground m-0 h-full max-h-none w-full max-w-none p-0 backdrop:bg-black/40 sm:m-auto sm:h-auto sm:max-h-[85svh] sm:w-[min(36rem,calc(100vw-2rem))] sm:rounded-xl sm:border sm:shadow-xl"
    >
      <div className="flex h-full flex-col sm:max-h-[85svh]">
        <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h2 className="flex-1 font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Close"
            onClick={onClose}
          >
            <IconX className="size-6" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {open && children}
        </div>
      </div>
    </dialog>
  )
}

type Props = {
  /** Whether the panel is showing. */
  open: boolean
  /** Its heading. */
  title: string
  /** Called when the panel asks to close, by its button, Escape or a click outside. */
  onClose: () => void
  /** What it shows; rendered only while open. */
  children: ReactNode
}
