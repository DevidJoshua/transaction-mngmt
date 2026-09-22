# APPLICATION

# Configurable Multi-Tenant Modular Business Platform

## 1. Application Overview

### 1.1 Purpose

Application ini adalah **configurable multi-tenant modular business platform** yang memungkinkan satu platform digunakan oleh berbagai tipe client dengan kebutuhan bisnis, struktur organisasi, fitur, user, role, dan permission yang berbeda.

Platform tidak dibangun sebagai satu aplikasi yang memiliki konfigurasi tetap untuk seluruh client.

Sebaliknya, platform menggunakan pendekatan:

```text
Platform
   │
   ├── Modules
   │     ├── Features
   │     └── Privileges
   │
   ├── Packages
   │
   ├── Tenant
   │     ├── Organization
   │     ├── Users
   │     ├── Roles
   │     └── Access Scope
   │
   └── IDM / RBAC
```

Vendor menyediakan **capability dan building blocks** dari platform.

Client kemudian menggunakan capability tersebut untuk membentuk konfigurasi aplikasi sesuai kebutuhan organisasinya.

Dengan demikian, satu platform dapat digunakan untuk:

* Bank
* Merchant
* Merchant Aggregator
* Merchant Branch
* Payment Service Provider
* Corporate
* Financial Institution
* Partner
* Enterprise Client
* Dan tipe organisasi lainnya

tanpa harus membuat aplikasi baru dari awal untuk setiap client.

---

# 2. Product Vision

Visi aplikasi adalah:

> **Build one platform that can become many business applications through configuration instead of custom development.**

Platform harus memungkinkan vendor membangun capability satu kali, kemudian capability tersebut dapat digunakan oleh berbagai client melalui kombinasi:

* Package
* Module
* Feature
* Privilege
* Role
* Organization
* Data Scope
* Configuration

Sehingga perbedaan kebutuhan antar-client terutama diselesaikan melalui **configuration**, bukan dengan membuat fork atau aplikasi terpisah.

---

# 3. Business Problem

Dalam model pengembangan aplikasi tradisional, setiap client sering kali mendapatkan aplikasi atau konfigurasi khusus.

Contoh:

```text
Bank A
   └── Application A

Bank B
   └── Application B

Merchant Aggregator A
   └── Application C

Merchant A
   └── Application D
```

Model tersebut dapat menyebabkan:

* duplicate development
* duplicate maintenance
* feature fragmentation
* deployment complexity
* inconsistent security model
* inconsistent user management
* semakin banyak custom code
* semakin sulit melakukan upgrade
* sulit membuat standardisasi platform

Platform ini mengubah pendekatan tersebut menjadi:

```text
                  PLATFORM
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     Bank         Aggregator      Merchant
       │             │             │
    Package       Package        Package
       │             │             │
    Modules       Modules        Modules
       │             │             │
     Roles         Roles          Roles
       │             │             │
     Users         Users          Users
```

Core application tetap sama.

Yang berbeda adalah konfigurasi dan capability yang diberikan kepada masing-masing tenant.

---

# 4. Core Product Principles

## 4.1 Configuration Over Customization

Perbedaan kebutuhan client harus sebisa mungkin diselesaikan melalui configuration.

Contoh:

Client A membutuhkan:

```text
Dashboard
Transaction
Settlement
Reporting
```

Client B membutuhkan:

```text
Dashboard
Merchant Management
Transaction
Settlement
Reconciliation
Reporting
```

Keduanya tetap menggunakan application core yang sama.

---

## 4.2 Modular

Capability aplikasi dibagi menjadi module.

Contoh:

```text
Transaction Management
Settlement
Reconciliation
Merchant Management
User Management
Reporting
Audit
```

Module dapat terdiri dari beberapa feature.

---

## 4.3 Multi-Tenant

Setiap client merupakan tenant yang terisolasi secara logical.

Contoh:

```text
Platform
│
├── Tenant: Bank A
│
├── Tenant: Bank B
│
├── Tenant: Aggregator A
│
└── Tenant: Merchant A
```

Data tenant tidak boleh dapat diakses oleh tenant lain kecuali secara eksplisit terdapat mekanisme cross-tenant yang memang diizinkan oleh platform.

---

## 4.4 Permission Driven

