"use client";
import { useEffect, useState, use } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Info, X, PackageOpen, ChevronRight, Home, ArrowRight } from "lucide-react";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore"; 
import { db } from "../../../lib/firebase";

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [item, setItem] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
        try {
            const docRef = doc(db, "products", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setItem({ id: docSnap.id, ...docSnap.data() });
                const q = query(collection(db, "products"), where("published", "==", true), limit(6)); 
                const querySnapshot = await getDocs(q);
                const others = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id); 
                setOtherProducts(others);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40}/></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-green-100">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-green-500 origin-left z-100" style={{ scaleX }} />

      {/* 🟢 HERO SECTION + NAVIGATION */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
             <Image src={item.heroImage || item.image} alt={item.title} fill priority className="object-cover opacity-50 scale-105" />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-black/60"></div>
        
        {/* 🟢 2. เพิ่มปุ่ม Back ตรงนี้ */}
        <div className="absolute top-6 left-6 z-20 flex gap-3">
             <Link href="/" className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg">
                <Home size={20}/>
             </Link>
             <Link href="/#products" className="bg-white/10 backdrop-blur-md border border-white/20 pl-4 pr-6 py-3 rounded-full text-white text-sm font-bold flex gap-2 items-center hover:bg-white hover:text-slate-900 transition-all shadow-lg group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Products
             </Link>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 text-center px-4">
             <span className="text-white/90 font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-4 border border-white/30 px-4 py-1.5 rounded-full backdrop-blur-md">{item.category || "Collection"}</span>
             <h1 className="text-4xl md:text-7xl font-black text-white leading-tight uppercase drop-shadow-2xl">{item.title}</h1>
             <p className="text-slate-200 mt-4 max-w-lg text-sm md:text-lg font-light drop-shadow-md">{item.shortDesc}</p>
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
                      <div><span className="text-green-600 font-bold tracking-widest text-xs uppercase block mb-2">Discover More</span><h3 className="text-3xl font-black text-slate-900 uppercase">Other Product</h3></div>
                      {/* 🟢 1. แก้ Link View All ให้กลับไป anchor #products */}
                      <Link href="/#products" className="text-sm font-bold text-slate-500 hover:text-green-600 flex items-center gap-2">View All <ArrowRight size={16}/></Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                      {otherProducts.map(prod => (
                          <Link href={`/product/${prod.id}`} key={prod.id} className="group bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-3 p-2"><Image src={prod.image} alt={prod.title} fill className="object-contain group-hover:scale-105 transition-transform duration-700"/></div>
                              <h4 className="font-bold text-sm text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">{prod.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prod.shortDesc}</p>
                          </Link>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* FIXED MODAL POPUP */}
      <AnimatePresence>
        {selectedBlock && (
            <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
                    <button onClick={() => setSelectedBlock(null)} className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                    
                    <div className="w-full md:w-5/12 bg-slate-50 p-8 flex items-center justify-center shrink-0 md:order-last min-h-62.5 md:min-h-full relative">
                        <div className="relative w-40 h-40 md:w-64 md:h-64 bg-white rounded-full shadow-inner border border-slate-100 flex items-center justify-center overflow-hidden">
                            {(selectedBlock.popupImage || selectedBlock.mediaSrc) ? (
                                <div className="relative w-full h-full"> 
                                    <Image src={selectedBlock.popupImage || selectedBlock.mediaSrc} alt="detail" fill className="object-cover"/>
                                </div>
                            ) : (<PackageOpen size={40} className="text-slate-300"/>)}
                        </div>
                    </div>

                    <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto bg-white flex-1">
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-black text-cyan-600 uppercase leading-tight mb-2">{selectedBlock.heading}</h2>
                            {selectedBlock.content && <p className="text-slate-500 text-sm mt-4">{selectedBlock.content}</p>}
                        </div>

                        <div className="space-y-6">
                            {selectedBlock.attributes?.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-slate-700 font-bold text-xs flex items-center gap-2 uppercase tracking-wider mb-2"><Info size={14}/> Ingredients</p>
                                    <div className="space-y-2">
                                        {selectedBlock.attributes.map((attr, idx) => (
                                            <div key={idx} className="flex justify-between items-end text-sm pb-1 border-b border-slate-50">
                                                <span className="text-slate-500">{attr.key}</span>
                                                <div className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></div>
                                                <span className="font-bold text-slate-800">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(selectedBlock.storage || selectedBlock.fda) && (
                                <div className="pt-6 border-t border-slate-100 space-y-4 text-xs text-slate-500 font-medium">
                                    {selectedBlock.storage && (<p>Storage: <span className="text-slate-800">{selectedBlock.storage}</span></p>)}
                                    {selectedBlock.fda && (<p className="font-bold text-slate-800 uppercase tracking-wide">FDA Number: <span className="font-mono font-normal text-slate-600 ml-1">{selectedBlock.fda}</span></p>)}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Component
function BlockRenderer({ blocks, onSelect }) {
    if (!blocks || blocks.length === 0) return null;
    const renderedGroups = [];
    let currentProductGroup = [];

    blocks.forEach((block, index) => {
        if (block.type === 'separator') {
            if (currentProductGroup.length > 0) {
                renderedGroups.push(<ProductGrid key={`grid-${index}`} items={currentProductGroup} onSelect={onSelect} />);
                currentProductGroup = [];
            }
            renderedGroups.push(
                <div key={`sep-${index}`} className="w-full py-12 flex items-center gap-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    {block.content && (
                        <div className={`uppercase tracking-tight ${block.textColor || 'text-slate-800'} ${block.fontWeight || 'font-black'} text-xl md:text-2xl`} dangerouslySetInnerHTML={{__html: block.content}}></div>
                    )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-12">
            {items.map((block, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} key={i} className="group cursor-pointer flex flex-col items-center text-center gap-4" onClick={() => onSelect(block)}>
                    <div className="relative w-full aspect-square bg-transparent rounded-2xl overflow-visible transition-transform duration-500 group-hover:-translate-y-2">
                        {block.mediaSrc ? (
                            <Image src={block.mediaSrc} alt={block.heading} fill className="object-contain drop-shadow-xl" sizes="(max-width: 768px) 50vw, 25vw"/>
                        ) : (
                            <div className="w-full h-full bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2"><PackageOpen size={32}/><span className="text-[10px] font-bold uppercase tracking-widest">No Image</span></div>
                        )}
                    </div>
                    <div className="space-y-1 px-2">
                        <h3 className="text-sm md:text-base font-bold text-slate-800 leading-tight group-hover:text-green-600 transition-colors">{block.heading}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">View Detail <ChevronRight size={10}/></p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}