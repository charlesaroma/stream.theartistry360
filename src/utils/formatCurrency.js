/* Currency */
// Prices are held in whole Uganda shillings; UGX has no minor unit.
const UGX = new Intl.NumberFormat("en-UG", {
  style: "currency",
  currency: "UGX",
  maximumFractionDigits: 0,
});

export function formatUGX(amount) {
  return UGX.format(Number(amount) || 0);
}

const COMPACT = new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 });

/** 8234000 -> "UGX 8.2M", for tiles and axes where the full figure is noise. */
export function formatUGXCompact(amount) {
  return `UGX ${COMPACT.format(Number(amount) || 0)}`;
}