Akses aplikasi ditentukan berdasarkan permission, bukan hanya berdasarkan menu.

User yang dapat melihat menu belum tentu dapat melakukan seluruh action di dalam menu tersebut.

Contoh:

```text
Transaction
├── View
├── Create
├── Edit
├── Refund
├── Void
└── Export
```

User dapat diberikan hanya:

```text
TRANSACTION_VIEW
TRANSACTION_EXPORT
```

sehingga user tersebut dapat melihat dan export transaction tetapi tidak dapat melakukan refund atau void.

---

## 4.5 Vendor-Controlled Capability

Vendor memiliki kontrol terhadap capability yang tersedia di platform.

Vendor menentukan:

* module
* feature
* privilege
* package
* capability relationship
* platform configuration

Client tidak dapat menciptakan capability teknis baru yang tidak disediakan oleh vendor.

---

## 4.6 Client-Controlled Access

Client memiliki kebebasan untuk menentukan bagaimana capability yang tersedia digunakan oleh user internal mereka.

Client dapat:

* membuat user
* membuat role
* memberikan role kepada user
* menentukan privilege dalam role
* menentukan organization
* menentukan data scope

selama privilege tersebut memang tersedia pada package client.

---

# 5. Application Actors

Platform memiliki dua kelompok administrator utama.

## 5.1 Vendor

Vendor adalah pemilik dan operator platform.

Vendor bertanggung jawab terhadap:

* platform capability
* module catalog
* feature catalog
* privilege catalog
* package
* tenant provisioning
* initial client administrator
* platform-level configuration

Contoh role:

```text
Platform Super Admin
Platform Administrator
Package Administrator
Tenant Administrator
Module Administrator
```

---

## 5.2 Client

Client adalah organisasi yang menggunakan platform.

Client dapat berupa:

* Bank
* Merchant
* Merchant Aggregator
* Enterprise
* Payment Provider
* Branch Organization
* Partner

Client memiliki administrator sendiri.

Administrator pertama diberikan oleh vendor ketika tenant dibuat.

Setelah itu client dapat mengelola user internalnya sendiri.

---

# 6. Ownership Model

Pembagian ownership merupakan konsep fundamental aplikasi.

```text
                    VENDOR
                      │
          ┌───────────┼───────────┐
          │           │           │
       Modules     Packages    Privileges
          │           │           │
          └───────────┼───────────┘
                      │
               CLIENT TENANT
                      │
             Initial Client Admin
                      │
          ┌───────────┼───────────┐
          │           │           │
        Users       Roles       Scope
          │           │           │
          └───────────┼───────────┘
                      │
                 Client Users
```

### Vendor controls:

* Module definition
* Feature definition
* Privilege definition
* Package definition
* Package entitlement
* Tenant provisioning
* Initial client administrator

### Client controls:

* Client users
* Client roles
* Role assignment
* User assignment
* Organization structure
* Data access scope
* Client-level configuration

---

# 7. Application Domain Model

Domain hierarchy utama:

```text
Vendor Platform
      │
      ├── Module
      │     └── Feature
      │           └── Privilege
      │
      ├── Package
      │     └── Package Entitlements
      │
      └── Tenant
            │
            ├── Organization
            │
            ├── Users
            │
            ├── Roles
            │     └── Privileges
            │
            └── Access Scopes
```

---

# 8. Package

## 8.1 Definition

Package adalah kumpulan capability yang diberikan vendor kepada sebuah client.

Package dapat digunakan sebagai:

* product tier
* commercial offering
* capability bundle
* client entitlement
* feature availability definition

Contoh:

```text
Merchant Standard
Merchant Enterprise
Aggregator Standard
Aggregator Enterprise
Bank Enterprise
```

---

## 8.2 Package Composition

Package dapat terdiri dari:

```text
Package
│
├── Modules
│
├── Features
│
├── Available Privileges
│
├── Configuration
│
├── Limits
│
└── Policies
```

Contoh:

```text
Package: Merchant Enterprise

Modules:
- Dashboard
- Transaction
- Settlement
- Reporting
- User Management
- Audit
```

---

## 8.3 Package vs Role

Package dan Role memiliki fungsi yang berbeda.

### Package

Menentukan:

