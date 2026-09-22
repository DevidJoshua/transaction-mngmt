import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { isAuthed, useAbility } from './lib/store'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { PaymentLinks } from './pages/PaymentLinks'
import { Transactions } from './pages/Transactions'
import { UserManagement } from './pages/UserManagement'
import { Platform } from './pages/Platform'
import { Merchants } from './pages/Merchants'
import { Settlement } from './pages/Settlement'
import { Reports } from './pages/Reports'
import { Audit } from './pages/Audit'

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isAuthed() ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireVendor({ children }: { children: React.ReactNode }) {
  const ctx = useAbility()
  if (!ctx) return null
  return ctx.isVendor ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function IndexRedirect() {
  const ctx = useAbility()
  if (!ctx) return null
  return <Navigate to={ctx.isVendor ? '/platform' : '/dashboard'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<IndexRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="payment-links" element={<PaymentLinks />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="merchants" element={<Merchants />} />
        <Route path="settlement" element={<Settlement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit" element={<Audit />} />
        <Route
          path="platform"
          element={
            <RequireVendor>
              <Platform />
            </RequireVendor>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}