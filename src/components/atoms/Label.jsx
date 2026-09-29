export default function Label({ children, ...props }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[var(--text)]" {...props}>
      {children}
    </label>
  )
}
