import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

export interface ReceiptData {
  orderNumber: string;
  customerName: string;
  contact: string;
  zone: string;
  items: Array<{
    name: string;
    selectedSize: string | number;
    price: number;
    cart_quantity?: number;
  }>;
  total: number;
  date: string;
  currency: "UAH" | "CHF" | "EUR";
}

function fmt(price: number, currency: "UAH" | "CHF" | "EUR"): string {
  if (currency === "CHF") return `CHF ${(price / 100).toFixed(2)}`;
  if (currency === "EUR") return `EUR ${(price / 100).toFixed(2)}`;
  return `${price.toLocaleString("uk-UA")} UAH`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Courier",
    padding: 48,
    fontSize: 9,
    color: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  brand: {
    fontSize: 22,
    fontFamily: "Courier-Bold",
    letterSpacing: 2,
  },
  receiptLabel: {
    fontSize: 7,
    letterSpacing: 3,
    color: "#6b7280",
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginVertical: 14,
  },
  dividerDark: {
    borderBottomWidth: 1,
    borderBottomColor: "#0a0a0a",
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 7,
    letterSpacing: 3,
    color: "#6b7280",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 7,
    letterSpacing: 2,
    color: "#6b7280",
    width: 90,
  },
  value: {
    fontSize: 9,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 7,
    letterSpacing: 2,
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  colProduct: { flex: 3 },
  colSize: { flex: 1, textAlign: "center" },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Courier-Bold",
    letterSpacing: 2,
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Courier-Bold",
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    letterSpacing: 2,
    color: "#9ca3af",
  },
  trackNote: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  trackNoteText: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  trackNoteId: {
    fontFamily: "Courier-Bold",
    color: "#0a0a0a",
  },
});

export default function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>METALLURG™</Text>
            <Text style={s.receiptLabel}>ARCHIVE / ORDER RECEIPT</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 18, fontFamily: "Courier-Bold" }}>{data.orderNumber}</Text>
            <Text style={s.receiptLabel}>{fmtDate(data.date)}</Text>
          </View>
        </View>

        <View style={s.dividerDark} />

        {/* Customer info */}
        <Text style={s.sectionTitle}>// ORDER DETAILS</Text>
        <View style={s.row}>
          <Text style={s.label}>CUSTOMER</Text>
          <Text style={s.value}>{data.customerName.toUpperCase()}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>CONTACT</Text>
          <Text style={s.value}>{data.contact}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>SHIPPING ZONE</Text>
          <Text style={s.value}>{data.zone.toUpperCase()}</Text>
        </View>

        <View style={s.divider} />

        {/* Items */}
        <Text style={s.sectionTitle}>// ITEMS</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colProduct]}>PRODUCT</Text>
          <Text style={[s.tableHeaderText, s.colSize]}>SIZE</Text>
          <Text style={[s.tableHeaderText, s.colQty]}>QTY</Text>
          <Text style={[s.tableHeaderText, s.colPrice]}>PRICE</Text>
        </View>
        <View style={s.divider} />
        {data.items.map((item, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={[s.colProduct, { fontSize: 9 }]}>{item.name.toUpperCase()}</Text>
            <Text style={[s.colSize, { fontSize: 9, textAlign: "center" }]}>
              {item.selectedSize}
            </Text>
            <Text style={[s.colQty, { fontSize: 9, textAlign: "center" }]}>
              {item.cart_quantity ?? 1}
            </Text>
            <Text style={[s.colPrice, { fontSize: 9, textAlign: "right" }]}>
              {fmt(item.price * (item.cart_quantity ?? 1), data.currency)}
            </Text>
          </View>
        ))}

        <View style={s.dividerDark} />

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalValue}>{fmt(data.total, data.currency)}</Text>
        </View>

        {/* Track note */}
        <View style={s.trackNote}>
          <Text style={s.trackNoteText}>
            USE ORDER ID <Text style={s.trackNoteId}>{data.orderNumber}</Text> IN THE TRACK_MY_ORDER
            SECTION TO CHECK YOUR DELIVERY STATUS.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>METALLURG™ — ARCHIVE_2026</Text>
          <Text style={s.footerText}>50.4501° N, 30.5234° E</Text>
        </View>
      </Page>
    </Document>
  );
}
