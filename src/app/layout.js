// src/app/layout.js
import "./globals.css";
import { Inter, Prompt } from "next/font/google";
import ClientLayout from "./ClientLayout"; // นำเข้าตัวที่เราแยกออกไปเมื่อกี้

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const prompt = Prompt({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap", 
});

// 🟢 ตั้งชื่อ Tab ตรงนี้ครับ!
export const metadata = {
  title: "Winfood Industry Corporation", // ชื่อที่จะขึ้นบน Tab
  description: "International importing and exporting company based in Thailand, supplying best quality agriculture products worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${prompt.variable} font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}