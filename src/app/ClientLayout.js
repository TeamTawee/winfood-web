// src/app/ClientLayout.js
"use client";
import { AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Phone, Mail, Clock, Facebook, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isSpecialPage = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <AuthProvider>
      {!isSpecialPage && <Navbar />}
      <main className="min-h-screen bg-white">{children}</main>
      {!isSpecialPage && <Footer />}
    </AuthProvider>
  );
}

// --- COMPONENTS ---

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: "HOME", href: "/#hero" },
    { name: "PRODUCTS", href: "/#products" },
    { name: "ABOUT US", href: "/about" },
    { name: "CONTACT", href: "#footer" },
  ];

  return (
    <>
      <nav className="fixed w-full z-[100] bg-white/95 backdrop-blur-md border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <Link href="/#hero" className="relative z-[110]">
          <Image src="/images/Logo cl.png" alt="Winfood Logo" width={140} height={45} className="object-contain w-30 md:w-37.5" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-600 tracking-wide">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-green-600 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <button className="lg:hidden relative z-[110] p-2 text-slate-800" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center gap-8 lg:hidden pt-20"
          >
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-slate-800 tracking-widest">
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  return (
    <footer id="footer" className="bg-[#111] text-white pt-24 pb-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-20 border-b border-white/10">
        
        {/* Column 1: Logo & Intro */}
        <div className="space-y-6">
          <Image src="/images/Logo white.png" alt="Winfood White" width={160} height={50} className="object-contain" />
          <p className="text-gray-400 text-sm leading-relaxed">
            International importing and exporting company based in Thailand, supplying best quality agriculture products worldwide.
          </p>
        </div>

        {/* Column 2: Address */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">Address</h4>
          <div className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
            <MapPin size={18} className="text-green-500 shrink-0 mt-1" />
            <span>
              9 Chalermprakiat Rama 9 Road<br/> Soi 48 Yak 15, Dokmai Prawet<br/> Bangkok Thailand 10250
              <br/><br/>
              <span className="opacity-60 text-xs font-thai">
              9 ซอยเฉลิมพระเกียรติ ร.9 ซอย 48 แยก 15<br/> แขวงดอกไม้ เขตประเวศ กรุงเทพมหานคร 10250
              </span>
            </span>
          </div>
        </div>

        {/* Column 3: Contact */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">Contact</h4>
          <ul className="space-y-4 text-gray-300 text-sm">
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-green-500" />
              <span>contact@winfic.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-green-500" />
              <span>+66 2726 6732</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={18} className="text-green-500 mt-0.5" />
              <span>
                9AM - 4PM<br/>MON - FRI
              </span>
            </li>
          </ul>
        </div>

        {/* Column 4: Links */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">Follow Us</h4>
          <div className="flex gap-4">
            
            {/* Facebook */}
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-all">
              <Facebook size={18} />
            </a>
            
            {/* LINE: Text version */}
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#06C755] transition-all group text-white">
              <span className="text-[10px] font-black tracking-tight group-hover:scale-110 transition-transform">LINE</span>
            </a>

            {/* Google Map */}
            <a 
              href="https://maps.app.goo.gl/83yvBaikXtVsqVkT9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 transition-all"
            >
              <Map size={18} />
            </a>

          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
        <span>© 2026 WINFOOD INDUSTRY CORPORATION.</span>
        <span>ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
}