"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase"; 
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Loader2, ArrowRight, ChevronRight, ChevronLeft, Image as ImageIcon, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

// --- Components เสริม (ฉบับปรับปรุง Smooth & Performance) ---

// 1. ของลอยประกอบฉาก (Fixed Stuttering)
// แยกเลเยอร์การขยับ: Parent ขยับตามสครอลล์ / Child ขยับลอยตุ๊บป่อง
function FloatingItem({ src, className, speed = 1, rotateRange = 5 }) {
  const { scrollYProgress } = useScroll();
  // ใช้ Spring ช่วยซับแรงกระแทกเวลาเลื่อนหน้าจอ ให้ดูนุ่มนวล
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yScroll = useTransform(smoothProgress, [0, 1], [0, speed * 250]);
  
  return (
    <motion.div style={{ y: yScroll }} className={`absolute pointer-events-none z-0 ${className}`}>
       <motion.div 
         animate={{ 
           y: [0, -10, 0], // 🟢 ลดระยะการขยับขึ้นลงให้น้อยลง (Bobbing น้อยลง)
           rotate: [0, rotateRange, 0] 
         }} 
         transition={{ 
           duration: 8 + Math.random() * 4, // 🟢 เพิ่มเวลา Duration ให้มากขึ้น (ลอยช้าลง)
           repeat: Infinity, 
           ease: "easeInOut" 
         }}
         className="relative w-full h-full drop-shadow-xl"
       >
         <Image src={src} alt="prop" fill className="object-contain" />
       </motion.div>
    </motion.div>
  );
}

