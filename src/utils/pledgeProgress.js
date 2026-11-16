// What confirming a pledge will do to the item's progress bar.
// Mirrors the database trigger apply_confirmed_pledge:
//   pledged_qty = least(target_qty, pledged_qty + qty)
// so the bar never goes above the target.
// The app only SHOWS this; the trigger does the real update.
export function progressAfterConfirm(item, qty) {
  const before = item.pledged_qty
  const target = item.target_qty
  const after = Math.min(target, before + qty)
  return {
    before,
    after,
    target,
    alreadyFull: before >= target, // confirming won't move the bar at all
  }
}
