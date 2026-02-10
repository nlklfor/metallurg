import { Footer } from "@/components";
import { Navbar } from "@/components";
import { Iphone } from "@/components/ui/iphone";
import phone from "@/assets/images/phone-screenshot.png";
import { Instagram, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar variant="light" />

      <div className="px-8 py-16">
        <h2 className="text-5xl font-bold text-black mb-4">Contact</h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Have a question or want to get in touch? We'd love to hear from you.
        </p>
      </div>

      <div className="px-8 pb-16 flex flex-col items-center">
        <div className="flex gap-6 mb-8">
          <a
            href="https://instagram.com/metallurg.tm"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-black rounded-full hover:bg-gray-800 transition"
          >
            <Instagram size={32} className="text-white" />
          </a>
          <a
            href="https://t.me/+W3cgJ6lB7_s0ODMy"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-black rounded-full hover:bg-gray-800 transition"
          >
            <Send size={32} className="text-white" />
          </a>
        </div>

        <div className="w-[434px] dark">
          <Iphone src={phone} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
