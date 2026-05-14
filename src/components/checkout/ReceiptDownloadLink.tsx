import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptDocument from "@/components/checkout/ReceiptDocument";
import type { ReceiptData } from "@/components/checkout/ReceiptDocument";

export default function ReceiptDownloadLink({ data }: { data: ReceiptData }) {
  return (
    <PDFDownloadLink
      document={<ReceiptDocument data={data} />}
      fileName={`${data.orderNumber}_receipt.pdf`}
      className="block text-center text-[10px] font-ibm-mono text-gray-400 hover:text-black tracking-[0.2em] uppercase transition-colors"
    >
      {({ loading }: { loading: boolean }) => (loading ? "GENERATING..." : "↓ DOWNLOAD_RECEIPT")}
    </PDFDownloadLink>
  );
}