> **Apa yang boleh tersedia untuk client?**

### Role

Menentukan:

> **Apa yang boleh dilakukan user di dalam client?**

Contoh:

```text
Package
    ↓
Transaction Module tersedia
    ↓
Refund Feature tersedia
    ↓
TRANSACTION_REFUND tersedia
    ↓
Client membuat Role Finance
    ↓
Finance diberikan TRANSACTION_REFUND
    ↓
User Finance dapat melakukan refund
```

Jika package tidak memiliki capability refund:

```text
Package
   X
Refund
```

maka client tidak dapat memberikan privilege refund kepada user meskipun role tersebut dibuat.

---

# 9. Module

Module adalah domain fungsional utama aplikasi.

Contoh:

```text
Dashboard
Merchant Management
Transaction Management
Settlement
Reconciliation
Reporting
User Management
Organization
Audit
Configuration
```

Module digunakan untuk mengelompokkan capability secara logical.

---

# 10. Feature

Feature merupakan capability yang lebih spesifik di dalam module.

Contoh:

```text
Transaction Management
│
├── Transaction List
├── Transaction Detail
├── Refund
├── Void
├── Transaction Export
└── Transaction Monitoring
```

Feature dapat memiliki satu atau lebih privilege.

---

# 11. Privilege

Privilege merupakan unit authorization paling granular.

Contoh:

```text
TRANSACTION_VIEW
TRANSACTION_DETAIL
TRANSACTION_CREATE
TRANSACTION_EDIT
TRANSACTION_REFUND
TRANSACTION_VOID
TRANSACTION_EXPORT
```

Privilege harus didefinisikan oleh vendor.

Client hanya dapat menggunakan privilege yang tersedia.

---

# 12. Role

Role adalah kumpulan privilege yang dibuat dan dikelola oleh client.

Contoh:

```text
Role: Finance Officer

Privileges:
- TRANSACTION_VIEW
- TRANSACTION_EXPORT
- SETTLEMENT_VIEW
- SETTLEMENT_EXPORT
- REPORT_VIEW
```

Role tidak harus sama antara satu client dengan client lainnya.

Contoh:

```text
Bank A

Bank Admin
Operations
Finance
Support
Auditor
```

sedangkan:

```text
Merchant A

Owner
Finance
Operations
```

---

# 13. User

User merupakan identity yang digunakan seseorang untuk mengakses platform.

User dapat memiliki satu atau beberapa role.

Contoh:

```text
User
John Doe

Roles:
- Finance Officer
- Report Viewer
```

Effective privilege user merupakan gabungan privilege dari role yang dimilikinya, subject to tenant, package, status, dan scope.

---

# 14. Organization

Organization merepresentasikan struktur internal client.

Contoh Bank:

```text
Bank
│
├── Head Office
│
├── Jakarta Branch
│
├── Bandung Branch
│
└── Surabaya Branch
```

Contoh Merchant Aggregator:

```text
Aggregator
│
├── Operations
├── Finance
├── Support
│
└── Merchant Groups
```

Organization digunakan sebagai salah satu boundary untuk data access.

---

# 15. Access Scope

Role dan privilege saja belum cukup untuk menentukan data apa yang dapat dilihat user.

Platform juga membutuhkan scope.

Contoh:

```text
User A
Role: Finance

Scope:
Jakarta Branch
```

User tersebut dapat memiliki privilege:

```text
TRANSACTION_VIEW
```

tetapi hanya untuk transaction yang berada pada Jakarta Branch.

Scope dapat berupa:

```text
Tenant
Organization
Branch
Merchant Group
Merchant
Account
Region
```

tergantung kebutuhan bisnis client.

---

# 16. IDM / RBAC

IDM merupakan layer identity and access management di dalam platform.

IDM bertanggung jawab terhadap:

```text
Identity
Authentication
User
Role
Privilege
Authorization
Session
Access Scope
Audit
```

Model authorization utama menggunakan RBAC:

```text
User
  ↓
Role
  ↓
Privilege
```

dengan tambahan:

```text
Tenant
  ↓
Package Entitlement
  ↓
Data Scope
```

---

# 17. Effective Access Model

Effective access user dapat digambarkan:

