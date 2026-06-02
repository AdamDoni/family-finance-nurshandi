export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/tambah/:path*', '/transaksi/:path*', '/laporan/:path*', '/ganti-password'],
}
