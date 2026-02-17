"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Truck, Users } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="font-sans text-[#1d1d1f] pt-32"> 
      <div className="relative h-[70vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
            <Image src="https://images.unsplash.com/photo-1491480020956-6ab214f9ddf6?auto=format&fit=crop&q=80&w=2000" alt="Header Bg" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/80"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3">{t.aboutPage.tag}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                {t.aboutPage.subTitle} <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-200">{t.aboutPage.subTitleGreen}</span>
            </motion.h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">{t.aboutPage.storyTitle}</h2>
                <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                <p className="text-slate-600 leading-8 text-lg font-light text-justify">{t.aboutPage.storyDesc}</p>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500">
                <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" alt="Office" fill className="object-cover" />
            </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: <ShieldCheck size={32} className="text-green-600"/>, title: t.aboutPage.val1Title, desc: t.aboutPage.val1Desc },
                { icon: <Truck size={32} className="text-blue-600"/>, title: t.aboutPage.val2Title, desc: t.aboutPage.val2Desc },
                { icon: <Users size={32} className="text-purple-600"/>, title: t.aboutPage.val3Title, desc: t.aboutPage.val3Desc }
            ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
                </div>
            ))}
        </section>
      </div>
    </div>
  );
}