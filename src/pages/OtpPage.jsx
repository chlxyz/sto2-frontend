import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import FormField from '../components/molecules/FormField.jsx'
import AuthCard from '../components/molecules/AuthCard.jsx'
import AuthTemplate from '../components/templates/AuthTemplate.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const COOLDOWN = 60

export default function OtpPage() {
  const { user, loading, requestCode, verifyCode } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  if (!loading && user) return <Navigate to="/products" replace />

  const tick = () => {
    setCooldown(COOLDOWN)
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const send = async (e) => {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      await requestCode(email.trim().toLowerCase())
      setStep('code')
      tick()
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Wait a minute and try again.')
      } else {
        setError('Could not send a code. Check the address and try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const me = await verifyCode(email.trim().toLowerCase(), code.trim(), remember)
      if (me?.display_name) {
        navigate('/products', { replace: true })
      } else {
        navigate('/profile', { replace: true, state: { welcome: true } })
      }
    } catch {
      setError('Invalid or expired code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthTemplate>
      <AuthCard
        title={step === 'email' ? 'Login with email' : 'Enter your code'}
        subtitle={step === 'email' ? 'We will email you a 6-digit code. No password needed.' : `Sent to ${email}. Valid for 10 minutes.`}
      >
        <div className="flex flex-col gap-4">
          <Alert>{error}</Alert>
          {step === 'email' ? (
            <form onSubmit={send} className="flex flex-col gap-4">
              <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Keep me signed in on this device
              </label>
              <Button type="submit" loading={busy}>Send code</Button>
            </form>
          ) : (
            <form onSubmit={confirm} className="flex flex-col gap-4">
              <FormField
                label="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
              />
              <Button type="submit" loading={busy}>Verify & login</Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => setStep('email')} className="text-[var(--muted)] hover:text-[var(--text)]">
                  Change email
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={busy || cooldown > 0}
                  className="font-medium text-[var(--accent)] hover:underline disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthTemplate>
  )
}
