import { usePendingDecision } from './usePendingDecision'

// Confirm or decline one pledge: decide('confirmed') or decide('rejected').
// Shares the "only if still pending" logic with Kids Heroes.
export function usePledgeDecision(id) {
  return usePendingDecision('pledges', id)
}