```text
Effective Access
=
Tenant Membership
∩
Package Entitlement
∩
Role Privilege
∩
Data Scope
∩
User Status
```

Contoh:

```text
User
John

Tenant:
Bank A

Package:
Bank Enterprise

Role:
Finance Officer

Privileges:
TRANSACTION_VIEW
TRANSACTION_EXPORT

Scope:
Jakarta Branch
```

John dapat:

```text
View Transaction
Export Transaction
```

tetapi hanya pada:

```text
Jakarta Branch
```

---

# 18. Authorization Flow

Setiap protected action harus melalui authorization check.

```text
Request
   │
   ▼
Authentication
   │
   ▼
Identify User
   │
   ▼
Resolve Tenant
   │
   ▼
Check User Status
   │
   ▼
Resolve Package
   │
   ▼
Check Package Entitlement
   │
   ▼
Resolve Role
   │
   ▼
Resolve Privilege
   │
   ▼
Evaluate Data Scope
   │
   ▼
ALLOW / DENY
```

Contoh:

```text
GET /transactions/123

Required:
TRANSACTION_VIEW

System checks:

1. User authenticated?
2. User belongs to tenant?
3. User active?
4. Package contains Transaction?
5. Role contains TRANSACTION_VIEW?
6. Transaction belongs to permitted scope?

YES → Allow
NO  → Deny
```

---

# 19. Vendor Administration

Vendor Administration merupakan area pengelolaan platform.

## Main Capabilities

### Platform Management

* Platform configuration
* Global settings
* System parameters
* Security configuration

### Module Management

* Create module
* Update module
* Activate/deactivate module
* Define module metadata

### Feature Management

* Create feature
* Assign feature to module
* Activate/deactivate feature

### Privilege Management

* Create privilege
* Assign privilege to feature
* Define action type

### Package Management

* Create package
* Assign modules
* Assign features
* Define available privileges
* Configure package limits
* Activate/deactivate package

### Tenant Management

* Create tenant
* Assign package
* Configure tenant
* Create initial client administrator
* Suspend/activate tenant

---

# 20. Client Administration

Client Administration merupakan area pengelolaan internal client.

Client administrator dapat:

### User Management

* Create user
* Update user
* Activate/deactivate user
* Reset access
* Assign role
* Remove role

### Role Management

* Create role
* Update role
* Delete/deactivate role
* Assign available privileges
* Review role permissions

### Organization Management

* Create organization
* Create branch
* Create department
* Assign users
* Define hierarchy

### Access Management

* Define user scope
* Define role scope
* Assign organization scope
* Restrict access to specific data

---

# 21. Initial Client Administrator

Ketika vendor membuat tenant baru, vendor harus memberikan minimal satu initial client administrator.

Contoh:

```text
Vendor
   │
   ├── Create Tenant
   │
   ├── Assign Package
   │
   └── Create Initial Client Admin
                │
                ▼
          Client Admin
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     Users     Roles   Organization
```

Initial Client Admin menjadi titik awal client untuk melakukan self-service administration.

Setelah onboarding selesai, vendor tidak perlu membuat user satu per satu untuk client.

---

# 22. Client Self-Service Model

Tujuan utama model ini adalah mengurangi dependency client terhadap vendor.

Tanpa model self-service:

```text
Client wants new user
       ↓
Request Vendor
       ↓
Vendor creates user
       ↓
Client waits
```

Dengan platform:

```text
Client Admin
      ↓
Create User
      ↓
Create / Select Role
      ↓
Assign Role
      ↓
Define Scope
      ↓
User Ready
```

Client dapat mengelola struktur akses internalnya sendiri tanpa mengubah platform capability.

---

# 23. Permission Boundary

Client memiliki kebebasan dalam:

```text
WHO
```

dan vendor memiliki kontrol terhadap:

```text
WHAT
```

Secara sederhana:

```text
Vendor:
"What capabilities exist?"

Client:
"Who can use those capabilities?"
```

Contoh:

Vendor menyediakan:

```text
TRANSACTION_VIEW
TRANSACTION_EXPORT
TRANSACTION_REFUND
```

Client dapat membuat:

```text
Finance
    ↓
VIEW
EXPORT

Operations
    ↓
VIEW
REFUND

Auditor
    ↓
VIEW
```

Client tidak dapat membuat:

