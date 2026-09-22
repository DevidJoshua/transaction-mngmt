export type TxStatus = 'success' | 'pending' | 'failed'
export type TxMethod = 'QRIS' | 'Virtual Account' | 'E-Wallet' | 'Credit Card' | 'Bank Transfer'

export interface Transaction {
  id: string
  reference: string
  amount: number
  method: TxMethod
  status: TxStatus
  customer: string
  store: string
  time: string
}

export interface PaymentLink {
  id: string
  name: string
  url: string
  amount: number
  status: 'active' | 'disabled'
  paid: number
  created: string
}

export const transactions: Transaction[] = [
  { id: '1', reference: 'PRS-8F3K2A', amount: 250000, method: 'QRIS', status: 'success', customer: 'Budi Santoso', store: 'Toko Kopi Senja', time: '2026-09-21 09:14' },
  { id: '2', reference: 'PRS-9D1L4M', amount: 1250000, method: 'Virtual Account', status: 'success', customer: 'Sari Wulandari', store: 'Klinik Sehat', time: '2026-09-21 08:47' },
  { id: '3', reference: 'PRS-2Q8N7C', amount: 75000, method: 'E-Wallet', status: 'pending', customer: 'Andi Pratama', store: 'Warung Nusantara', time: '2026-09-20 22:03' },
  { id: '4', reference: 'PRS-5T6V1B', amount: 890000, method: 'Credit Card', status: 'success', customer: 'Dewi Lestari', store: 'Butik Anggun', time: '2026-09-20 19:31' },
  { id: '5', reference: 'PRS-7A9Z4X', amount: 310000, method: 'Bank Transfer', status: 'failed', customer: 'Rizky Hidayat', store: 'Toko Kopi Senja', time: '2026-09-20 15:22' },
  { id: '6', reference: 'PRS-3E6G8H', amount: 420000, method: 'QRIS', status: 'success', customer: 'Nina Kusuma', store: 'Dapur Mama', time: '2026-09-20 11:50' },
  { id: '7', reference: 'PRS-1M4P2S', amount: 1500000, method: 'Virtual Account', status: 'pending', customer: 'PT Maju Jaya', store: 'Klinik Sehat', time: '2026-09-19 17:08' },
  { id: '8', reference: 'PRS-4K7J9L', amount: 98000, method: 'E-Wallet', status: 'success', customer: 'Yusuf Karim', store: 'Warung Nusantara', time: '2026-09-19 13:45' },
]

export const paymentLinks: PaymentLink[] = [
  { id: '1', name: 'Kopi Senja Bundle', url: 'plink.id/ks-bundle', amount: 65000, status: 'active', paid: 48, created: '2026-09-10' },
  { id: '2', name: 'Cek Kesehatan Premium', url: 'plink.id/klinik-premium', amount: 450000, status: 'active', paid: 21, created: '2026-09-08' },
  { id: '3', name: 'Pre-order Raya', url: 'plink.id/preorder-raya', amount: 199000, status: 'disabled', paid: 0, created: '2026-09-02' },
  { id: '4', name: 'Donasi Masjid', url: 'plink.id/donasi', amount: 50000, status: 'active', paid: 132, created: '2026-08-28' },
]

export interface DashboardStat {
  label: string
  value: number
  delta: string
  up: boolean
}

export const stats: DashboardStat[] = [
  { label: 'Total Revenue', value: 48950000, delta: '+12.5%', up: true },
  { label: 'Transactions', value: 1240, delta: '+8.2%', up: true },
  { label: 'Active Payment Links', value: 32, delta: '+3', up: true },
  { label: 'Failed Rate', value: 100, delta: '-0.4%', up: false },
]