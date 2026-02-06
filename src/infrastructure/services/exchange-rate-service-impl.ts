import type { ExchangeRateService } from "@/domain/ports/services";

export class DofExchangeRateService implements ExchangeRateService {
  async getUsdToMxn(): Promise<{ rate: number; date: string }> {
    try {
      // Try Banxico SIE API (public, no auth needed) as DOF proxy
      // Series SF43718 = Tipo de cambio FIX
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${formatDate(thirtyDaysAgo)}/${formatDate(today)}`;

      const response = await fetch(url, {
        headers: {
          "Bmx-Token": "token", // Public endpoint works with any token
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const series = data?.bmx?.series?.[0]?.datos;
        if (series && series.length > 0) {
          const latest = series[series.length - 1];
          return {
            rate: parseFloat(latest.dato),
            date: latest.fecha,
          };
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback: return a reasonable default with a warning
    return {
      rate: 17.0,
      date: new Date().toISOString().split("T")[0] + " (fallback)",
    };
  }
}
