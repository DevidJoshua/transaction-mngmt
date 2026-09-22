import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard' },
  { id: 'transaction', label: 'Transactions', route: '/transactions', icon: 'ReceiptText' },
  { id: 'settlement', label: 'Settlement', route: '/settlement', icon: 'Landmark' },
  { id: 'payment-link', label: 'Payment Links', route: '/payment-links', icon: 'Link2' },
  { id: 'merchant', label: 'Merchants', route: '/merchants', icon: 'Store' },
  { id: 'reporting', label: 'Reports', route: '/reports', icon: 'BarChart3' },
  { id: 'user-management', label: 'User Management', route: '/users', icon: 'Users' },
  { id: 'audit', label: 'Audit', route: '/audit', icon: 'ShieldCheck' },
]

const PRIVILEGES = [
  { id: 'DASHBOARD_VIEW', moduleId: 'dashboard', feature: 'Dashboard', label: 'View dashboard' },
  { id: 'TRANSACTION_VIEW', moduleId: 'transaction', feature: 'Transaction List', label: 'View transactions' },
  { id: 'TRANSACTION_DETAIL', moduleId: 'transaction', feature: 'Transaction Detail', label: 'View detail' },
  { id: 'TRANSACTION_REFUND', moduleId: 'transaction', feature: 'Refund', label: 'Refund' },
  { id: 'TRANSACTION_VOID', moduleId: 'transaction', feature: 'Void', label: 'Void' },
  { id: 'TRANSACTION_EXPORT', moduleId: 'transaction', feature: 'Export', label: 'Export' },
  { id: 'SETTLEMENT_VIEW', moduleId: 'settlement', feature: 'Settlement', label: 'View settlement' },
  { id: 'SETTLEMENT_EXPORT', moduleId: 'settlement', feature: 'Settlement', label: 'Export' },
  { id: 'PAYMENT_LINK_VIEW', moduleId: 'payment-link', feature: 'Payment Links', label: 'View' },
  { id: 'PAYMENT_LINK_MANAGE', moduleId: 'payment-link', feature: 'Payment Links', label: 'Create & manage' },
  { id: 'MERCHANT_VIEW', moduleId: 'merchant', feature: 'Merchant List', label: 'View merchants' },
  { id: 'MERCHANT_MANAGE', moduleId: 'merchant', feature: 'Merchant Management', label: 'Manage' },
  { id: 'REPORT_VIEW', moduleId: 'reporting', feature: 'Reports', label: 'View reports' },
  { id: 'REPORT_EXPORT', moduleId: 'reporting', feature: 'Reports', label: 'Export' },
  { id: 'USER_VIEW', moduleId: 'user-management', feature: 'Users', label: 'View users' },
  { id: 'USER_MANAGE', moduleId: 'user-management', feature: 'Users', label: 'Manage users' },
  { id: 'ROLE_VIEW', moduleId: 'user-management', feature: 'Roles', label: 'View roles' },
  { id: 'ROLE_MANAGE', moduleId: 'user-management', feature: 'Roles', label: 'Manage roles' },
  { id: 'AUDIT_VIEW', moduleId: 'audit', feature: 'Audit Log', label: 'View audit log' },
]

const ALL_PRIVS = PRIVILEGES.map((p) => p.id)
const ALL_MODULES = MODULES.map((m) => m.id)

