/** An on/off switch: a native checkbox, announced as a switch, drawn as a track with a sliding knob. Wrap it in a label to name it. */
export function Switch(
  /** The component props. */
  { checked, onCheckedChange }: Props,
) {
  return (
    <span className="relative inline-flex shrink-0">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={event => onCheckedChange(event.target.checked)}
        className="peer bg-input checked:bg-primary h-5 w-9 cursor-pointer appearance-none rounded-full transition-colors"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
      />
    </span>
  )
}

type Props = {
  /** Whether it's on. */
  checked: boolean
  /** Called with the new value when it's flipped. */
  onCheckedChange: (checked: boolean) => void
}
