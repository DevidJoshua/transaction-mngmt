# ACCOUNT_ACCESS.MD — Account & Access Control Model

This document describes how accounts are identified, authenticated, and authorized in
Prismalink. It is the operational reference for the access-control rules implemented in
the backend (NestJS + Prisma + PostgreSQL) and enforced at runtime by the
`/api/context` resolver and the `PrivilegesGuard`.

---

## 1. Two control domains

Access rests on a split of ownership (ref. `APPLICATION_BRD.MD` §6):

```text
VENDOR controls WHAT exists          CLIENT controls WHO can use it
   │                                     │
   ├── Modules                          ├── Users
   ├── Features                         ├── Roles
   ├── Privileges                       ├── Role assignment
   ├── Packages                         ├── User assignment
   └── Tenant provisioning              └── Organization & data scope
```

Vendor defines the capability catalog. Client assigns those capabilities to its own
users through roles and scopes. A client can never create a privilege that the vendor
has not defined.

---

## 2. Account model

An **account** is a `User` row. Every account has:

| Field      | Meaning                                                                    |
|------------|-----------------------------------------------------------------------------|
| `id`        | Internal identifier                                                         |
| `tenantId`  | Owning tenant (`null` for vendor/platform operators)                        |
| `name`      | Display name                                                                |
| `email`     | Unique login identity                                                       |
| `password`  | bcrypt hash (`password123` in seed, hashed at rest)                         |
| `status`    | Lifecycle state (see §3)                                                    |
| `isVendor`  | `true` for platform operators with global, unmatched access                 |

An account belongs to exactly one tenant (or is vendor). Tenancy is a **security
boundary**: every database query scopes to the caller's `tenantId` derived from the
authenticated session, never from request body or query params (BRD §30).

### 2.1 Vendor accounts

Vendor accounts (`isVendor = true`) operate outside tenant boundaries. They administer
the capability catalog, packages, and tenant provisioning via `/api/catalog`.

### 2.2 Client accounts

Client accounts belong to a tenant and gain access only through roles + scopes assigned
by that tenant's administrator. The first client administrator is provisioned by the
vendor during tenant onboarding (BRD §21).

---

## 3. Account lifecycle

```text
INVITED ──► ACTIVE ──► SUSPENDED ──► ACTIVE ──► DEACTIVATED
                │
                └──► (optional) EXPIRED
```

Only `active` accounts can:
- authenticate successfully (login is rejected for non-active status), and
- hold effective privileges (non-active → empty privilege set at runtime).

Transitions are client-admin actions recorded for audit.

---

## 4. Roles

A **role** is a client-created bundle of privileges.

```text
Role: Finance Officer
  ├── TRANSACTION_VIEW
  ├── TRANSACTION_EXPORT
  ├── SETTLEMENT_VIEW
  └── REPORT_VIEW
```

- Roles are scoped to a single tenant.
- Role lifecycle: `DRAFT → ACTIVE → INACTIVE`. Inactive roles are not resolved at runtime.
- Roles differ freely between tenants (BRD §12); the platform never assumes a global set.

A role may only contain privileges that are:
1. defined by the vendor (exist in the privilege catalog), **and**
2. available in the tenant's package entitlement.

The role editor UI enforces both; the backend re-checks at authorization time.

---

## 5. Packages, modules, features, privileges

The vendor catalog is a four-level hierarchy (BRD §28):

```text
PACKAGE ──► MODULE ──► FEATURE ──► PRIVILEGE
```

- **Module** — top-level functional domain (Dashboard, Transactions, Settlement, …).
- **Feature** — capability inside a module (Transaction List, Refund, Void, …).
- **Privilege** — the finest authorization unit (`TRANSACTION_REFUND`, …).
- **Package** — an entitlement bundle granted to a tenant (Merchant Standard,
  Merchant Enterprise, Bank Enterprise, …).

A package lists which modules and privileges **may be available** to the tenant. It does
not grant anything to any user by itself — it only *enables* what roles can then use
(BRD §8.3).

---

## 6. Privilege catalog

The current seed catalog (vendor-defined):