const PACKAGES = [
  {
    id: 'merchant-standard',
    name: 'Merchant Standard',
    tier: 'standard',
    modules: ['dashboard', 'transaction', 'settlement', 'payment-link', 'reporting', 'user-management'],
    privileges: [
      'DASHBOARD_VIEW', 'TRANSACTION_VIEW', 'TRANSACTION_DETAIL', 'TRANSACTION_EXPORT',
      'SETTLEMENT_VIEW', 'PAYMENT_LINK_VIEW', 'PAYMENT_LINK_MANAGE', 'REPORT_VIEW',
      'REPORT_EXPORT', 'USER_VIEW', 'USER_MANAGE', 'ROLE_VIEW', 'ROLE_MANAGE',
    ],
  },
  {
    id: 'merchant-enterprise',
    name: 'Merchant Enterprise',
    tier: 'enterprise',
    modules: ALL_MODULES,
    privileges: [
      'DASHBOARD_VIEW', 'TRANSACTION_VIEW', 'TRANSACTION_DETAIL', 'TRANSACTION_REFUND',
      'TRANSACTION_VOID', 'TRANSACTION_EXPORT', 'SETTLEMENT_VIEW', 'SETTLEMENT_EXPORT',
      'PAYMENT_LINK_VIEW', 'PAYMENT_LINK_MANAGE', 'MERCHANT_VIEW', 'MERCHANT_MANAGE',
      'REPORT_VIEW', 'REPORT_EXPORT', 'USER_VIEW', 'USER_MANAGE', 'ROLE_VIEW',
      'ROLE_MANAGE', 'AUDIT_VIEW',
    ],
  },
  { id: 'bank-enterprise', name: 'Bank Enterprise', tier: 'enterprise', modules: ALL_MODULES, privileges: ALL_PRIVS },
  { id: 'aggregator-enterprise', name: 'Aggregator Enterprise', tier: 'enterprise', modules: ALL_MODULES, privileges: ALL_PRIVS },
]

const PARTNERS = [
  { id: 'bank-a', name: 'Bank A', type: 'Bank', packageId: 'bank-enterprise' },
  { id: 'bank-b', name: 'Bank B', type: 'Bank', packageId: 'bank-enterprise' },
  { id: 'agg-a', name: 'Aggregator A', type: 'Merchant Aggregator', packageId: 'aggregator-enterprise' },
  { id: 'merchant-a', name: 'Merchant A', type: 'Merchant', packageId: 'merchant-standard' },
  { id: 'merchant-b', name: 'Merchant B', type: 'Merchant', packageId: 'merchant-enterprise' },
]

const ORGS = [
  { id: 'bank-a-ho', partnerId: 'bank-a', name: 'Head Office' },
  { id: 'bank-a-jkt', partnerId: 'bank-a', name: 'Jakarta Branch', parentId: 'bank-a-ho' },
  { id: 'bank-a-bdg', partnerId: 'bank-a', name: 'Bandung Branch', parentId: 'bank-a-ho' },
  { id: 'bank-a-sby', partnerId: 'bank-a', name: 'Surabaya Branch', parentId: 'bank-a-ho' },
  { id: 'merchant-a-ho', partnerId: 'merchant-a', name: 'Main Store' },
]

const ROLES = [
  {
    id: 'bank-a-admin', partnerId: 'bank-a', name: 'Bank Admin',
    privileges: ALL_PRIVS.filter((p) => p !== 'MERCHANT_MANAGE' && p !== 'MERCHANT_VIEW'),
  },
  {
    id: 'bank-a-finance', partnerId: 'bank-a', name: 'Finance',
    privileges: ['TRANSACTION_VIEW', 'TRANSACTION_EXPORT', 'SETTLEMENT_VIEW', 'SETTLEMENT_EXPORT', 'REPORT_VIEW', 'REPORT_EXPORT'],
  },
  {
    id: 'bank-a-ops', partnerId: 'bank-a', name: 'Operations',
    privileges: ['TRANSACTION_VIEW', 'TRANSACTION_DETAIL', 'TRANSACTION_REFUND', 'TRANSACTION_VOID', 'MERCHANT_VIEW'],
  },
  {
    id: 'bank-a-auditor', partnerId: 'bank-a', name: 'Auditor',
    privileges: ['TRANSACTION_VIEW', 'SETTLEMENT_VIEW', 'REPORT_VIEW', 'AUDIT_VIEW'],
  },
  {
    id: 'merchant-a-owner', partnerId: 'merchant-a', name: 'Owner',
    privileges: ['DASHBOARD_VIEW', 'TRANSACTION_VIEW', 'TRANSACTION_DETAIL', 'TRANSACTION_EXPORT', 'SETTLEMENT_VIEW', 'PAYMENT_LINK_VIEW', 'PAYMENT_LINK_MANAGE', 'REPORT_VIEW', 'USER_VIEW', 'USER_MANAGE', 'ROLE_VIEW', 'ROLE_MANAGE'],
  },
  { id: 'merchant-a-finance', partnerId: 'merchant-a', name: 'Finance', privileges: ['TRANSACTION_VIEW', 'SETTLEMENT_VIEW', 'REPORT_VIEW'] },
]

