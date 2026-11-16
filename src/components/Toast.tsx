/** A short message floating over the top of a game. */
export function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div
      key={message.id}
      role="status"
      className="animate-in bg-primary text-primary-foreground fade-in slide-in-from-top-1 pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-md"
    >
      {message.text}
    </div>
  )
}

type Props = {
  /** The message to show, with an ID so a repeated message replays its entrance. */
  message?: { text: string; id: number }
}