```text
DASHBOARD_VIEW
TRANSACTION_VIEW        TRANSACTION_DETAIL        TRANSACTION_REFUND
TRANSACTION_VOID        TRANSACTION_EXPORT
SETTLEMENT_VIEW         SETTLEMENT_EXPORT
PAYMENT_LINK_VIEW       PAYMENT_LINK_MANAGE
MERCHANT_VIEW           MERCHANT_MANAGE
REPORT_VIEW             REPORT_EXPORT
USER_VIEW               USER_MANAGE
ROLE_VIEW               ROLE_MANAGE
AUDIT_VIEW
```

Each privilege belongs to a module. Only vendor-side administration can add, rename, or
retire these.

---

## 7. Effective access

A user's effective access is the intersection of all constraints (BRD §17):

```text
Effective Access =
      Tenant Membership
   ∩  Package Entitlement
   ∩  Role Privilege
   ∩  Data Scope
   ∩  User Status
```

At runtime the context resolver computes:

```text
privileges = (union of active-role privileges)
             ∩ (package-entitled privileges)
             … only when user.status = 'active'
```

The result is returned by `GET /api/context` and, on the frontend, drives navigation
visibility. On the backend it drives the `PrivilegesGuard`.

### 7.1 Example

```text
John @ Bank A (package: Bank Enterprise, role: Finance Officer)
  privileges: TRANSACTION_VIEW, TRANSACTION_EXPORT
  scope:      Jakarta Branch

John may view/export transactions — but only those in Jakarta Branch.
John may NOT refund (privilege absent from role).
```

---

## 8. Authorization flow

Every protected action passes the same decision path (BRD §18):

```text
Request
   │  Authentication (JWT)
   ▼  Identify user
   │  Check status = active
   ▼  Resolve tenant (from session, not body)
   │  Check package entitlement
   ▼  Resolve role → privilege
   │  Evaluate data scope
   ▼
ALLOW / DENY
```

### 8.1 Guard semantics

- `JwtAuthGuard` — validates the `Authorization: Bearer <token>` header and attaches the
  authenticated user id.
- `VendorGuard` — requires `isVendor` (used on `/api/catalog`).
- `PrivilegesGuard` + `@RequirePrivilege(...)` — requires at least one of the listed
  privileges in the caller's effective privilege set. Vendor accounts bypass this check.

```text
@UseGuards(PrivilegesGuard)
@RequirePrivilege('TRANSACTION_REFUND')
POST /api/transactions/:id/refund
```

Frontend visibility (hiding a Refund button) is UX only; authorization is always enforced
server-side (BRD §39).

---

## 9. Data scope

Roles and privileges define *what* a user can do; **scope** defines *which data*.

```text
User A (Finance) scope: Jakarta Branch
   → TRANSACTION_VIEW applies only to Jakarta Branch transactions.
```

Scope is modeled as user→organization assignments (`AccessScope`), resolved at runtime
as the user's `orgIds`. Organization structures are tenant-specific trees
(Head Office → Branches).

---

## 10. Tenancy isolation

- Tenant context originates exclusively from the authenticated session/JWT.
- Database queries always apply `tenant_id = currentTenant`.
- Cross-tenant access is impossible unless the platform explicitly provides a
  sanctioned cross-tenant mechanism.

---

## 11. Authentication endpoints

```text
POST /api/auth/login      { email, password }  →  { token }
GET  /api/context         (Bearer token)       →  effective-access context
```

### 11.1 Seed accounts (password: `password123`)

```text
vendor@plink.com      Platform operator (vendor)
admin@test.com        Bank A — Bank Admin
finance@test.com      Bank A — Finance (view/export only)
ops@test.com          Bank A — Operations (refund/void)
auditor@test.com      Bank A — Auditor
owner@merchant.com    Merchant A — Owner
```

---

## 12. Summary

```text
CAN USER PERFORM ACTION?
   ├── Is the user authenticated?          (JWT valid)
   ├── Is the user active?                 (status = active)
   ├── Does the user belong to a tenant?   (scope + isolation)
   ├── Does the package include it?        (entitlement)
   ├── Does a role contain the privilege?  (RBAC)
   └── Is the data within user scope?      (AccessScope)
                       │
                       ▼
                  ALLOW / DENY
```
