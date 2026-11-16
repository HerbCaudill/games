import { IconKeyboard } from "@tabler/icons-react"
import { useRef } from "react"
import { SHORTCUTS, type ShortcutContext } from "@/shortcuts"
import { useKeydown } from "@/lib/useKeydown"
import { Button } from "./ui/button"

/** A desktop-only button, also opened with `?`, that lists the keyboard shortcuts for the current screen. */
export function ShortcutsButton(
  /** The component props. */
  { context }: Props,
) {
  const dialog = useRef<HTMLDialogElement>(null)
  const open = () => dialog.current?.showModal()
  useKeydown(event => {
    if (event.key !== "?") return
    event.preventDefault()
    open()
  })
  const groups = [SHORTCUTS[context], SHORTCUTS.global]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="hidden pointer-fine:inline-flex"
        onClick={open}
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
      >
        <IconKeyboard />
      </Button>
      <dialog
        ref={dialog}
        className="bg-popover text-popover-foreground m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border p-0 shadow-xl backdrop:bg-black/40"
        onClick={event => {
          if (event.target === dialog.current) dialog.current.close()
        }}
      >
        <div className="p-5">
          <h2 className="mb-3 font-semibold">Keyboard shortcuts</h2>
          {groups.map(group => (
            <section key={group.title} className="mb-4 last:mb-0">
              <h3 className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                {group.title}
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                {group.keys.map(([keys, action]) => (
                  <div key={action} className="contents">
                    <dt>
                      {keys.map(key => (
                        <kbd
                          key={key}
                          className="bg-muted mr-1 rounded border px-1.5 font-mono text-xs"
                        >
                          {key}
                        </kbd>
                      ))}
                    </dt>
                    <dd>{action}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          <form method="dialog" className="mt-4 flex justify-end">
            <Button variant="outline" autoFocus>
              Close
            </Button>
          </form>
        </div>
      </dialog>
    </>
  )
}

type Props = {
  /** Which screen's shortcuts to list. */
  context: ShortcutContext
}
