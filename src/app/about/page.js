"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChefHat, Globe, Zap, Quote, CheckCircle2 } from "lucide-react"; 
import { useLanguage } from "../../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const sections = [
    { 
      icon: <ChefHat size={32} className="text-green-600"/>, 
      bgIcon: <ChefHat size={280} className="text-green-600"/>, 
      title: t.aboutPage.expertiseTitle, 
      items: t.aboutPage.expertiseItems 
    },
    { 
      icon: <Globe size={32} className="text-blue-600"/>, 
      bgIcon: <Globe size={280} className="text-blue-600"/>, 
      title: t.aboutPage.reachTitle, 
      items: t.aboutPage.reachItems 
    },
    { 
      icon: <Zap size={32} className="text-orange-500"/>, 
      bgIcon: <Zap size={280} className="text-orange-500"/>, 
      title: t.aboutPage.marketingTitle, 
      items: t.aboutPage.marketingItems 
    }
  ];

  return (
    // 🟢 เปลี่ยน overflow-hidden เป็น overflow-x-clip เพื่อไม่ให้บัคกับ Sticky
    <div className="font-sans text-[#1d1d1f] bg-white pt-40 md:pt-56 pb-24 overflow-x-clip"> 
      <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-48">
        
        {/* 1. Story Section & Established Date */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
                <div>
                  <span className="inline-block py-1.5 px-4 rounded-full bg-green-50 text-green-700 text-xs font-black tracking-[0.2em] mb-6 border border-green-100 uppercase">
                    {t.aboutPage.tag}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                    {t.aboutPage.storyTitle}
                  </h2>
                  <div className="w-20 h-1.5 bg-green-500 mt-6 rounded-full"></div>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-light text-justify">
                  {t.aboutPage.storyDesc}
                </p>
            </motion.div>

            {/* Collage of 6 Images */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
                <div className="grid grid-cols-12 gap-3 md:gap-4">
                  {/* Left Column (5/12 width) */}
                  <div className="col-span-5 space-y-3 md:space-y-4 pt-8 md:pt-16">
                    <div className="relative aspect-3/4 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
                      <Image src="/images/abouthead-3.png" alt="About Image 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
                      <Image src="/images/abouthead-5.png" alt="About Image 5" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                  
                  {/* Right Column (7/12 width) */}
                  <div className="col-span-7 space-y-3 md:space-y-4">
                    <div className="relative aspect-4/3 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
                      <Image src="/images/abouthead-1.png" alt="About Image 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group bg-white">
                        <Image src="/images/abouthead-2.png" alt="About Image 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
                        <Image src="/images/abouthead-4.png" alt="About Image 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    </div>
                    {/* Added Image 6 */}
                    <div className="relative aspect-4/3 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group">
                      <Image src="/images/abouthead-6.png" alt="About Image 6" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </div>
                </div>
            </motion.div>
        </section>

        {/* 2. The 3 Pillars */}
        <section className="space-y-24 md:space-y-40 relative z-10">
            {sections.map((section, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className="flex flex-col md:flex-row gap-10 md:gap-16 items-start"
                >
                    {/* Left Column: Title & Icon */}
                    {/* 🟢 ใช้ h-fit เพื่อกำหนดให้ก้อนนี้มีความสูงเท่าเนื้อหา ช่วยให้ Sticky ล็อกตำแหน่งได้เป๊ะขึ้น */}
                    <div className="md:w-1/3 sticky top-40 md:top-56 h-fit min-h-70">
                        
                        {/* 🌟 Floating Watermark Animation 🌟 */}
                        <motion.div
                            animate={{ y: [-15, 15, -15], rotate: [-3, 3, -3] }}
                            transition={{ duration: 6 + (i * 2), repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-5 -left-10 md:-left-16 opacity-[0.04] -z-10 pointer-events-none will-change-transform transform-gpu"
                        >
                            {section.bgIcon}
                        </motion.div>

                        <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mb-6 border border-slate-100 relative z-10">
                          {section.icon}
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight relative z-10">
                          {section.title}
                        </h3>
                        <div className="w-12 h-1 bg-slate-200 mt-6 rounded-full hidden md:block relative z-10"></div>
                    </div>
                    
                    {/* Right Column: Content Items in a grid */}
                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 bg-linear-to-bl from-slate-100 to-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.05)] relative z-10">
                        {section.items.map((item, idx) => (
                            <div key={idx} className="space-y-3">
                                <h4 className="font-bold text-slate-900 text-lg flex items-start gap-2">
                                  <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5"/> 
                                  {item.label}
                                </h4>
                                <p className="text-slate-600 font-light leading-relaxed pl-7">
                                  {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </section>

        {/* 3. Vision Quote Section (Minimal Design) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-10 pb-20 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8 px-6">
             <div className="w-full flex justify-center mb-8">
                 <div className="h-px w-24 bg-slate-300"></div>
             </div>
             
             <Quote size={40} className="mx-auto text-green-500/30 mb-4" />
             <h2 className="text-2xl md:text-3xl font-light italic text-slate-800 leading-relaxed tracking-tight">
               "{t.aboutPage.finalQuote}"
             </h2>
             
             <div className="w-full flex justify-center mt-8">
                 <div className="h-px w-24 bg-slate-300"></div>
             </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}