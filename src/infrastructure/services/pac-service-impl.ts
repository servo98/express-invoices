import type { PacService, PacTimbradoResult } from "@/domain/ports/services";

interface PacConfig {
  provider: "finkok" | "swsapien";
  username: string;
  password: string;
  environment: "sandbox" | "production";
}

function getPacConfig(): PacConfig | null {
  const provider = process.env.PAC_PROVIDER as "finkok" | "swsapien" | undefined;
  const username = process.env.PAC_USERNAME;
  const password = process.env.PAC_PASSWORD;
  const environment = (process.env.PAC_ENVIRONMENT || "sandbox") as "sandbox" | "production";

  if (!provider || !username || !password) return null;

  return { provider, username, password, environment };
}

const FINKOK_URLS = {
  sandbox: "https://demo-facturacion.finkok.com/servicios/soap/stamp.wsdl",
  production: "https://facturacion.finkok.com/servicios/soap/stamp.wsdl",
};

const FINKOK_CANCEL_URLS = {
  sandbox: "https://demo-facturacion.finkok.com/servicios/soap/cancel.wsdl",
  production: "https://facturacion.finkok.com/servicios/soap/cancel.wsdl",
};

export class PacServiceImpl implements PacService {
  private config: PacConfig | null;

  constructor() {
    this.config = getPacConfig();
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  async timbrar(xmlBase: string): Promise<PacTimbradoResult> {
    if (!this.config) {
      throw new Error("PAC service is not configured. Set PAC_PROVIDER, PAC_USERNAME, and PAC_PASSWORD environment variables.");
    }

    if (this.config.provider === "finkok") {
      return this.timbrarFinkok(xmlBase);
    }

    return this.timbrarSwSapien(xmlBase);
  }

  async cancelar(
    uuid: string,
    rfcEmisor: string,
    motivo: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      throw new Error("PAC service is not configured.");
    }

    if (this.config.provider === "finkok") {
      return this.cancelarFinkok(uuid, rfcEmisor, motivo);
    }

    return this.cancelarSwSapien(uuid, rfcEmisor, motivo);
  }

