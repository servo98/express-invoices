export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCfdiAmount(amount: number, decimals: number = 6): string {
  return amount.toFixed(decimals);
}

export function formatCfdiTotal(amount: number): string {
  return amount.toFixed(2);
}
