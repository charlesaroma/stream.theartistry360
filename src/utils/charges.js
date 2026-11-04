/* Payment Charges */
// The charges added on top of every price, the same sum the server does
// (server/src/services/payments/charges.mjs, and the main site's utils/charges.js): system maintenance, then
// PesaPal's fee on the whole amount it collects, rounded up to whole UGX.
// The server's is the one charged; this shows it before checkout.

export const DEFAULT_RATES = { pesapalPercent: 3.5, maintenancePercent: 5 };

export function chargesFor(priceUGX, { pesapalPercent, maintenancePercent } = DEFAULT_RATES) {
  const maintenanceUGX = Math.round((priceUGX * maintenancePercent) / 100);
  const totalUGX = Math.ceil((priceUGX + maintenanceUGX) / (1 - pesapalPercent / 100));
  return { priceUGX, chargesUGX: totalUGX - priceUGX, totalUGX };
}
