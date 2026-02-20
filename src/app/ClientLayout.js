"use client";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider, useLanguage } from "../context/LanguageContext"; 
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Phone, Mail, Clock, Facebook, Map, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isSpecialPage = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <AuthProvider>
      <LanguageProvider>
        {!isSpecialPage && <Navbar />}
        <main className="min-h-screen bg-white">{children}</main>
        {!isSpecialPage && <Footer />}
      </LanguageProvider>
    </AuthProvider>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, switchLanguage, t } = useLanguage();

  const navLinks = [
    { name: t.navbar.home, href: "/#hero" },
    { name: t.navbar.products, href: "/#products" },
    { name: t.navbar.about, href: "/about" },
    { name: t.navbar.contact, href: "#footer" },
  ];

  return (
    <>
      <nav 
        className="fixed w-full z-100 bg-white/95 backdrop-blur-md border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center transition-all"
        style={{ transform: 'translate3d(0,0,0)', WebkitTransform: 'translate3d(0,0,0)' }}
      >
        <Link href="/#hero" className="relative z-110">
          <Image src="/images/Logo cl.png" alt="Winfood Logo" width={140} height={45} className="object-contain w-30 md:w-37.5" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-600 tracking-wide">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-600 transition-colors uppercase">
              {link.name}
            </Link>
          ))}
          
          <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
            <button onClick={() => switchLanguage('en')} className={`px-2 py-1 rounded text-xs font-black ${lang === 'en' ? 'bg-slate-100 text-green-600' : 'text-slate-400'}`}>EN</button>
            <button onClick={() => switchLanguage('th')} className={`px-2 py-1 rounded text-xs font-black ${lang === 'th' ? 'bg-slate-100 text-green-600' : 'text-slate-400'}`}>TH</button>
          </div>
        </div>

        <button className="lg:hidden relative z-110 p-2 text-slate-800" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-100 flex flex-col items-center justify-center gap-8 lg:hidden pt-20"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-slate-800 tracking-widest uppercase">
                {link.name}
              </Link>
            ))}
            <div className="flex gap-6 mt-8 pt-8 border-t w-1/2 justify-center">
                <button onClick={() => {switchLanguage('en'); setIsOpen(false);}} className={`text-xl font-bold ${lang === 'en' ? 'text-green-600' : 'text-slate-400'}`}>EN</button>
                <button onClick={() => {switchLanguage('th'); setIsOpen(false);}} className={`text-xl font-bold ${lang === 'th' ? 'text-green-600' : 'text-slate-400'}`}>TH</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer id="footer" className="bg-[#111] text-white pt-10 md:pt-24 pb-8 md:pb-10 px-6 font-sans">
      
      {/* Grid: ลด Gap บนมือถือลง (gap-8 -> gap-6) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 pb-8 md:pb-20 border-b border-white/10">
        
        {/* 1. Logo & Intro */}
        <div className="space-y-4 md:space-y-6">
          <Image src="/images/Logo white.png" alt="Winfood White" width={160} height={50} className="object-contain" />
          <p className="text-gray-400 text-sm leading-relaxed">{t.footer.intro}</p>
        </div>

        {/* 2. Address */}
        <div className="space-y-3 md:space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">{t.footer.addressTitle}</h4>
          <div className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
            <MapPin size={18} className="text-green-500 shrink-0 mt-1" />
            <span>9 Chalermprakiat Rama 9 Road<br/> Soi 48 Yak 15, Dokmai Prawet<br/> Bangkok Thailand 10250<br/><br/>
              <span className="opacity-60 text-xs font-thai">9 ซอยเฉลิมพระเกียรติ ร.9 ซอย 48 แยก 15<br/> แขวงดอกไม้ เขตประเวศ กรุงเทพมหานคร 10250</span>
            </span>
          </div>
        </div>

        {/* 3. Contact (ปรับให้กระชับบนมือถือ) */}
        <div className="space-y-3 md:space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">{t.footer.contactTitle}</h4>
          
          {/* ใช้ Flex wrap บนมือถือเพื่อให้ Email กับ Phone อยู่บรรทัดเดียวกันได้ถ้าจอใหญ่พอ */}
          <div className="flex flex-col sm:flex-row md:flex-col flex-wrap gap-2 md:gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-3 min-w-50">
                <Mail size={18} className="text-green-500 shrink-0" />
                <span>contact@winfic.com</span>
            </div>
            <div className="flex items-center gap-3 min-w-37.5">
                <Phone size={18} className="text-green-500 shrink-0" />
                <span>+66 2726 6732</span>
            </div>
            <div className="flex items-start gap-3 w-full">
                <Clock size={18} className="text-green-500 mt-0.5 shrink-0" />
                <span>9AM - 4PM<br/>MON - FRI</span>
            </div>
          </div>
        </div>

        {/* 4. Follow Us & Shopee */}
        <div className="space-y-4 md:space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">{t.footer.followTitle}</h4>
          
          {/* Social Icons */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-all"><Facebook size={18} /></a>
            <a href="https://lin.ee/xyqoDch" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#06C755] transition-all group text-white"><span className="text-[10px] font-black tracking-tight group-hover:scale-110 transition-transform">LINE</span></a>
            <a href="https://maps.app.goo.gl/83yvBaikXtVsqVkT9" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 transition-all"><Map size={18} /></a>
          </div>

          {/* Shopee Banner (เอาหัวข้อออก และปรับระยะห่าง) */}
          <div className="pt-2 md:pt-4 border-t border-white/10 mt-2 md:mt-6">
            <a 
              href="https://shopee.co.th/goodtasteofficial"  // 🟢 1. ใส่ลิงก์ตรงนี้
              target="_blank"             // 🟢 2. เพิ่มบรรทัดนี้ เพื่อให้เปิดแท็บใหม่
              rel="noopener noreferrer"   // 🟢 3. เพิ่มบรรทัดนี้ เพื่อความปลอดภัย
              className="bg-[#EE4D2D] hover:bg-[#ff5535] text-white pl-3 pr-4 py-2 rounded-lg inline-flex items-center gap-3 transition-all shadow-lg hover:-translate-y-1 group w-full md:w-auto justify-center md:justify-start"
            >
                <div className="bg-white/20 p-1.5 rounded-md group-hover:bg-white/30 transition-colors">
                    <ShoppingBag size={18} className="text-white"/>
                </div>
                <div className="flex flex-col leading-none text-left">
                    <span className="text-[8px] opacity-80 font-medium mb-0.5">Shop on</span>
                    <span className="text-sm font-black tracking-wide">Shopee</span>
                </div>
            </a>
          </div>
          
        </div>
      </div>
      
      {/* Copyright */}
      <div className="max-w-7xl mx-auto pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-gray-500 uppercase tracking-widest text-center md:text-left">
        <span>© 2026 WINFOOD INDUSTRY CORPORATION.</span>
        <span>{t.footer.rights}</span>
      </div>
    </footer>
  );
}