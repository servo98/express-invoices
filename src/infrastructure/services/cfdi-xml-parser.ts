import { create } from "xmlbuilder2";
import type { CfdiXmlParser, ParsedCfdi, ParsedCfdiItem, ParsedCfdiTax } from "@/domain/ports/services";

function attr(node: any, name: string): string {
  return node["@" + name] || node[name] || "";
}

function attrNum(node: any, name: string): number {
  const val = attr(node, name);
  return val ? parseFloat(val) : 0;
}

function attrNumOrNull(node: any, name: string): number | null {
  const val = attr(node, name);
  return val ? parseFloat(val) : null;
}

export class CfdiXmlParserImpl implements CfdiXmlParser {
  parse(xmlContent: string): ParsedCfdi {
    const doc = create(xmlContent);
    const obj = doc.end({ format: "object" }) as any;

    // Navigate the CFDI structure - handle namespace prefixes
    const comprobante =
      obj["cfdi:Comprobante"] ||
      obj["Comprobante"] ||
      Object.values(obj)[0] as any;

    if (!comprobante) {
      throw new Error("Invalid CFDI XML: missing Comprobante element");
    }

    // Emisor
    const emisor = comprobante["cfdi:Emisor"] || comprobante["Emisor"] || {};

    // Receptor
    const receptor = comprobante["cfdi:Receptor"] || comprobante["Receptor"] || {};

    // Conceptos
    const conceptosWrapper =
      comprobante["cfdi:Conceptos"] || comprobante["Conceptos"] || {};
    const conceptosRaw =
      conceptosWrapper["cfdi:Concepto"] || conceptosWrapper["Concepto"] || [];
    const conceptos = Array.isArray(conceptosRaw) ? conceptosRaw : [conceptosRaw];

    const items: ParsedCfdiItem[] = conceptos.map((c: any) => ({
      claveProdServ: attr(c, "ClaveProdServ"),
      cantidad: attrNum(c, "Cantidad"),
      claveUnidad: attr(c, "ClaveUnidad"),
      unidad: attr(c, "Unidad") || "Unidad de servicio",
      descripcion: attr(c, "Descripcion"),
      valorUnitario: attrNum(c, "ValorUnitario"),
      importe: attrNum(c, "Importe"),
      objetoImp: attr(c, "ObjetoImp") || "02",
    }));

    // Impuestos
    const impuestos = comprobante["cfdi:Impuestos"] || comprobante["Impuestos"] || {};
    const totalTrasladados = attrNum(impuestos, "TotalImpuestosTrasladados");
    const totalRetenidos = attrNum(impuestos, "TotalImpuestosRetenidos");

    const taxes: ParsedCfdiTax[] = [];

    // Traslados
    const trasladosWrapper = impuestos["cfdi:Traslados"] || impuestos["Traslados"] || {};
    const trasladosRaw = trasladosWrapper["cfdi:Traslado"] || trasladosWrapper["Traslado"];
    if (trasladosRaw) {
      const traslados = Array.isArray(trasladosRaw) ? trasladosRaw : [trasladosRaw];
      for (const t of traslados) {
        taxes.push({
          tipo: "traslado",
          impuesto: attr(t, "Impuesto"),
          base: attrNum(t, "Base"),
          tipoFactor: attr(t, "TipoFactor") || "Tasa",
          tasaOCuota: attrNum(t, "TasaOCuota"),
          importe: attrNum(t, "Importe"),
        });
      }
    }

    // Retenciones
    const retencionesWrapper = impuestos["cfdi:Retenciones"] || impuestos["Retenciones"] || {};
    const retencionesRaw = retencionesWrapper["cfdi:Retencion"] || retencionesWrapper["Retencion"];
    if (retencionesRaw) {
      const retenciones = Array.isArray(retencionesRaw) ? retencionesRaw : [retencionesRaw];
      for (const r of retenciones) {
        taxes.push({
          tipo: "retencion",
          impuesto: attr(r, "Impuesto"),
          base: attrNum(r, "Base"),
          tipoFactor: attr(r, "TipoFactor") || "Tasa",
          tasaOCuota: attrNum(r, "TasaOCuota"),
          importe: attrNum(r, "Importe"),
        });
      }
    }

    // Timbre Fiscal Digital (Complemento)
    const complemento = comprobante["cfdi:Complemento"] || comprobante["Complemento"] || {};
    const timbre =
      complemento["tfd:TimbreFiscalDigital"] ||
      complemento["TimbreFiscalDigital"] || {};

    const uuid = attr(timbre, "UUID");
    if (!uuid) {
      throw new Error("Invalid CFDI XML: missing TimbreFiscalDigital UUID");
    }

    return {
      fecha: attr(comprobante, "Fecha"),
      folio: attr(comprobante, "Folio") || null,
      serie: attr(comprobante, "Serie") || null,
      subtotal: attrNum(comprobante, "SubTotal"),
      total: attrNum(comprobante, "Total"),
      moneda: attr(comprobante, "Moneda") || "USD",
      tipoCambio: attrNumOrNull(comprobante, "TipoCambio"),
      formaPago: attr(comprobante, "FormaPago") || "99",
      metodoPago: attr(comprobante, "MetodoPago") || "PPD",
      lugarExpedicion: attr(comprobante, "LugarExpedicion") || null,
      tipoComprobante: attr(comprobante, "TipoDeComprobante") || "I",
      exportacion: attr(comprobante, "Exportacion") || "01",

      emisorRfc: attr(emisor, "Rfc"),
      emisorNombre: attr(emisor, "Nombre"),
      emisorRegimenFiscal: attr(emisor, "RegimenFiscal"),

      receptorRfc: attr(receptor, "Rfc") || "XEXX010101000",
      receptorNombre: attr(receptor, "Nombre"),
      receptorResidenciaFiscal: attr(receptor, "ResidenciaFiscal") || null,
      receptorNumRegIdTrib: attr(receptor, "NumRegIdTrib") || null,
      receptorRegimenFiscalReceptor: attr(receptor, "RegimenFiscalReceptor") || null,
      receptorUsoCfdi: attr(receptor, "UsoCFDI") || "S01",

      items,
      totalImpuestosTrasladados: totalTrasladados,
      totalImpuestosRetenidos: totalRetenidos,
      taxes,

      uuid,
      fechaTimbrado: attr(timbre, "FechaTimbrado"),
      selloCfd: attr(timbre, "SelloCFD"),
      selloSat: attr(timbre, "SelloSAT"),
      noCertificadoSat: attr(timbre, "NoCertificadoSAT"),
      cadenaOriginal: `||1.1|${uuid}|${attr(timbre, "FechaTimbrado")}|${attr(timbre, "SelloCFD")}|${attr(timbre, "NoCertificadoSAT")}||`,

      xmlContent,
    };
  }
}
