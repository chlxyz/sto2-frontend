import Input from '../atoms/Input.jsx'
import Label from '../atoms/Label.jsx'

export default function FormField({ label, error, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