const USERS = [
  { id: 'platform-admin', partnerId: null, name: 'Admin Platform', email: 'platform@plink.co.id', isVendor: true, roleIds: [], orgIds: [] },
  { id: 'u-admin', partnerId: 'bank-a', name: 'Admin', email: 'admin@test.com', isVendor: false, roleIds: ['bank-a-admin'], orgIds: ['bank-a-ho', 'bank-a-jkt', 'bank-a-bdg', 'bank-a-sby'] },
  { id: 'u-finance', partnerId: 'bank-a', name: 'Finance Officer', email: 'finance@test.com', isVendor: false, roleIds: ['bank-a-finance'], orgIds: ['bank-a-ho'] },
  { id: 'u-ops', partnerId: 'bank-a', name: 'Ops Officer', email: 'ops@test.com', isVendor: false, roleIds: ['bank-a-ops'], orgIds: ['bank-a-jkt'] },
  { id: 'u-auditor', partnerId: 'bank-a', name: 'Auditor', email: 'auditor@test.com', isVendor: false, roleIds: ['bank-a-auditor'], orgIds: ['bank-a-ho'] },
  { id: 'u-owner', partnerId: 'merchant-a', name: 'Owner Merchant A', email: 'owner@merchant.com', isVendor: false, roleIds: ['merchant-a-owner'], orgIds: ['merchant-a-ho'] },
]

async function main() {
  if ((await prisma.module.count()) > 0) {
    console.log('seed skipped (already seeded)')
    return
  }

  const password = await bcrypt.hash('password123', 10)

  for (const m of MODULES) {
    await prisma.module.create({ data: m })
  }

  const featureByKey = new Map<string, string>()
  for (const p of PRIVILEGES) {
    const key = `${p.moduleId}:${p.feature}`
    if (!featureByKey.has(key)) {
      const feature = await prisma.feature.create({
        data: { id: `${p.moduleId}-${p.feature.toLowerCase().replace(/\s+/g, '-')}`, moduleId: p.moduleId, label: p.feature },
      })
      featureByKey.set(key, feature.id)
    }
  }

  for (const p of PRIVILEGES) {
    await prisma.privilege.create({
      data: {
        id: p.id,
        moduleId: p.moduleId,
        featureId: featureByKey.get(`${p.moduleId}:${p.feature}`) ?? null,
        label: p.label,
      },
    })
  }

  for (const pkg of PACKAGES) {
    await prisma.package.create({
      data: {
        id: pkg.id,
        name: pkg.name,
        tier: pkg.tier,
        entitlements: {
          create: [
            ...pkg.modules.map((moduleId) => ({ moduleId })),
            ...pkg.privileges.map((privilegeId) => ({ privilegeId })),
          ],
        },
      },
    })
  }

  for (const t of PARTNERS) {
    await prisma.partner.create({ data: t })
  }

  for (const o of ORGS) {
    const { partnerId, name, parentId, id } = o
    await prisma.organization.create({ data: { id, partnerId, name, parentId } })
  }

  for (const r of ROLES) {
    await prisma.role.create({
      data: {
        id: r.id,
        partnerId: r.partnerId,
        name: r.name,
        rolePrivileges: { create: r.privileges.map((privilegeId) => ({ privilegeId })) },
      },
    })
  }

  for (const u of USERS) {
    await prisma.user.create({
      data: {
        id: u.id,
        partnerId: u.partnerId,
        name: u.name,
        email: u.email,
        password,
        isVendor: u.isVendor,
        userRoles: { create: u.roleIds.map((roleId) => ({ roleId })) },
        userScopes: { create: u.orgIds.map((orgId) => ({ orgId })) },
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
