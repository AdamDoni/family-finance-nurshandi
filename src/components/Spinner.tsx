export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: `2px solid var(--border)`,
        borderTopColor: 'currentColor',
      }}
    />
  )
}
