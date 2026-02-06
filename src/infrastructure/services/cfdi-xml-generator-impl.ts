import { create } from "xmlbuilder2";
import type { CfdiXmlGenerator } from "@/domain/ports/services";
import type { Invoice } from "@/domain/entities/invoice";
import type { User } from "@/domain/entities/user";
import { formatCfdiAmount, formatCfdiTotal } from "@/domain/value-objects/money";

function formatCfdiDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export class CfdiXmlGeneratorImpl implements CfdiXmlGenerator {
  generate(invoice: Invoice, user: User): string {
    const subtotal = formatCfdiTotal(invoice.subtotal);
    const total = formatCfdiTotal(invoice.total);
    const totalTraslados = formatCfdiTotal(invoice.totalImpuestosTrasladados);
    const totalRetenciones = formatCfdiTotal(invoice.totalImpuestosRetenidos);

    const doc = create({ version: "1.0", encoding: "utf-8" })
      .ele("cfdi:Comprobante", {
        "xsi:schemaLocation":
          "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd",
        "Version": "4.0",
        "Fecha": formatCfdiDate(invoice.fecha),
        "FormaPago": invoice.formaPago,
        "SubTotal": subtotal,
        "Moneda": invoice.moneda,
        ...(invoice.tipoCambio
          ? { TipoCambio: invoice.tipoCambio.toFixed(6) }
          : {}),
        "Total": total,
        "TipoDeComprobante": invoice.tipoComprobante,
        "Exportacion": invoice.exportacion,
        "MetodoPago": invoice.metodoPago,
        "LugarExpedicion": invoice.lugarExpedicion || user.codigoPostal || "",
        "xmlns:cfdi": "http://www.sat.gob.mx/cfd/4",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      });

    // Emisor
    doc
      .ele("cfdi:Emisor", {
        Rfc: user.rfc || "",
        Nombre: (user.razonSocial || user.name || "").toUpperCase(),
        RegimenFiscal: user.regimenFiscal || "626",
      })
      .up();

    // Receptor
    const receptorAttrs: Record<string, string> = {
      Rfc: invoice.receptorRfc,
      Nombre: invoice.receptorNombre || "Rfc generico extranjero",
      DomicilioFiscalReceptor: invoice.receptorCp || user.codigoPostal || "",
      RegimenFiscalReceptor: invoice.regimenFiscalReceptor || "616",
      UsoCFDI: invoice.usoCfdi,
    };
    if (invoice.residenciaFiscal) {
      receptorAttrs.ResidenciaFiscal = invoice.residenciaFiscal;
    }
    if (invoice.numRegIdTrib) {
      receptorAttrs.NumRegIdTrib = invoice.numRegIdTrib;
    }
    doc.ele("cfdi:Receptor", receptorAttrs).up();

    // Conceptos
    const conceptos = doc.ele("cfdi:Conceptos");

    for (const item of invoice.items) {
      const concepto = conceptos.ele("cfdi:Concepto", {
        ClaveProdServ: item.claveProdServ,
        Cantidad: String(item.cantidad),
        ClaveUnidad: item.claveUnidad,
        Unidad: item.unidad,
        Descripcion: item.descripcion,
        ValorUnitario: String(item.valorUnitario),
        Importe: formatCfdiAmount(item.importe),
        ObjetoImp: item.objetoImp,
      });

      // Item-level taxes
      const impuestos = concepto.ele("cfdi:Impuestos");

      // Traslados (IVA 0%)
      const traslados = impuestos.ele("cfdi:Traslados");
      traslados
        .ele("cfdi:Traslado", {
          Base: formatCfdiAmount(item.importe),
          Impuesto: "002",
          TipoFactor: "Tasa",
          TasaOCuota: "0.000000",
          Importe: "0.000000",
        })
        .up();
      traslados.up();

      // Retenciones (ISR 0%)
      const retenciones = impuestos.ele("cfdi:Retenciones");
      retenciones
        .ele("cfdi:Retencion", {
          Base: formatCfdiAmount(item.importe),
          Impuesto: "001",
          TipoFactor: "Tasa",
          TasaOCuota: "0.000000",
          Importe: "0.000000",
        })
        .up();
      retenciones.up();

      impuestos.up();
      concepto.up();
    }
    conceptos.up();

    // Global Impuestos
    const globalImpuestos = doc.ele("cfdi:Impuestos", {
      TotalImpuestosTrasladados: totalTraslados,
      TotalImpuestosRetenidos: totalRetenciones,
    });

    // Global Retenciones
    const gRetenciones = globalImpuestos.ele("cfdi:Retenciones");
    gRetenciones.ele("cfdi:Retencion", { Impuesto: "001", Importe: totalRetenciones }).up();
    gRetenciones.up();

    // Global Traslados
    const gTraslados = globalImpuestos.ele("cfdi:Traslados");
    gTraslados
      .ele("cfdi:Traslado", {
        Base: subtotal,
        Impuesto: "002",
        TipoFactor: "Tasa",
        TasaOCuota: "0.000000",
        Importe: totalTraslados,
      })
      .up();
    gTraslados.up();
    globalImpuestos.up();

    return doc.end({ prettyPrint: true });
  }
}
