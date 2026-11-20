// Payment settings for the Pro upgrade screen. Edit this file, then rebuild.

// Must match v_price in supabase/upgrade_requests.sql (the server calculates the real amount).
export const PRO_PRICE_MONTH = 699

export const PAY = {
  // Put your QR image at public/payment-qr.png (any size, square works best).
  qrImage: '/payment-qr.png',
  // Optional. If set, a "Pay with UPI app" button is shown too (useful on the same phone,
  // because a phone cannot scan its own screen). Example: 'yourname@okbank'
  upiId: '9896882241-7@ybl',
  // Name shown inside the UPI app.
  payee: 'Khata',
}