// 2. Mouse Parallax (Optimized Performance)
// เปลี่ยนจาก useState เป็น useMotionValue เพื่อไม่ให้ React Re-render ถี่เกินไป
function MouseParallax({ children, limitY = false }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    // ใส่ Spring ให้เมาส์ขยับแล้วรูปตามมาแบบหนืดๆ นุ่มๆ
    const smoothX = useSpring(x, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(y, { stiffness: 50, damping: 20 });

    function handleMouseMove(event) {
        const { clientX, clientY, currentTarget } = event;
        const { width, height } = currentTarget.getBoundingClientRect();
        const xVal = (clientX / width - 0.5) * 30; 
        const yVal = limitY ? (clientY / height - 0.5) * 5 : (clientY / height - 0.5) * 30; 
        
        x.set(xVal);
        y.set(yVal);
    }
    
    return (
        <motion.div 
            onMouseMove={handleMouseMove} 
            style={{ x: smoothX, y: smoothY }} 
            className="w-full h-full flex items-center justify-center"
        >
            {children}
        </motion.div>
    );
}

// 3. Scroll Parallax (About) - Added Spring for Smoothness
function ScrollParallax({ children, speed = 0.5 }) {
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const y = useTransform(smoothProgress, [0, 1], [0, -100 * speed]);
    
    return <motion.div style={{ y }} className="relative w-full h-full">{children}</motion.div>;
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [currentBanner, setCurrentBanner] = useState(0); 
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodQ = query(collection(db, "products"), orderBy("order", "asc"));
        const prodSnap = await getDocs(prodQ);
        const validProducts = prodSnap.docs.map(doc => {
            const data = doc.data();
            let status = data.status;
            if (!status) status = data.published ? 'active' : 'hidden';
            return { id: doc.id, ...data, status };
        }).filter(p => p.status !== 'hidden'); 
        setProducts(validProducts);

        const banQ = query(collection(db, "banners"), where("published", "==", true), orderBy("order", "asc"));
        const banSnap = await getDocs(banQ);
        setBanners(banSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) { console.error(e); } finally { setTimeout(() => setLoading(false), 800); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => { setCurrentBanner((prev) => (prev + 1) % banners.length); }, 8000); 
    return () => clearInterval(timer);
  }, [banners.length]);
  
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  if (loading) {
      return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-40 h-20 animate-pulse"><Image src="/images/Logo cl.png" alt="Loading" fill className="object-contain" priority /></div>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]"><Loader2 className="animate-spin text-green-600" size={18}/>Loading Experience...</div>
        </div>
      );
  }

  return (
    <div className="overflow-x-hidden pt-20 font-sans animate-in fade-in duration-700">
      
      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative pt-16 pb-0 px-6 bg-white overflow-hidden min-h-150 flex items-center">
        
        {/* Floating Props: ชุดที่ 1 (ใช้ใบไม้ + น้ำแข็ง) */}
        <FloatingItem src="/images/leaf-1.png" className="top-10 right-[5%] w-32 h-32 blur-[1.5px] rotate-45 opacity-70" speed={-2} rotateRange={15} />
        <FloatingItem src="/images/ice.png" className="bottom-32 left-[2%] w-20 h-20 blur-[2px] opacity-60 rotate-12" speed={1.2} rotateRange={10} />
        <FloatingItem src="/images/fruit-1.png" className="top-[20%] left-[10%] w-16 h-16 opacity-40 blur-[2px] rotate-[-20deg]" speed={0.8} />
        <FloatingItem src="/images/leaf-1.png" className="bottom-[10%] right-[15%] w-24 h-24 opacity-30 blur-[3px] rotate-60" speed={-0.5} />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="z-10 text-center lg:text-left flex flex-col justify-center pb-10 lg:pb-0">
                <span className="inline-block text-green-600 text-xs md:text-sm font-bold tracking-widest uppercase mb-4">
                    {t?.hero?.topTag || "PREMIUM INGREDIENTS"}
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[0.9]">
                   TASTE OF<br/><span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-orange-400">QUALITY.</span>
                </h1>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-8 font-light">
                    {t?.hero?.description || "We source the finest ingredients from around the world."}
                </p>
                <div className="flex justify-center lg:justify-start gap-4">
                    <a href="#products" className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-xs md:text-sm shadow-xl hover:bg-green-600 hover:-translate-y-1 transition-all flex items-center gap-2 tracking-widest uppercase">
                        {t?.hero?.button || "Explore"} <ArrowRight size={16}/>
                    </a>
                </div>
            </motion.div>
            
            {/* Hero Image: ขยายใหญ่ขึ้น (scale-125) และกดลง (translate-y-12) เพื่อความอิ่ม และ limitY เพื่อไม่ให้ลอยจนภาพขาด */}
            <div className="relative h-100 lg:h-162.5 w-full flex items-end justify-center mt-8 lg:mt-0">
                <MouseParallax limitY={true}> 
                    <motion.div 
                        initial={{ opacity: 0, y: 40, scale: 1 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        transition={{ duration: 1, delay: 0.2 }} 
                        className="relative w-full h-full flex items-end justify-center"
                    >
                        <Image 
                            src="/images/hero main.png" 
                            alt="Hero Product" 
                            fill 
                            className="object-contain object-bottom pointer-events-none drop-shadow-2xl translate-y-0" // ดันภาพลงไปข้างล่างหน่อย
                            priority 
                        />
                    </motion.div>
                </MouseParallax>
            </div>
        </div>
      </section>

      {/* --- BANNER SLIDER --- */}
      <section className="w-full p-0 m-0 bg-white"> 
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }} className="relative w-full aspect-8/3 overflow-hidden bg-white">
            {banners.length > 0 ? (
                <AnimatePresence> 
                    <motion.div key={currentBanner} initial={{ opacity: 0 }} animate={{ opacity: 1, zIndex: 1 }} exit={{ opacity: 0, zIndex: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute inset-0 w-full h-full">
                        <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none"></div>
                        {banners[currentBanner].image ? (
                            banners[currentBanner].link ? (
                                <Link href={banners[currentBanner].link} className="block w-full h-full cursor-pointer relative z-20">
                                    <Image src={banners[currentBanner].image} alt="Banner" fill className="object-cover" priority />
                                </Link>
                            ) : (
                                <Image src={banners[currentBanner].image} alt="Banner" fill className="object-cover" priority />
                            )
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <ImageIcon className="text-slate-400" size={64} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="relative w-full h-full">
                     <Image src="/images/complete.png" alt="Default Banner" fill className="object-cover"/>
                     <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/20">
                         <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif' }}>COMPLETE<br/>YOUR DRINK</h2>
                     </div>
                </div>
            )}
            
            {/* ปุ่มเล็กและจางลงมาก */}
            {banners.length > 1 && (
                <>
                    <button onClick={prevBanner} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/5 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all z-30"><ChevronLeft className="w-3 h-3 md:w-4 md:h-4"/></button>
                    <button onClick={nextBanner} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-white/5 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all z-30"><ChevronRight className="w-3 h-3 md:w-4 md:h-4"/></button>
                    <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                        {banners.map((_, i) => (
                            <button key={i} onClick={() => setCurrentBanner(i)} className={`h-1.5 md:h-2 rounded-full transition-all duration-500 shadow-sm ${i === currentBanner ? 'bg-white w-6 md:w-10' : 'bg-white/40 w-1.5 md:w-2'}`} />
                        ))}
                    </div>
                </>
            )}
        </motion.div>
      </section>

      {/* --- PRODUCTS SECTION --- */}
      <section id="products" className="py-24 bg-[#F9F9FB] relative overflow-hidden">
        {/* Floating Props: ชุดที่ 2 (เพิ่มจำนวนและกระจายตัว) */}
        <FloatingItem src="/images/fruit-1.png" className="absolute top-10 -left-10 w-48 h-48 opacity-20 blur-[2px] rotate-90" speed={0.5} />
        <FloatingItem src="/images/ice.png" className="absolute bottom-20 right-5 w-32 h-32 opacity-10 blur-[3px]" speed={-0.3} rotateRange={20} />
        <FloatingItem src="/images/leaf-1.png" className="absolute top-[40%] right-[10%] w-20 h-20 opacity-30 blur-[1px] rotate-120" speed={0.7} />
        <FloatingItem src="/images/ice.png" className="absolute top-[10%] right-[20%] w-12 h-12 opacity-20 blur-[1px]" speed={-0.2} rotateRange={45} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-slate-900">{t?.navbar?.products || "Our Products"}</h2>
                <div className="h-1 w-16 bg-green-500 mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {products.map(item => (
                        <motion.div layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <Link href={`/product/${item.id}`} className="group block h-full">
                                <div className={`bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 relative overflow-hidden ${item.status === 'out_of_stock' ? 'grayscale opacity-70' : ''}`}>
                                    {item.status === 'out_of_stock' ? (
                                        <div className="absolute top-4 right-4 z-10 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">OUT OF STOCK</div>
                                    ) : item.isBestSeller ? (
                                        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">BEST SELLER</div>
                                    ) : null}
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-6 border border-slate-50">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50"><PackageOpen className="text-slate-300" size={48} /></div>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded">{item.category}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">{item.title}</h3>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 font-light">{item.shortDesc}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </section>

      {/* --- ABOUT PREVIEW SECTION (ปรับรูปซ้อนให้ไม่มีกรอบและทับกัน) --- */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        {/* Floating Props: ชุดที่ 3 (เพิ่มจำนวน) */}
        <FloatingItem src="/images/leaf-1.png" className="top-0 -right-10 w-40 h-40 opacity-10 blur-[1px] rotate-180" speed={-0.8} />
        <FloatingItem src="/images/fruit-1.png" className="bottom-[10%] left-[5%] w-24 h-24 opacity-20 blur-[2px] rotate-45" speed={0.4} />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-6 text-center md:text-left">
                <span className="text-green-600 font-bold tracking-widest text-xs uppercase">
                    {t?.aboutPreview?.tag || "Who We Are"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {t?.aboutPreview?.title || "Connecting Global Quality to Local Markets."}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed font-light">
                   {t?.aboutPreview?.desc || "Winfood Industry Corporation is an international importing and exporting company..."}
                </p>
                <Link href="/about" className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-green-600 tracking-wide text-sm border-b-2 border-slate-900 hover:border-green-600 pb-1 pt-4 transition-all uppercase">
                    {t?.aboutPreview?.link || "READ OUR STORY"}
                </Link>
            </div>
            
            {/* Dynamic Image Section: ใช้ ScrollParallax ให้รูปขยับเบาๆ */}
            <div className="flex-1 relative w-full h-64 md:h-96">
                 <ScrollParallax speed={0.2}>
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                        <Image src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" alt="About Preview" fill className="object-cover hover:scale-105 transition-transform duration-1000" />
                    </div>
                 </ScrollParallax>
                 
                 {/* ลูกเล่นเสริม: รูปผลไม้ลอยทับ ไม่มีกรอบ */}
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 md:w-56 md:h-56 z-20 hidden md:block">
                    <ScrollParallax speed={-0.4}>
                        <div className="relative w-full h-full">
                            <Image src="/images/fruit-1.png" alt="Detail" fill className="object-contain drop-shadow-2xl" />
                        </div>
                    </ScrollParallax>
                 </div>
            </div>
        </div>
      </section>

    </div>
  );
}