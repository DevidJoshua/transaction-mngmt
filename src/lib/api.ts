// Thin fetch client for the Prismalink API (proxied via Vite to localhost:4000)

const TOKEN_KEY = 'plink5.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function isAuthed(): boolean {
  return !!getToken()
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch('/api' + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(opts.headers ?? {}),
    },
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (Array.isArray(body.message)) message = body.message.join(', ')
      else if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  context: () => request<import('./platform').SessionContext>('/context'),

  catalog: () =>
    request<{
      modules: { id: string; label: string; route: string; icon: string; versions: { id: string; version: string }[] }[]
      privileges: { id: string; moduleId: string; feature: string; label: string }[]
      packages: {
        id: string
        name: string
        tier: string
        status: string
        entitlements: { modules: string[]; privileges: string[] }
        moduleVersions: { moduleId: string; versionId: string; version: string }[]
      }[]
      tenants: {
        id: string
        name: string
        type: string
        status: string
        packageId: string
        packageName: string
        moduleVersions: { moduleId: string; version: string }[]
      }[]
    }>('/catalog'),

  createTenant: (dto: {
    name: string
    type: string
    packageId: string
    adminName: string
    adminEmail: string
    moduleVersions?: { moduleId: string; versionId: string }[]
  }) =>
    request<{ id: string; name: string; roles: string[]; admin: { email: string; name: string } }>('/catalog/tenants', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  createPackage: (dto: { name: string; tier: string; moduleIds: string[]; privilegeIds: string[]; moduleVersions?: { moduleId: string; versionId: string }[] }) =>
    request<{ id: string }>('/catalog/packages', { method: 'POST', body: JSON.stringify(dto) }),

  updatePackage: (id: string, dto: { name?: string; tier?: string; moduleIds?: string[]; privilegeIds?: string[]; moduleVersions?: { moduleId: string; versionId: string }[] }) =>
    request<{ id: string }>(`/catalog/packages/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

  createModuleVersion: (moduleId: string, version: string) =>
    request<{ id: string }>(`/catalog/modules/${moduleId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ version }),
    }),

  users: () => request<import('./platform').UserRec[]>('/admin/users'),
  createUser: (dto: { name: string; email: string }) =>
    request<import('./platform').UserRec>('/admin/users', { method: 'POST', body: JSON.stringify(dto) }),
  updateUser: (id: string, patch: Partial<import('./platform').UserRec>) =>
    request<import('./platform').UserRec>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: patch.name,
        email: patch.email,
        status: patch.status,
        roleIds: patch.roleIds,
        orgIds: patch.orgIds,
      }),
    }),

  roles: () => request<import('./platform').Role[]>('/admin/roles'),
  createRole: (dto: { name?: string; privilegeIds?: string[] }) =>
    request<import('./platform').Role>('/admin/roles', { method: 'POST', body: JSON.stringify(dto) }),
  updateRole: (id: string, patch: { name?: string; status?: string; privilegeIds?: string[] }) =>
    request<import('./platform').Role>(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  orgs: () => request<import('./platform').Org[]>('/admin/orgs'),
  createOrg: (dto: { name: string; parentId?: string }) =>
    request<import('./platform').Org>('/admin/orgs', { method: 'POST', body: JSON.stringify(dto) }),

  merchants: () =>
    request<{ id: string; tenantId: string; name: string; category: string | null; status: string; createdAt: string }[]>(
      '/merchants',
    ),
  createMerchant: (dto: { name: string; category?: string }) =>
    request<{ id: string }>('/merchants', { method: 'POST', body: JSON.stringify(dto) }),

  settlements: () =>
    request<{ id: string; tenantId: string; merchant: string; amount: number; status: string; period: string; createdAt: string }[]>(
      '/settlements',
    ),

  audit: () =>
    request<{ id: string; tenantId: string | null; actor: string; action: string; target: string | null; detail: string | null; ip: string | null; createdAt: string }[]>(
      '/audit',
    ),
}
