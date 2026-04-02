// src/app/layout.js
import "./globals.css";
import { Inter, Prompt } from "next/font/google";
import ClientLayout from "./ClientLayout";
import Script from "next/script"; // 🟢 1. นำเข้า Script ของ Next.js

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

export const metadata = {
  title: "Winfood Industry Corporation",
  description: "International importing and exporting company based in Thailand, supplying best quality agriculture products worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 🟢 2. วางโค้ด Meta Pixel ไว้ใน Head */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2302102800316332');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${prompt.variable} font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}