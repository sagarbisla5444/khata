export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
export const isValidPhone = (p) => /^\d{10}$/.test(p)
