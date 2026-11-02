import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptDocument from "@/components/checkout/ReceiptDocument";
import type { ReceiptData } from "@/components/checkout/ReceiptDocument";

export default function ReceiptDownloadLink({ data }: { data: ReceiptData }) {
  return (
    <PDFDownloadLink
      document={<ReceiptDocument data={data} />}
      fileName={`${data.orderNumber}_receipt.pdf`}
      className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.15em] !text-ink transition-colors hover:bg-ink hover:!text-paper"
    >
      {({ loading }: { loading: boolean }) => (loading ? "GENERATING..." : "↓ DOWNLOAD_RECEIPT")}
    </PDFDownloadLink>
  );
}
