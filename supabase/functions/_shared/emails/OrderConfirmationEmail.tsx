import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "npm:@react-email/components@^1";
import * as React from "npm:react@^19";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "./logo.ts";

interface OrderConfirmationEmailItem {
  name: string;
  selectedSize: string | number | null;
  price: number;
  cart_quantity: number;
  imageUrl: string | null;
}

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderConfirmationEmailItem[];
  itemsTotal: number;
  deliveryCost: number;
  totalPrice: number;
  shippingZone: "Ukraine" | "International";
  city: string | null;
  npBranch: string | null;
}

function formatUAH(value: number): string {
  return `${value.toLocaleString("en-US")} UAH`;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  itemsTotal,
  deliveryCost,
  totalPrice,
  shippingZone,
  city,
  npBranch,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Order {orderNumber} confirmed — METALLURG™</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>// ORDER_CONFIRMED</Text>
        <Img src={LOGO_SRC} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="METALLURG" style={logo} />

        <Text style={text}>
          {customerName}, your order has been received and is now{" "}
          <strong>waiting for payment confirmation</strong>.
        </Text>

        <Section style={orderNumberBox}>
          <Text style={orderNumberLabel}>ORDER_NUMBER</Text>
          <Text style={orderNumberValue}>{orderNumber}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={eyebrow}>// ITEMS</Text>
        {items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column width={56}>
              {item.imageUrl && (
                <Img src={item.imageUrl} width="48" height="48" alt={item.name} style={itemThumb} />
              )}
            </Column>
            <Column>
              <Text style={itemName}>
                {item.name}
                {item.selectedSize ? ` — SIZE ${item.selectedSize}` : ""}
              </Text>
              <Text style={itemQty}>QTY {item.cart_quantity}</Text>
            </Column>
            <Column align="right">
              <Text style={itemPrice}>{formatUAH(item.price * item.cart_quantity)}</Text>
            </Column>
          </Row>
        ))}

        <Hr style={hr} />

        <Row>
          <Column>
            <Text style={summaryLabel}>SUBTOTAL</Text>
          </Column>
          <Column align="right">
            <Text style={summaryValue}>{formatUAH(itemsTotal)}</Text>
          </Column>
        </Row>
        {shippingZone === "Ukraine" && (
          <Row>
            <Column>
              <Text style={summaryLabel}>DELIVERY (NOVA POSHTA)</Text>
            </Column>
            <Column align="right">
              <Text style={summaryValue}>{formatUAH(deliveryCost)}</Text>
            </Column>
          </Row>
        )}
        <Row>
          <Column>
            <Text style={totalLabel}>TOTAL</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{formatUAH(totalPrice)}</Text>
          </Column>
        </Row>

        <Hr style={hr} />

        <Text style={eyebrow}>// DELIVERY</Text>
        <Text style={text}>
          {shippingZone === "Ukraine"
            ? `${city} — ${npBranch}`
            : "International — details as provided at checkout"}
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Track this order anytime at metallurg.tm using order number {orderNumber}. Questions?
          Reply to this email or reach us on Telegram.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
};

const container = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "40px 24px",
};

const eyebrow = {
  fontSize: "10px",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  color: "#9ca3af",
  margin: "0 0 8px",
};

const logo = {
  margin: "0 0 24px",
};

const text = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#111827",
  margin: "0 0 20px",
};

const orderNumberBox = {
  border: "1px solid #000000",
  padding: "16px 20px",
  margin: "0 0 24px",
};

const orderNumberLabel = {
  fontSize: "9px",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  color: "#9ca3af",
  margin: "0 0 4px",
};

const orderNumberValue = {
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "0.05em",
  color: "#000000",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const itemRow = {
  marginBottom: "10px",
};

const itemThumb = {
  objectFit: "cover" as const,
  border: "1px solid #e5e7eb",
};

const itemName = {
  fontSize: "12px",
  color: "#000000",
  margin: "0",
  textTransform: "uppercase" as const,
};

const itemQty = {
  fontSize: "10px",
  color: "#9ca3af",
  margin: "2px 0 0",
};

const itemPrice = {
  fontSize: "12px",
  color: "#000000",
  margin: "0",
};

const summaryLabel = {
  fontSize: "11px",
  color: "#4b5563",
  margin: "4px 0",
};

const summaryValue = {
  fontSize: "11px",
  color: "#111827",
  margin: "4px 0",
};

const totalLabel = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#000000",
  margin: "8px 0",
  textTransform: "uppercase" as const,
};

const totalValue = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#000000",
  margin: "8px 0",
};

const footer = {
  fontSize: "10px",
  lineHeight: "18px",
  color: "#9ca3af",
  margin: "0",
};
