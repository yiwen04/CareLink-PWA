import { bankDetails } from '../config/bank'

// title: heading of the box. Pledges use the default;
// Kids Heroes passes e.g. "Transfer RM50 every month to:"
export default function TransferDetails({ title = 'Transfer to:' }) {
  return (
    <div className="rounded-2xl bg-accent p-4 text-brand">
      <p className="font-semibold">{title}</p>
      <p className="mt-2">Bank: {bankDetails.bankName}</p>
      <p className="mt-1">Account name: {bankDetails.accountName}</p>
      <p className="mt-1">
        Account number: <span className="font-semibold">{bankDetails.accountNumber}</span>
      </p>

      <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-xl bg-white">
        {bankDetails.duitNowQr ? (
          <img src={bankDetails.duitNowQr} alt="DuitNow QR code" className="h-full w-full rounded-xl object-contain p-2" />
        ) : (
          <span className="font-semibold text-muted">DuitNow QR</span>
        )}
      </div>
    </div>
  )
}