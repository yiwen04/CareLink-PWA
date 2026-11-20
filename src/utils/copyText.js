// Account numbers are copied without spaces or dashes so they paste cleanly into a banking app.
export function accountNumberForCopy(value) {
  return String(value ?? '').replace(/[\s-]/g, '')
}
