/* ─── Format Helpers ─── */
export const fmt    = n => new Intl.NumberFormat('vi-VN').format(n) + '₫'
export const fmtNum = n => new Intl.NumberFormat('vi-VN').format(n)