```text
SUPER_REFUND_ALL_TRANSACTIONS
```

jika privilege tersebut tidak didefinisikan oleh vendor.

---

# 24. Navigation Model

Navigation harus mengikuti kombinasi:

```text
Package Entitlement
+
User Privilege
```

Contoh:

```text
Package
├── Dashboard
├── Transaction
├── Settlement
├── Reporting
└── User Management
```

User:

```text
Finance
```

memiliki:

```text
TRANSACTION_VIEW
SETTLEMENT_VIEW
REPORT_VIEW
```

Maka navigation dapat menjadi:

```text
Dashboard
Transactions
Settlement
Reports
```

Sedangkan:

```text
User Management
```

tidak ditampilkan apabila user tidak memiliki privilege terkait.

Namun navigation visibility hanya merupakan UX layer.

Authorization tetap wajib dilakukan di backend.

---

# 25. Example: Bank Client

## Tenant

```text
Bank A
```

## Package

```text
Bank Enterprise
```

## Modules

```text
Dashboard
Merchant Management
Transaction
Settlement
Reconciliation
Reporting
User Management
Audit
```

## Roles

### Bank Admin

```text
Full tenant administration
```

### Operations

```text
TRANSACTION_VIEW
TRANSACTION_DETAIL
TRANSACTION_REFUND
TRANSACTION_VOID
MERCHANT_VIEW
```

### Finance

```text
TRANSACTION_VIEW
SETTLEMENT_VIEW
SETTLEMENT_EXPORT
REPORT_VIEW
REPORT_EXPORT
```

### Support

```text
TRANSACTION_VIEW
TRANSACTION_DETAIL
MERCHANT_VIEW
```

### Auditor

```text
TRANSACTION_VIEW
SETTLEMENT_VIEW
REPORT_VIEW
AUDIT_VIEW
```

---

# 26. Example: Merchant Aggregator

## Tenant

```text
Aggregator A
```

## Package

```text
Aggregator Enterprise
```

## Modules

```text
Dashboard
Merchant Management
Merchant Onboarding
Transaction
Settlement
Reporting
User Management
Audit
```

## Roles

```text
Aggregator Admin
Operations
Finance
Support
Auditor
```

---

# 27. Example: Merchant

## Tenant

```text
Merchant A
```

## Package

```text
Merchant Standard
```

## Modules

```text
Dashboard
Transaction
Settlement
Reporting
User Management
```

## Roles

```text
Owner
Finance
Operations
```

---

# 28. Package, Module, Feature and Privilege Relationship

Recommended relationship:

```text
PACKAGE
   │
   └── PACKAGE_MODULE
           │
           ▼
        MODULE
           │
           └── FEATURE
                 │
                 └── PRIVILEGE
```

Example:

```text
Package: Merchant Enterprise

    Transaction Module
          │
          ├── Transaction List
          │       ├── VIEW
          │       └── EXPORT
          │
          ├── Transaction Detail
          │       └── VIEW
          │
          └── Refund
                  └── REFUND
```

---

# 29. Recommended Data Model

High-level entity relationship:

```text
Tenant
 │
 ├── Organization
 │
 ├── User
 │     └── UserRole
 │            └── Role
 │                  └── RolePrivilege
 │
 └── AccessScope

Vendor Catalog
 │
 ├── Module
 │     └── Feature
 │           └── Privilege
 │
 └── Package
       └── PackageEntitlement
```

Potential entities:

```text
Tenant
Organization
OrganizationUnit
User
Role
Privilege
UserRole
RolePrivilege
AccessScope
UserScope
RoleScope

Module
Feature
Package
PackageModule
PackageFeature
PackagePrivilege
```

---

# 30. Tenant Isolation

Tenant isolation merupakan security requirement utama.

Setiap request harus dapat menentukan tenant context.

Contoh:

```text
Request
   │
   └── authenticated user
           │
           └── tenant_id
```

Database query harus selalu mempertimbangkan tenant boundary.

Contoh:

```sql
SELECT *
FROM transactions
WHERE tenant_id = :currentTenant
```

Tenant ID tidak boleh hanya dipercaya dari request body atau query parameter.

Tenant context harus berasal dari trusted authentication/session context.

---

# 31. Security Requirements

