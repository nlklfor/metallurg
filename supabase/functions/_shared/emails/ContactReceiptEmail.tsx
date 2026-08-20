import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Text,
} from "npm:@react-email/components@^1";
import * as React from "npm:react@^19";
import { LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "./logo.ts";

export interface ContactReceiptEmailProps {
  name: string;
  message: string;
}

export const ContactReceiptEmail = ({ name, message }: ContactReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>We received your message — METALLURG™</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>// MESSAGE_RECEIVED</Text>
        <Img src={LOGO_SRC} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="METALLURG" style={logo} />

        <Text style={text}>
          {name}, thanks for reaching out. We received your message and will get back to you within{" "}
          <strong>24 hours</strong>.
        </Text>

        <Hr style={hr} />

        <Text style={eyebrow}>// YOUR_MESSAGE</Text>
        <Text style={quotedMessage}>{message}</Text>

        <Hr style={hr} />

        <Text style={footer}>
          This is an automated confirmation — no need to reply here unless you'd like to add
          something. You can also reach us on Telegram or Instagram.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ContactReceiptEmail;

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

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const quotedMessage = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#374151",
  borderLeft: "2px solid #000000",
  padding: "2px 0 2px 16px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  fontSize: "10px",
  lineHeight: "18px",
  color: "#9ca3af",
  margin: "0",
};