  private async timbrarFinkok(xmlBase: string): Promise<PacTimbradoResult> {
    const config = this.config!;
    const url = FINKOK_URLS[config.environment];

    const xmlB64 = Buffer.from(xmlBase, "utf-8").toString("base64");

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stam="apps.services.soap.core.views">
  <soapenv:Body>
    <stam:stamp>
      <stam:xml>${xmlB64}</stam:xml>
      <stam:username>${config.username}</stam:username>
      <stam:password>${config.password}</stam:password>
    </stam:stamp>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "stamp",
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      throw new Error(`Finkok stamp request failed: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    return this.parseFinkokStampResponse(responseText);
  }

  private parseFinkokStampResponse(responseXml: string): PacTimbradoResult {
    // Extract values from SOAP response using regex (avoiding XML parser dependency for SOAP)
    const extractTag = (tag: string): string => {
      const match = responseXml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return match?.[1]?.trim() || "";
    };

    const xml = extractTag("xml");
    const uuid = extractTag("UUID");
    const fechaTimbrado = extractTag("FechaTimbrado");
    const selloCfd = extractTag("SelloCFD");
    const selloSat = extractTag("SelloSAT");
    const noCertificadoSat = extractTag("NoCertificadoSAT");
    const cadenaOriginal = extractTag("CadenaOriginalSAT");

    // Check for errors
    const codigoError = extractTag("CodEstatus");
    if (codigoError && !codigoError.includes("Comprobante timbrado")) {
      const incidencias = extractTag("CodigoError");
      const mensajeIncidencia = extractTag("MensajeIncidencia");
      throw new Error(`Finkok timbrado error [${incidencias}]: ${mensajeIncidencia || codigoError}`);
    }

    if (!uuid) {
      throw new Error("Finkok timbrado failed: No UUID returned in response");
    }

    // Decode XML if it was returned as base64
    let decodedXml = xml;
    if (xml && !xml.startsWith("<?xml") && !xml.startsWith("<cfdi:")) {
      try {
        decodedXml = Buffer.from(xml, "base64").toString("utf-8");
      } catch {
        decodedXml = xml;
      }
    }

    return {
      xml: decodedXml,
      uuid,
      fechaTimbrado,
      selloCfd,
      selloSat,
      noCertificadoSat,
      cadenaOriginal,
    };
  }

  private async cancelarFinkok(
    uuid: string,
    rfcEmisor: string,
    motivo: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = this.config!;
    const url = FINKOK_CANCEL_URLS[config.environment];

    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:can="apps.services.soap.core.views">
  <soapenv:Body>
    <can:cancel>
      <can:UUIDS>
        <can:uuids>
          <can:UUID>${uuid}</can:UUID>
          <can:Motivo>${motivo}</can:Motivo>
          <can:FolioSustitucion></can:FolioSustitucion>
        </can:uuids>
      </can:UUIDS>
      <can:username>${config.username}</can:username>
      <can:password>${config.password}</can:password>
      <can:taxpayer_id>${rfcEmisor}</can:taxpayer_id>
    </can:cancel>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "cancel",
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      return { success: false, message: `Cancel request failed: ${response.status}` };
    }

    const responseText = await response.text();
    const status = responseText.match(/<EstatusUUID>([^<]*)<\/EstatusUUID>/)?.[1] || "";

    return {
      success: status.includes("201") || status.includes("202"),
      message: status || "Cancel request sent",
    };
  }

  private async timbrarSwSapien(xmlBase: string): Promise<PacTimbradoResult> {
    const config = this.config!;
    const baseUrl = config.environment === "production"
      ? "https://services.sw.com.mx"
      : "https://services.test.sw.com.mx";

    // First, authenticate to get token
    const authResponse = await fetch(`${baseUrl}/security/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: config.username,
        password: config.password,
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`SW Sapien auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const token = authData.data?.token;
    if (!token) {
      throw new Error("SW Sapien auth failed: No token returned");
    }

    // Stamp the CFDI
    const stampResponse = await fetch(`${baseUrl}/cfdi33/stamp/v4`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        xml: Buffer.from(xmlBase, "utf-8").toString("base64"),
      }),
    });

    if (!stampResponse.ok) {
      throw new Error(`SW Sapien stamp failed: ${stampResponse.status}`);
    }

    const stampData = await stampResponse.json();

    if (stampData.status !== "success") {
      throw new Error(`SW Sapien timbrado error: ${stampData.message || stampData.messageDetail || "Unknown error"}`);
    }

    const data = stampData.data;
    return {
      xml: data.cfdi || "",
      uuid: data.uuid || "",
      fechaTimbrado: data.fechaTimbrado || "",
      selloCfd: data.selloCFDI || "",
      selloSat: data.selloSAT || "",
      noCertificadoSat: data.noCertificadoSAT || "",
      cadenaOriginal: data.cadenaOriginalSAT || "",
    };
  }

  private async cancelarSwSapien(
    uuid: string,
    rfcEmisor: string,
    motivo: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = this.config!;
    const baseUrl = config.environment === "production"
      ? "https://services.sw.com.mx"
      : "https://services.test.sw.com.mx";

    // Authenticate
    const authResponse = await fetch(`${baseUrl}/security/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: config.username,
        password: config.password,
      }),
    });

    if (!authResponse.ok) {
      return { success: false, message: `Auth failed: ${authResponse.status}` };
    }

    const authData = await authResponse.json();
    const token = authData.data?.token;

    const cancelResponse = await fetch(`${baseUrl}/cfdi33/cancel/${rfcEmisor}/${uuid}/${motivo}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const cancelData = await cancelResponse.json();
    return {
      success: cancelData.status === "success",
      message: cancelData.message || cancelData.data?.acuse || "Cancel request sent",
    };
  }
}