Platform harus menerapkan:

* Authentication
* Authorization
* Tenant isolation
* Role-based access control
* Scope-based access control
* Session management
* Password policy
* MFA capability
* Audit logging
* Login monitoring
* Failed login protection
* User lifecycle
* Permission change audit
* Administrative action audit

---

# 32. Audit Trail

Setiap perubahan authorization harus dapat diaudit.

Contoh:

```text
Who:
admin@bank-a.com

Action:
UPDATE_ROLE

Target:
Finance Officer

Before:
TRANSACTION_VIEW

After:
TRANSACTION_VIEW
TRANSACTION_EXPORT

Timestamp:
2026-09-21 14:30:00

Source:
Web Application
```

Audit event minimal mencatat:

```text
Actor
Tenant
Action
Target
Before
After
Timestamp
IP
User Agent
Correlation ID
```

---

# 33. User Lifecycle

User lifecycle:

```text
INVITED
   ↓
ACTIVE
   ↓
SUSPENDED
   ↓
ACTIVE
   ↓
DEACTIVATED
```

Optional:

```text
INVITED
   ↓
EXPIRED
```

User yang inactive/suspended tidak boleh melakukan authenticated business operation.

---

# 34. Role Lifecycle

Role lifecycle:

```text
DRAFT
   ↓
ACTIVE
   ↓
INACTIVE
```

Role yang inactive tidak boleh digunakan untuk authorization baru.

Perubahan privilege pada role harus dicatat dalam audit trail.

---

# 35. Package Lifecycle

Package dapat memiliki lifecycle:

```text
DRAFT
   ↓
ACTIVE
   ↓
DEPRECATED
   ↓
RETIRED
```

Package yang sudah digunakan tenant sebaiknya memiliki versioning atau controlled migration mechanism agar perubahan capability tidak menyebabkan akses client berubah secara tidak terkontrol.

---

# 36. Tenant Onboarding Flow

Recommended flow:

```text
Vendor Login
      │
      ▼
Create Tenant
      │
      ▼
Select Package
      │
      ▼
Configure Tenant
      │
      ▼
Create Initial Client Admin
      │
      ▼
Send Invitation
      │
      ▼
Client Admin Login
      │
      ▼
Configure Organization
      │
      ▼
Create Roles
      │
      ▼
Assign Privileges
      │
      ▼
Create Users
      │
      ▼
Assign Roles
      │
      ▼
Define Scope
      │
      ▼
Client Ready
```

---

# 37. Runtime Access Architecture

At runtime:

```text
                   USER
                    │
                    ▼
              Authentication
                    │
                    ▼
               Tenant Context
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Package Check         User Status
          │                   │
          └─────────┬─────────┘
                    ▼
               Role Resolver
                    │
                    ▼
            Privilege Resolver
                    │
                    ▼
              Scope Resolver
                    │
                    ▼
             Authorization
                    │
             ┌──────┴──────┐
             ▼             ▼
           ALLOW          DENY
```

---

# 38. UI Architecture

UI harus bersifat configuration-driven.

Application tidak boleh hard-code seluruh navigation berdasarkan client.

Contoh:

```text
GET /me/context
```

menghasilkan:

```json
{
  "tenant": {
    "id": "tenant-001",
    "name": "Bank A"
  },
  "package": {
    "id": "bank-enterprise"
  },
  "modules": [
    "dashboard",
    "merchant",
    "transaction",
    "settlement",
    "reporting"
  ],
  "privileges": [
    "TRANSACTION_VIEW",
    "TRANSACTION_EXPORT",
    "SETTLEMENT_VIEW"
  ]
}
```

Frontend kemudian membentuk navigation berdasarkan context tersebut.

---

# 39. Backend Architecture Principle

Frontend permission checking tidak cukup.

Frontend digunakan untuk:

```text
UX
Navigation
Visibility
Interaction
```

Backend digunakan untuk:

```text
Security
Authorization
Data protection
Business rule enforcement
```

Contoh:

```text
Frontend:
Hide Refund button

Backend:
Reject POST /refund
if TRANSACTION_REFUND is missing
```

Keduanya wajib diterapkan.

---

# 40. Configuration-Driven Application

Application behavior idealnya berasal dari configuration.

