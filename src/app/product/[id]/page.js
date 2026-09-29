"use client";
import { useEffect, useState, use } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Info, X, PackageOpen, ChevronRight, ArrowRight } from "lucide-react";
import { doc, getDoc, collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [item, setItem] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const { t } = useLanguage();

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        try {
            let productData = null;
            let productId = null;

            // 1. ลองค้นหาจากช่อง "slug" ก่อน
            const slugQuery = query(collection(db, "products"), where("slug", "==", id), limit(1));
            const slugSnap = await getDocs(slugQuery);

            if (!slugSnap.empty) {
                // ถ้าเจอจาก Slug
                productData = slugSnap.docs[0].data();
                productId = slugSnap.docs[0].id;
            } else {
                // 2. ถ้าไม่เจอจาก Slug ให้ลองดึงด้วย Document ID (รองรับลิงก์เก่าหรือสินค้าที่ไม่ได้ตั้ง slug)
                try {
                    const docRef = doc(db, "products", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        productData = docSnap.data();
                        productId = docSnap.id;
                    }
                } catch (err) {
                    console.log("Invalid Document ID format, skipping...");
                }
            }

            if (productData) {
                setItem({ id: productId, ...productData });
                document.title = `${productData.title} | Winfood Product`; 

                // ดึงสินค้าอื่นๆ เหมือนเดิม
                const q = query(collection(db, "products"), orderBy("order", "asc")); 
                const querySnapshot = await getDocs(q);
                const others = querySnapshot.docs
                    .map(d => {
                        const dData = d.data();
                        let status = dData.status;
                        if (!status) status = dData.published ? 'active' : 'hidden';
                        return { id: d.id, ...dData, status };
                    })
                    .filter(p => p.id !== productId && p.status !== 'hidden')
                    .slice(0, 5); 

                setOtherProducts(others);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40}/></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">NOT FOUND</div>;

  const heroImageSrc = item.heroImage || item.image;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-green-100">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-green-500 origin-left z-120" style={{ scaleX }} />

      {/* HERO SECTION + NAVIGATION */}
      <div className="relative h-[95vh] overflow-hidden bg-slate-900">
        <motion.div style={{ y: heroY }} className="absolute inset-0 will-change-transform transform-gpu">
             {heroImageSrc ? (
                <Image src={heroImageSrc} alt={item.title} fill priority className="object-cover opacity-50 scale-105" />
             ) : (
                <div className="w-full h-full bg-slate-800 opacity-50"></div>
             )}
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-[#374151]/10"></div>
        
        <div className="absolute top-48 left-6 z-30 flex gap-3">
             <Link href="/#products" className="bg-white/10 backdrop-blur-md border border-white/20 pl-4 pr-6 py-3 rounded-full text-white text-sm font-bold flex gap-2 items-center hover:bg-white hover:text-slate-900 transition-all shadow-lg group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> 
                {t?.productPage?.back || "Back to Products"}
             </Link>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-50 text-center px-4">
             <span className="text-white/90 font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-4 border border-white/30 px-4 py-1.5 rounded-full backdrop-blur-md">{item.category || "Collection"}</span>
             <h1 className="text-4xl md:text-7xl font-black text-white leading-tight uppercase drop-shadow-2xl">{item.title}</h1>
<p className="text-slate-200 mt-4 max-w-lg text-xs md:text-base font-light drop-shadow-md whitespace-pre-wrap wrap-break-word">{item.shortDesc}</p>
        </div>

        {/* ข้อความประกอบภาพโฆษณา (มุมขวาล่างของรูป Hero) */}
        <div className="absolute bottom-4 right-4 md:right-8 z-30 opacity-40">
            <span className="text-slate-500 text-[9px] md:text-[10px] italic font-light tracking-wide drop-shadow-md">
                {t?.productPage?.adImageDisclaimer}
            </span>
        </div>
      </div>

      {/* CONTENT BLOCKS */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <BlockRenderer blocks={item.contentBlocks} onSelect={setSelectedBlock} />
      </div>

      {/* OTHER PRODUCTS */}
      {otherProducts.length > 0 && (
          <div className="py-24 bg-slate-50 border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-6">
                  <div className="flex justify-between items-end mb-12">
                      <div>
                          <span className="text-green-600 font-bold tracking-widest text-xs uppercase block mb-2">
                              {t?.productPage?.discover || "Discover More"}
                          </span>
                          <h3 className="text-3xl font-black text-slate-900 uppercase">
                              {t?.productPage?.otherTitle || "Other Products"}
                          </h3>
                      </div>
                      <Link href="/#products" className="text-sm font-bold text-slate-500 hover:text-green-600 flex items-center gap-2">
                          {t?.productPage?.viewAll || "View All"} <ArrowRight size={16}/>
                      </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                      {otherProducts.map(prod => (
                          <Link href={`/product/${prod.slug || prod.id}`} key={prod.id} className={`group bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
    <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-3 p-2 border border-slate-50">
        {prod.status === 'out_of_stock' ? (
            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">MADE TO ORDER</div>
                                  ) : prod.isBestSeller ? (
                                      <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">BEST SELLER</div>
                                  ) : null}
                                  {prod.image ? (
                                    <Image src={prod.image} alt={prod.title} fill className="object-contain group-hover:scale-105 transition-transform duration-700"/>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg"><PackageOpen className="text-slate-300" size={24} /></div>
                                  )}
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-green-600 transition-colors wrap-break-word">{prod.title}</h4>
<p className="text-[10px] md:text-xs text-slate-400 mt-1 font-light whitespace-pre-wrap wrap-break-word">{prod.shortDesc}</p>
                          </Link>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* FIXED MODAL POPUP */}
      <AnimatePresence>
        {selectedBlock && (
            <motion.div 
                key="product-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setSelectedBlock(null)}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    // 1. 🟢 เปลี่ยนเป็น overflow-hidden เพื่อตัดขอบโค้งมนไม่ให้ Scrollbar ทะลุล้นออกไป
                    className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ปุ่มปิด (ให้ลอยอยู่เหนือพื้นที่ Scroll) */}
                    <button onClick={() => setSelectedBlock(null)} className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                    
                    {/* 2. 🟢 ย้าย overflow-y-auto มาไว้ในกล่องนี้แทน แถบเลื่อนจะอยู่ข้างในอย่างสวยงาม ไม่ล้นขอบ */}
                    <div className="overflow-y-auto w-full h-full p-6 md:p-10 flex flex-col gap-8 md:gap-10">
                        
                        {/* ส่วนบนสุด: รูปภาพ + ชื่อ + รายละเอียด (จัดเรียงแนวนอน) */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                            
                            {/* ฝั่งซ้าย: รูปภาพ */}
                            <div className="w-full md:w-5/12 flex flex-col items-center pt-2 shrink-0">
                                {/* 3. 🟢 บังคับขนาดเป็น 1:1 เป๊ะๆ (w-48 h-48 หรือ md:w-64 md:h-64) และใส่ shrink-0 ป้องกันไม่ให้กลายเป็นวงรี */}
                                <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 bg-slate-50 rounded-full shadow-inner border border-slate-100 flex items-center justify-center overflow-hidden">
                                    {(selectedBlock.popupImage || selectedBlock.mediaSrc) ? (
                                        <div className="relative w-full h-full"> 
                                            {/* object-cover จะทำให้ภาพเต็มวงกลมพอดีเป๊ะ */}
                                            <Image src={selectedBlock.popupImage || selectedBlock.mediaSrc} alt="detail" fill className="object-cover hover:scale-110 transition-transform duration-500"/>
                                        </div>
                                    ) : (<PackageOpen size={40} className="text-slate-300"/>)}
                                </div>
                                <span className="block text-[10px] text-slate-400 italic font-light mt-4 tracking-wide text-center">
                                    {t?.productPage?.adImageDisclaimer || "*Images are for advertising purposes only."}
                                </span>
                            </div>

                            {/* ฝั่งขวา: ชื่อสินค้า และ รายละเอียด */}
                            <div className="w-full md:w-7/12 flex flex-col justify-center pt-2 md:pt-4">
                                <h2 className="text-3xl md:text-4xl font-black text-cyan-600 uppercase leading-tight mb-4">{selectedBlock.heading}</h2>
                                {selectedBlock.content && (
                                    <div className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                        {selectedBlock.content}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ส่วนล่าง: วิธีใช้งาน และ รายละเอียดเชิงลึก */}
                        <div className="grid grid-cols-1 gap-6">
                            
                            {/* วิธีใช้งาน (How to Use) */}
                            {selectedBlock.howToUse && (
                                <div className="bg-green-50/70 border border-green-100 p-6 md:p-8 rounded-[2rem]">
                                    <p className="text-green-800 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Info size={18} className="text-green-600"/> วิธีใช้งาน (How to Use)
                                    </p>
                                    <div className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedBlock.howToUse}
                                    </div>
                                </div>
                            )}

                            {/* คุณสมบัติ (Attributes) */}
                            {selectedBlock.attributes?.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-slate-700 font-bold text-sm flex items-center gap-2 uppercase tracking-wider mb-2">
                                        <Info size={16}/> {t?.productPage?.attributesTitle || "Detail"}
                                    </p>
                                    <div className="space-y-3 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                                        {selectedBlock.attributes.map((attr, idx) => (
                                            <div key={idx} className="flex justify-between items-end text-sm md:text-base pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                                                <span className="text-slate-500">{attr.key}</span>
                                                <div className="flex-1 border-b border-dotted border-slate-300 mx-3 md:mx-4 mb-2 opacity-50"></div>
                                                <span className="font-bold text-slate-800 text-right">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Storage & FDA */}
                            {(selectedBlock.storage || selectedBlock.fda) && (
                                <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 text-sm text-slate-600 font-medium">
                                    {selectedBlock.storage && (
                                        <p className="whitespace-pre-wrap leading-relaxed"><span className="font-bold text-slate-800">Storage:</span> {selectedBlock.storage}</p>
                                    )}
                                    {selectedBlock.fda && (
                                        <p className="tracking-wide"><span className="font-bold text-slate-800 uppercase">FDA Number:</span> <span className="font-mono font-normal text-slate-600 ml-1">{selectedBlock.fda}</span></p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🟢 BlockRenderer: ปรับปรุงให้รองรับ separatorImage
function BlockRenderer({ blocks, onSelect }) {
    if (!blocks || blocks.length === 0) return null;
    const processedBlocks = blocks.map(b => ({ ...b, status: b.status || (b.visible !== false ? 'active' : 'hidden') })).filter(b => b.status !== 'hidden');
    const renderedGroups = [];
    let currentProductGroup = [];
    
    processedBlocks.forEach((block, index) => {
        if (block.type === 'separator') {
            if (currentProductGroup.length > 0) {
                renderedGroups.push(<ProductGrid key={`grid-${index}`} items={currentProductGroup} onSelect={onSelect} />);
                currentProductGroup = [];
            }
            renderedGroups.push(
                <div key={`sep-${index}`} className="w-full py-16 flex items-center justify-center gap-6">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <div className="flex flex-col items-center gap-3">
                        {block.separatorImage && (
                            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                                <Image src={block.separatorImage} alt="Separator Logo" fill className="object-contain" />
                            </div>
                        )}
                        {block.content && (
                            <div className={`uppercase tracking-tight ${block.textColor || 'text-slate-800'} ${block.fontWeight || 'font-black'} text-xl md:text-2xl text-center`} dangerouslySetInnerHTML={{__html: block.content}}></div>
                        )}
                    </div>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>
            );
        } else { 
            currentProductGroup.push(block); 
        }
    });
    
    if (currentProductGroup.length > 0) { 
        renderedGroups.push(<ProductGrid key={`grid-last`} items={currentProductGroup} onSelect={onSelect} />); 
    }
    
    return <>{renderedGroups}</>;
}

function ProductGrid({ items, onSelect }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {items.map((block, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="group cursor-pointer bg-white rounded-[2rem] p-5 pb-0 flex flex-col justify-between overflow-visible border border-slate-100 shadow-sm hover:shadow-xl hover:z-50 transition-all duration-500 relative min-h-[420px]"
                    onClick={() => onSelect(block)}
                >
                    <div className="z-10 text-left pt-2 px-2">
                        <div className="flex gap-2 mb-3">
                            {block.status === 'out_of_stock' && (
                                <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">
                                    MADE TO ORDER
                                </span>
                            )}
                            {block.isBestSeller && (
                                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full">
                                    BEST SELLER
                                </span>
                            )}
                        </div>

                        <h3 className="text-base md:text-lg font-semibold text-slate-900 leading-snug group-hover:text-green-600 transition-colors line-clamp-2 pr-2">
                            {block.heading}
                        </h3>

                        {block.shortDesc && (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                {block.shortDesc}
                            </p>
                        )}
                    </div>

                    {/* ใช้ CSS ล้วนๆ ตัด State ทิ้งเพื่อไม่ให้ React Re-render (ลดอาการกระตุก) ปรับ Scale ให้นุ่มนวลขึ้น */}
                    <div className="relative w-[110%] -ml-[5%] h-56 md:h-[18rem] mt-auto mb-4 transform transition-transform duration-500 ease-out z-10 origin-bottom group-hover:scale-110 group-hover:-translate-y-4">
                        {block.mediaSrc ? (
                            <Image
                                src={block.mediaSrc}
                                alt={block.heading}
                                fill
                                className="object-contain object-bottom drop-shadow-2xl"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-50 rounded-t-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
                                <PackageOpen size={32} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-5 right-5 w-8 h-8 bg-slate-100 group-hover:bg-green-500 group-hover:text-white rounded-full flex items-center justify-center text-slate-500 transition-colors z-20 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="M12 5v14" />
                        </svg>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}