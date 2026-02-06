import React from "react";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { PdfGenerator } from "@/domain/ports/services";
import type { Invoice } from "@/domain/entities/invoice";
import type { User } from "@/domain/entities/user";
import { formatCurrency } from "@/domain/value-objects/money";
import { formatMonthYear } from "@/domain/value-objects/month-year";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  uuid: {
    fontSize: 8,
    color: "#666",
  },
  date: {
    fontSize: 10,
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  billedToName: {
    fontSize: 11,
    marginBottom: 2,
  },
  billedToDetail: {
    fontSize: 10,
    color: "#555",
    marginBottom: 2,
  },
  // Table
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  colTask: { width: "40%", fontFamily: "Helvetica-Bold", fontSize: 9 },
  colRate: { width: "20%", textAlign: "center", fontSize: 9 },
  colHours: { width: "20%", textAlign: "center", fontSize: 9 },
  colTotal: { width: "20%", textAlign: "right", fontSize: 9 },
  colTaskHeader: { width: "40%", fontFamily: "Helvetica-Bold", fontSize: 9 },
  colRateHeader: { width: "20%", textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 9 },
  colHoursHeader: { width: "20%", textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 9 },
  colTotalHeader: { width: "20%", textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 9 },
  // Total
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  totalValue: {
    fontSize: 11,
    marginLeft: 8,
  },
  // Payment info
  paymentSection: {
    marginTop: 40,
  },
  paymentTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 6,
  },
  paymentLine: {
    fontSize: 10,
    marginBottom: 2,
    color: "#444",
  },
  paymentRef: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  domesticNote: {
    fontSize: 13,
    marginTop: 16,
    color: "#1a1a1a",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
  },
  footerLine: {
    borderTopWidth: 0.5,
    borderTopColor: "#999",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerName: {
    fontSize: 10,
  },
  footerEmail: {
    fontSize: 10,
    color: "#555",
  },
  disclaimer: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});

function formatDatePdf(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).toUpperCase();
}

function InvoiceDocument({ invoice, user }: { invoice: Invoice; user: User }) {
  const monthLabel = formatMonthYear({ month: invoice.month, year: invoice.year });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.headerRow}>
            <Text style={styles.uuid}>{invoice.uuid}</Text>
            <Text style={styles.date}>{formatDatePdf(invoice.fecha)}</Text>
          </View>
        </View>

        {/* Billed To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLED TO:</Text>
          {invoice.billedToName && (
            <Text style={styles.billedToName}>{invoice.billedToName}</Text>
          )}
          {invoice.billedToAddress && (
            <Text style={styles.billedToDetail}>{invoice.billedToAddress}</Text>
          )}
          {invoice.billedToPhone && (
            <Text style={styles.billedToDetail}>{invoice.billedToPhone}</Text>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colTaskHeader}>TASK</Text>
            <Text style={styles.colRateHeader}>RATE</Text>
            <Text style={styles.colHoursHeader}>HOURS</Text>
            <Text style={styles.colTotalHeader}>TOTAL</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colTask}>{item.descripcion}</Text>
              <Text style={styles.colRate}>
                {item.cantidad === 1 && item.valorUnitario === item.importe
                  ? "Fixed Fee"
                  : formatCurrency(item.valorUnitario, invoice.moneda)}
              </Text>
              <Text style={styles.colHours}>{item.cantidad}</Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.importe, invoice.moneda)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL DUE:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.total, invoice.moneda)}
          </Text>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>PAYMENT INFORMATION:</Text>
          <Text style={styles.paymentLine}>Bank Transfer (ACH or Wire)</Text>
          {user.beneficiary && (
            <Text style={styles.paymentLine}>Beneficiary: {user.beneficiary}</Text>
          )}
          {user.bankName && (
            <Text style={styles.paymentLine}>Bank: {user.bankName}</Text>
          )}
          {user.accountNumber && (
            <Text style={styles.paymentLine}>Account Number: {user.accountNumber}</Text>
          )}
          {user.routingNumber && (
            <Text style={styles.paymentLine}>Routing (ABA): {user.routingNumber}</Text>
          )}
          {user.accountType && (
            <Text style={styles.paymentLine}>Account Type: {user.accountType}</Text>
          )}
          {user.bankCurrency && (
            <Text style={styles.paymentLine}>Currency: {user.bankCurrency}</Text>
          )}

          {invoice.paymentReference && (
            <>
              <Text style={styles.paymentRef}>Payment reference:</Text>
              <Text style={styles.paymentLine}>{invoice.paymentReference}</Text>
            </>
          )}

          <Text style={styles.domesticNote}>Domestic USD transfer (ACH or Wire).</Text>
          <Text style={styles.domesticNote}>Do not send as international wire.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine}>
            <Text style={styles.footerName}>
              {user.razonSocial || user.name || ""}
            </Text>
            <Text style={styles.footerEmail}>{user.email || ""}</Text>
          </View>
          <Text style={styles.disclaimer}>
            &quot;This is a commercial invoice for client records. Official Mexican CFDI
            has been issued separately.&quot;
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export class ReactPdfGenerator implements PdfGenerator {
  async generate(invoice: Invoice, user: User): Promise<Buffer> {
    const buffer = await renderToBuffer(
      <InvoiceDocument invoice={invoice} user={user} />,
    );
    return Buffer.from(buffer);
  }
}