Contoh:

```text
Tenant Configuration
       +
Package Configuration
       +
Module Configuration
       +
Role Configuration
       +
Scope Configuration
       =
Runtime Application
```

Dengan demikian application tidak perlu memiliki banyak hard-coded tenant-specific logic.

---

# 41. Extensibility

Platform harus dapat menambahkan module baru tanpa merombak IDM.

Contoh module baru:

```text
Dispute Management
```

Vendor cukup:

```text
Create Module
    ↓
Create Features
    ↓
Create Privileges
    ↓
Add to Package
```

Client kemudian dapat:

```text
Create Role
    ↓
Select Dispute Privileges
```

Tidak perlu membuat sistem authorization baru.

---

# 42. Customization Boundary

Tidak semua hal harus configurable.

### Vendor-controlled

```text
Application architecture
Module
Feature
Privilege
Package capability
Core business rules
Security policy
```

### Client-controlled

```text
Users
Roles
Role composition
Organization
Data scope
Client-level settings
```

### System-controlled

```text
Authentication
Tenant isolation
Audit
Security enforcement
Database integrity
```

Pembagian ini menjaga platform tetap fleksibel tanpa kehilangan governance.

---

# 43. Non-Goals

Platform bukan bertujuan untuk:

* Membiarkan client membuat arbitrary backend capability.
* Membiarkan client membuat privilege tanpa definisi vendor.
* Membuat source-code fork untuk setiap client.
* Menyimpan permission hanya di frontend.
* Menganggap role sebagai satu-satunya security boundary.
* Membuat setiap client memiliki database logic yang berbeda tanpa alasan.
* Menghilangkan governance vendor.

---

# 44. Key Business Value

Nilai utama platform berasal dari kemampuan untuk mengubah satu application core menjadi berbagai solusi client.

```text
ONE PLATFORM
     │
     ├── Bank Application
     ├── Aggregator Application
     ├── Merchant Application
     ├── Enterprise Application
     └── Partner Application
```

tanpa harus:

```text
ONE CLIENT
=
ONE CODEBASE
```

Model yang diinginkan adalah:

```text
ONE PLATFORM
+
MULTIPLE PACKAGES
+
MULTIPLE MODULES
+
MULTIPLE TENANTS
+
CLIENT-CREATED ROLES
+
CONFIGURATION
```

---

# 45. Core Concept Summary

Konsep aplikasi dapat diringkas menjadi:

```text
VENDOR
│
├── Defines WHAT exists
│
├── Modules
├── Features
├── Privileges
├── Packages
│
└── Provisions CLIENT
          │
          ▼
       TENANT
          │
          ├── Organization
          │
          ├── Initial Client Admin
          │
          ├── Users
          │
          ├── Roles
          │
          └── Access Scope
```

Aturan utamanya:

> **Vendor defines the capabilities. Client defines who can use those capabilities.**

---

# 46. Final Product Model

Secara keseluruhan:

```text
                         PLATFORM
                            │
             ┌──────────────┴──────────────┐
             │                             │
       VENDOR DOMAIN                 CLIENT DOMAIN
             │                             │
     ┌───────┼────────┐             ┌──────┼────────┐
     │       │        │             │      │        │
  Modules Features Privileges     Users  Roles   Organization
     │       │        │             │      │        │
     └───────┼────────┘             └──────┼────────┘
             │                             │
             └────────── PACKAGE ──────────┘
                            │
                         TENANT
                            │
                         RUNTIME
                            │
                    ┌───────┴────────┐
                    │                │
                  ACCESS            DATA
                CONTROL             SCOPE
```

The platform therefore acts as a **configuration-driven business application platform**, where the vendor controls the platform capability model while each client controls its own internal identity, role, organizational structure, and access assignment.

The final authorization model is:

```text
CAN USER PERFORM ACTION?
        │
        ├── Is user authenticated?
        ├── Is user active?
        ├── Does user belong to tenant?
        ├── Does tenant have the package capability?
        ├── Does user's role contain the privilege?
        └── Is requested data inside user's scope?
                    │
                    ▼
             ALLOW / DENY
```

This model should become the foundation for the application's backend architecture, database model, API authorization, frontend navigation, IDM, package management, tenant management, and administrative UI.
