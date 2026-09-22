import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useLogin } from '../lib/store'

export function Login() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    login.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/', { replace: true }),
        onError: (err) => setError(err instanceof Error ? err.message : 'Something went wrong'),
      },
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface-primary p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Zap className="size-5" />
          </div>
          <span className="text-xl font-semibold">Prismalink</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Accept payments.
            <br />
            Grow your revenue.
          </h1>
          <p className="mt-4 max-w-sm text-white/80">
            QRIS, Virtual Accounts, E-Wallets, and cards — one platform for every way
            your customers pay.
          </p>
        </div>

        <p className="relative text-sm text-white/60">© 2026 Prismalink</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-surface-primary text-white">
              <Zap className="size-4" />
            </div>
            <span className="text-lg font-semibold">Prismalink</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
          <p className="mt-1 text-sm text-content-secondary">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@test.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-surface-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="rounded-md bg-surface-error px-3 py-2 text-sm text-content-error">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-content-secondary">
            Don&apos;t have an account?{' '}
            <a href="#" className="font-medium text-surface-primary hover:underline">
              Register
            </a>
          </p>

          <div className="mt-6 rounded-lg border border-border-base bg-slate-50 p-4">
            <p className="text-xs font-medium text-content-secondary">Demo account (password: password123)</p>
            <ul className="mt-2 space-y-1 text-xs text-content-secondary">
              <li>platform@plink.co.id — platform admin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}