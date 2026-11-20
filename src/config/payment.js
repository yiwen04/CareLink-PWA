// The home's real payment details. This is public information (donors need it),
// so it lives here and not in .env. Every payment screen reads from this file.
export const paymentDetails = {
  bankName: 'RHB Bank Berhad',
  accountName: 'PERTUBUHAN KEBAJIKAN DAN PENJAGAAN KANAK-KANAK KURANG UPAYA NEGERI JOHOR',
  accountNumber: '20106200113945',
  duitNowQr: '/payment/duitnow-qr.jpg',
  duitNowQrFileName: 'carelink-duitnow-qr.jpg',
  // The merchant name printed on the QR code
  qrShortName: 'PERTUBUHAN OKU N. JOHOR',
}
