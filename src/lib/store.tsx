import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, isAuthed, setToken } from './api'
import type { Org, Role, SessionContext, UserRec } from './platform'

export { isAuthed }

// ---------------------------------------------------------------------------
// Session / context
// ---------------------------------------------------------------------------

export function useAbility(): SessionContext | null {
  const { data } = useQuery({
    queryKey: ['context'],
    queryFn: () => api.context(),
    enabled: isAuthed(),
  })
  return data ?? null
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password),
    onSuccess: (res) => {
      setToken(res.token)
      queryClient.invalidateQueries({ queryKey: ['context'] })
    },
  })
}

export function logout() {
  setToken(null)
  window.location.assign('/login')
}

// ---------------------------------------------------------------------------
// Vendor catalog
// ---------------------------------------------------------------------------

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: () => api.catalog(),
    enabled: isAuthed(),
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: {
      name: string
      type: string
      packageId: string
      adminName: string
      adminEmail: string
      moduleVersions?: { moduleId: string; versionId: string }[]
    }) => api.createTenant(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

export function useCreateModuleVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, version }: { moduleId: string; version: string }) =>
      api.createModuleVersion(moduleId, version),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

export function useCreatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { name: string; tier: string; moduleIds: string[]; privilegeIds: string[]; moduleVersions?: { moduleId: string; versionId: string }[] }) =>
      api.createPackage(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

export function useUpdatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; tier?: string; moduleIds?: string[]; privilegeIds?: string[]; moduleVersions?: { moduleId: string; versionId: string }[] } }) =>
      api.updatePackage(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  })
}

// ---------------------------------------------------------------------------
// Client admin queries
// ---------------------------------------------------------------------------

export function useUsers() {
  return useQuery({ queryKey: ['admin', 'users'], queryFn: () => api.users(), enabled: isAuthed() })
}

export function useRoles() {
  return useQuery({ queryKey: ['admin', 'roles'], queryFn: () => api.roles(), enabled: isAuthed() })
}

export function useOrgs() {
  return useQuery({ queryKey: ['admin', 'orgs'], queryFn: () => api.orgs(), enabled: isAuthed() })
}

export function useMerchants() {
  return useQuery({ queryKey: ['merchants'], queryFn: () => api.merchants(), enabled: isAuthed() })
}

export function useSettlements() {
  return useQuery({ queryKey: ['settlements'], queryFn: () => api.settlements(), enabled: isAuthed() })
}

export function useAudit() {
  return useQuery({ queryKey: ['audit'], queryFn: () => api.audit(), enabled: isAuthed() })
}

export function useCreateMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { name: string; category?: string }) => api.createMerchant(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] }),
  })
}

// ---------------------------------------------------------------------------
// Client admin mutations
// ---------------------------------------------------------------------------

function useAdminMutation<TArgs>(
  fn: (args: TArgs) => Promise<unknown>,
  keys: string[],
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
      queryClient.invalidateQueries({ queryKey: ['context'] })
    },
  })
}

export function useCreateUser() {
  return useAdminMutation(
    async (dto: { name: string; email: string }) => api.createUser(dto),
    ['admin'],
  )
}

export function useUpdateUser() {
  return useAdminMutation(
    async ({ id, patch }: { id: string; patch: Partial<UserRec> }) => api.updateUser(id, patch),
    ['admin'],
  )
}

export function useCreateRole() {
  return useAdminMutation(
    async (dto: { name?: string; privilegeIds?: string[] }) => api.createRole(dto),
    ['admin'],
  )
}

export function useUpdateRole() {
  return useAdminMutation(
    async ({ id, patch }: { id: string; patch: { name?: string; status?: string; privilegeIds?: string[] } }) =>
      api.updateRole(id, patch),
    ['admin'],
  )
}

export function useCreateOrg() {
  return useAdminMutation(
    async (dto: { name: string; parentId?: string }) => api.createOrg(dto),
    ['admin'],
  )
}

export type { Org, Role, UserRec, SessionContext }
