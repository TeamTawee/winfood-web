"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChefHat, Globe, Zap, Quote } from "lucide-react"; // เปลี่ยนชุดไอคอนใหม่
import { useLanguage } from "../../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const sections = [
    { 
      icon: <ChefHat size={32} className="text-green-600"/>, 
      title: t.aboutPage.expertiseTitle, 
      items: t.aboutPage.expertiseItems 
    },
    { 
      icon: <Globe size={32} className="text-blue-600"/>, 
      title: t.aboutPage.reachTitle, 
      items: t.aboutPage.reachItems 
    },
    { 
      icon: <Zap size={32} className="text-orange-500"/>, 
      title: t.aboutPage.marketingTitle, 
      items: t.aboutPage.marketingItems 
    }
  ];

  return (
    <div className="font-sans text-[#1d1d1f] pt-32 bg-white"> 
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/80"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-3">{t.aboutPage.tag}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase">
                {t.aboutPage.subTitle} <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-200">{t.aboutPage.subTitleGreen}</span>
            </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* Story Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t.aboutPage.storyTitle}</h2>
                <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                <p className="text-slate-800 leading-8 text-lg font-light text-justify">{t.aboutPage.storyDesc}</p>
            </div>
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-all duration-700 group">
                <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000" alt="Office" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
        </section>

        {/* 3 Pillars Grid Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {sections.map((section, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 shrink-0">{section.icon}</div>
                    <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">{section.title}</h3>
                    
                    {/* Render List Items */}
                    <div className="space-y-4 flex-1">
                        {section.items.map((item, idx) => (
                            <div key={idx} className="text-sm leading-relaxed">
                                <span className="font-bold text-slate-800 block mb-0.5">{item.label}</span>
                                <span className="text-slate-700 font-light">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </section>

        {/* Vision Quote Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-16 md:py-24 border-t border-slate-100"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
             <Quote size={48} className="mx-auto text-green-500/20 mb-4" />
             <h2 className="text-2xl md:text-3xl font-light italic text-slate-800 leading-snug tracking-tight">
               {t.aboutPage.finalQuote}
             </h2>
             <div className="h-px w-20 bg-slate-200 mx-auto mt-8"></div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}