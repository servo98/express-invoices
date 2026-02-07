import type { ExchangeRateService } from "@/domain/ports/services";

export class DofExchangeRateService implements ExchangeRateService {
  async getUsdToMxn(): Promise<{ rate: number; date: string }> {
    // Try Banxico SIE API first (if token configured)
    const banxicoToken = process.env.BANXICO_TOKEN;
    if (banxicoToken) {
      try {
        const result = await this.fetchBanxico(banxicoToken);
        if (result) return result;
      } catch {
        // Fallback to next source
      }
    }

    // Try ExchangeRate-API (free, no auth)
    try {
      const result = await this.fetchExchangeRateApi();
      if (result) return result;
    } catch {
      // Fallback below
    }

    // Last resort fallback
    return {
      rate: 17.0,
      date: new Date().toISOString().split("T")[0] + " (fallback - configure BANXICO_TOKEN for official rate)",
    };
  }

  private async fetchBanxico(token: string): Promise<{ rate: number; date: string } | null> {
    // Serie SF43718 = Tipo de cambio FIX (dato crudo de Banxico)
    // Pedimos los ultimos 5 dias para tener margen con fines de semana
    const today = new Date();
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/${formatDate(fiveDaysAgo)}/${formatDate(today)}`;

    const response = await fetch(url, {
      headers: {
        "Bmx-Token": token,
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const series = data?.bmx?.series?.[0]?.datos;
    if (!series || series.length === 0) return null;

    // REGLA DE ORO: El tipo de cambio FIX de hoy se publica en el DOF de manana.
    // Si el ultimo dato tiene fecha de hoy, significa que Banxico ya lo calculo
    // pero NO es vigente todavia en el DOF. Hay que tomar el penultimo.
    const hoy = today.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Mexico_City",
    });

    let datoAUsar = series[series.length - 1];

    if (datoAUsar.fecha === hoy && series.length > 1) {
      // El dato de hoy es "futuro fiscal" - usar el anterior (vigente DOF)
      datoAUsar = series[series.length - 2];
    }

    return {
      rate: parseFloat(datoAUsar.dato),
      date: datoAUsar.fecha + " (DOF vigente)",
    };
  }

  private async fetchExchangeRateApi(): Promise<{ rate: number; date: string } | null> {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.result === "success" && data?.rates?.MXN) {
      const date = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      return {
        rate: Math.round(data.rates.MXN * 10000) / 10000,
        date: date + " (ExchangeRate-API)",
      };
    }
    return null;
  }
}
