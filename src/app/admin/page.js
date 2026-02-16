"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Save, X, LogOut, Settings, Package, Layers, Trash2, PlusCircle, Layout,
  ArrowUp, ArrowDown, Eye, EyeOff, Info, Loader2, Image as ImageIcon, Minus
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState("products");
  
  // --- States Product ---
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [coverImage, setCoverImage] = useState(""); 
  const [heroImage, setHeroImage] = useState(""); 
  const [order, setOrder] = useState(0); 
  const [isPublished, setIsPublished] = useState(true);
  
  const [blocks, setBlocks] = useState([]); 
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [banners, setBanners] = useState([]);
  const [newBannerImage, setNewBannerImage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.includes("@")) { setIsAuthorized(true); fetchData(); fetchBanners(); } 
      else { router.push("/login"); }
      setAuthLoading(false); 
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
        const q = query(collection(db, "products"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItemsList(items);
        if (!editId && items.length > 0) setOrder(Math.max(...items.map(i => i.order || 0)) + 1);
    } catch (e) { console.error(e); }
  };

  const fetchBanners = async () => {
    try {
        const q = query(collection(db, "banners"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

  const handleMoveItem = async (col, items, idx, dir) => {
    const newItems = [...items];
    const targetIndex = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[idx], newItems[targetIndex]] = [newItems[targetIndex], newItems[idx]];
    if (col === 'products') setItemsList(newItems); else setBanners(newItems);
    const itemA = newItems[idx]; const itemB = newItems[targetIndex];
    try {
        await updateDoc(doc(db, col, itemA.id), { order: idx + 1 });
        await updateDoc(doc(db, col, itemB.id), { order: targetIndex + 1 });
        if (col === 'products') fetchData(); else fetchBanners();
    } catch (e) { console.error(e); }
  };

  const handleToggleStatus = async (col, id, status) => {
      try {
          await updateDoc(doc(db, col, id), { published: !status });
          if (col === 'products') fetchData(); else fetchBanners();
      } catch (e) { console.error(e); }
  };
  
  // 🟢 NORMALIZE: เพิ่ม popupImage และ Style
  const normalizeBlock = (block) => ({
    type: block.type || 'product',
    layout: block.layout || 'left', 
    heading: block.heading || "", 
    content: block.content || "", 
    mediaSrc: block.mediaSrc || "",
    popupImage: block.popupImage || "", // 🆕 เพิ่มช่องรูป Popup แยก
    textColor: block.textColor || 'text-slate-500', // 🆕 สีข้อความ
    fontWeight: block.fontWeight || 'font-bold',    // 🆕 ความหนา
    attributes: block.attributes || [], 
    fda: block.fda || "", 
    storage: block.storage || ""
  });

  const addBlockProduct = () => setBlocks([...blocks, normalizeBlock({ type: 'product', layout: 'left' })]);
  const addBlockSeparator = () => setBlocks([...blocks, normalizeBlock({ type: 'separator', content: 'New Section' })]);

  const updateBlock = (i, f, v) => { const n = [...blocks]; n[i][f] = v; setBlocks(n); };
  
  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const removeBlock = (i) => setBlocks(blocks.filter((_, idx) => idx !== i));
  const addAttrToBlock = (bi) => { const n = [...blocks]; n[bi].attributes.push({ key: "", value: "" }); setBlocks(n); };
  const updateAttrInBlock = (bi, ai, f, v) => { const n = [...blocks]; n[bi].attributes[ai][f] = v; setBlocks(n); };
  const removeAttrFromBlock = (bi, ai) => { const n = [...blocks]; n[bi].attributes = n[bi].attributes.filter((_, i) => i !== ai); setBlocks(n); };

  const handleProductSubmit = async () => {
    setLoading(true);
    const payload = { 
        title, category, shortDesc, image: coverImage, heroImage: heroImage, 
        order: Number(order), published: isPublished, contentBlocks: blocks, updatedAt: new Date() 
    };
    try {
      if (editId) { await updateDoc(doc(db, "products", editId), payload); } 
      else { await addDoc(collection(db, "products"), { ...payload, createdAt: new Date() }); }
      resetForm(); alert("Saved!");
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const handleEditClick = (item) => {
      setEditId(item.id); setTitle(item.title); setCategory(item.category);
      setShortDesc(item.shortDesc); setCoverImage(item.image); setHeroImage(item.heroImage || "");
      setOrder(item.order); setIsPublished(item.published !== false); 
      setBlocks((item.contentBlocks || []).map(normalizeBlock));
      setActiveTab("products"); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { 
      setEditId(null); setTitle(""); setCategory(""); setShortDesc(""); setCoverImage(""); setHeroImage("");
      setBlocks([]); setIsPublished(true); fetchData(); 
  };
  
  const handleAddBanner = async () => {
      if (!newBannerImage) return alert("กรุณาใส่ลิงก์รูปภาพ");
      setLoading(true);
      try {
          const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order || 0)) : 0;
          await addDoc(collection(db, "banners"), { image: newBannerImage, order: maxOrder + 1, published: true, createdAt: new Date() });
          setNewBannerImage(""); fetchBanners();
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteBanner = async (id) => {
      if (!confirm("ต้องการลบแบนเนอร์นี้?")) return;
      try { await deleteDoc(doc(db, "banners", id)); fetchBanners(); } catch (e) { console.error(e); }
  };

  if (authLoading || !isAuthorized) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      <div className="w-full md:w-72 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 flex flex-col z-20">
         <div className="p-6 border-b border-slate-100 bg-[#16a34a] text-white">
             <h1 className="font-black flex items-center gap-2 tracking-tight uppercase text-lg"><Settings size={20}/> ADMIN PANEL</h1>
        </div>
        <div className="p-4 space-y-2">
            <button onClick={() => setActiveTab("products")} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'products' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Package size={18}/> Products</button>
            <button onClick={() => setActiveTab("banners")} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'banners' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Layers size={18}/> Banners</button>
            <button onClick={() => signOut(auth)} className="w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 mt-10"><LogOut size={18}/> Logout</button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto pb-20">
            {activeTab === "products" && (
                <>
                    <div className="flex justify-between items-end mb-8">
                        <div><h2 className="text-3xl font-black text-slate-800 uppercase">{editId ? "Edit Category" : "New Category"}</h2>{editId && <button onClick={resetForm} className="text-xs font-bold text-red-500 hover:underline mt-1 flex items-center gap-1"><X size={12}/> Cancel</button>}</div>
                        <div className="flex gap-4 items-center">
                            <button onClick={handleProductSubmit} disabled={loading} className="px-8 py-3 bg-[#16a34a] text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"><Save size={18}/> {loading ? 'Saving...' : 'SAVE DATA'}</button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200 space-y-6 mb-8">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Info size={14}/> Main Info</div>
                         <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl font-bold border-b-2 border-slate-100 focus:border-[#16a34a] outline-none py-2 bg-transparent" placeholder="Title..."/></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ImageIcon size={12}/> Thumbnail</label><input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none" placeholder="Small URL..."/></div>
                             <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Layers size={12}/> Hero Immersive</label><input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none" placeholder="Big URL..."/></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-[#16a34a]" placeholder="Tag..."/><textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none resize-none h-full focus:ring-2 focus:ring-[#16a34a]" placeholder="Description..."/></div>
                    </div>

                    <div className="space-y-4">
                         <div className="flex justify-between items-end px-1"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout size={14}/> Content List</div></div>
                         
                         {blocks.map((block, index) => (
                            <div key={index} className={`rounded-4xl border p-6 shadow-sm relative ${block.type === 'separator' ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-slate-200 rounded text-slate-400"><ArrowUp size={14}/></button>
                                        <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-slate-200 rounded text-slate-400"><ArrowDown size={14}/></button>
                                        <span className="font-bold text-slate-400 uppercase text-xs ml-2">{block.type === 'separator' ? '⎯ Separator Line' : `Product Item #${index + 1}`}</span>
                                    </div>
                                    <button onClick={() => removeBlock(index)} className="p-2 text-slate-300 hover:text-red-500 bg-white rounded-xl shadow-sm"><Trash2 size={16}/></button>
                                </div>
                                
                                {block.type === 'separator' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700">Separator Text</label>
                                            <input type="text" value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} className={`w-full p-4 bg-white rounded-2xl text-sm border border-slate-200 outline-none focus:border-green-500 font-mono ${block.textColor} ${block.fontWeight}`} placeholder="e.g. Recommended Items"/>
                                        </div>
                                        {/* 🟢 Style Controls */}
                                        <div className="flex flex-wrap gap-2">
                                            {[{l:'Slate',c:'text-slate-500'},{l:'Green',c:'text-green-600'},{l:'Cyan',c:'text-cyan-500'},{l:'Red',c:'text-red-500'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'textColor',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.textColor===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                            <div className="w-px h-4 bg-slate-300 mx-1 self-center"></div>
                                            {[{l:'Normal',c:'font-normal'},{l:'Bold',c:'font-bold'},{l:'Black',c:'font-black'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'fontWeight',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.fontWeight===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <input type="text" value={block.heading} onChange={e => updateBlock(index, 'heading', e.target.value)} className="w-full font-bold border-b border-slate-200 outline-none py-2 text-lg" placeholder="Item Name..."/>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Grid Image</label><input type="text" value={block.mediaSrc} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-xs border border-slate-100 outline-none" placeholder="Show on Grid..."/></div>
                                                {/* 🟢 ช่องใส่รูป Popup */}
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-green-600 uppercase">Popup Image (Opt)</label><input type="text" value={block.popupImage} onChange={e => updateBlock(index, 'popupImage', e.target.value)} className="w-full p-2 bg-green-50 rounded-lg text-xs border border-green-100 outline-none" placeholder="Show on Popup..."/></div>
                                            </div>
                                            <textarea value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} rows={3} className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none outline-none resize-none" placeholder="Detail..."/>
                                        </div>
                                        <div className="bg-green-50/50 p-5 rounded-3xl border border-green-100 space-y-4">
                                            <div className="space-y-2">
                                                {block.attributes.map((attr, attrIdx) => (
                                                    <div key={attrIdx} className="flex gap-2 items-center"><input type="text" value={attr.key} onChange={e => updateAttrInBlock(index, attrIdx, 'key', e.target.value)} placeholder="Key" className="flex-1 p-2 bg-white rounded-lg text-xs outline-none"/><input type="text" value={attr.value} onChange={e => updateAttrInBlock(index, attrIdx, 'value', e.target.value)} placeholder="Val" className="w-20 p-2 bg-white rounded-lg text-xs outline-none"/><button onClick={() => removeAttrFromBlock(index, attrIdx)} className="text-red-400"><X size={14}/></button></div>
                                                ))}
                                                <button onClick={() => addAttrToBlock(index)} className="w-full py-1 border border-dashed border-green-200 rounded text-green-600 text-[10px] hover:bg-white">+ Ingredient</button>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t border-green-200/50">
                                                <input type="text" value={block.fda} onChange={e => updateBlock(index, 'fda', e.target.value)} className="w-full p-2 bg-white rounded-lg text-xs outline-none" placeholder="FDA..."/>
                                                <input type="text" value={block.storage} onChange={e => updateBlock(index, 'storage', e.target.value)} className="w-full p-2 bg-white rounded-lg text-xs outline-none" placeholder="Storage..."/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        <div className="flex gap-4 mt-4">
                            <button onClick={addBlockProduct} className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-green-50 transition-all flex justify-center items-center gap-2"><PlusCircle size={20}/> Add Product</button>
                            <button onClick={addBlockSeparator} className="px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex justify-center items-center gap-2"><Minus size={20}/> Add Separator</button>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-slate-200">
                        <div className="space-y-2">
                            {itemsList.map((item, index) => (
                                <div key={item.id} className={`p-3 bg-white rounded-xl border flex gap-4 items-center ${editId === item.id ? 'border-[#16a34a] bg-green-50' : 'border-slate-100'}`}>
                                    <div className="flex flex-col gap-1"><button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'up')}} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900"><ArrowUp size={14}/></button><button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'down')}} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900"><ArrowDown size={14}/></button></div>
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover"/></div>
                                    <div className="flex-1 cursor-pointer" onClick={() => handleEditClick(item)}><div className="font-bold text-sm text-slate-700">{item.title}</div><div className="text-[10px] uppercase text-slate-400">{item.published ? 'Live' : 'Hidden'} | {item.contentBlocks?.length || 0} Items</div></div>
                                    <button onClick={() => handleToggleStatus('products', item.id, item.published)} className={`p-2 rounded-lg ${item.published ? 'text-green-500 bg-green-50' : 'text-slate-300 bg-slate-50'}`}>{item.published ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            
            {activeTab === "banners" && (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase mb-8">Manage Banners</h2>
                    <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 space-y-4 mb-8">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Banner Link</label>
                         <div className="flex gap-4">
                             <input type="text" value={newBannerImage} onChange={e => setNewBannerImage(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-[#16a34a] outline-none" placeholder="URL..."/>
                             <button onClick={handleAddBanner} disabled={loading} className="px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-[#16a34a] transition-all flex items-center gap-2"><PlusCircle size={18}/> Add</button>
                         </div>
                    </div>
                    <div className="space-y-4">
                        {banners.map((banner, index) => (
                            <div key={banner.id} className={`relative bg-white p-4 rounded-3xl border flex gap-6 items-center shadow-sm ${banner.published ? 'border-slate-200' : 'border-slate-100 opacity-70'}`}>
                                <div className="flex flex-col gap-1"><button onClick={() => handleMoveItem('banners', banners, index, 'up')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900"><ArrowUp size={20}/></button><button onClick={() => handleMoveItem('banners', banners, index, 'down')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900"><ArrowDown size={20}/></button></div>
                                <div className="w-48 aspect-21/9 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative"><img src={banner.image} className="w-full h-full object-cover"/></div>
                                <div className="flex-1 min-w-0"><div className="text-xs font-bold text-slate-400 uppercase truncate">{banner.image}</div></div>
                                <div className="flex items-center gap-2"><button onClick={() => handleToggleStatus('banners', banner.id, banner.published)} className={`p-3 rounded-xl transition-all ${banner.published ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}><Eye size={20}/></button><button onClick={() => handleDeleteBanner(banner.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}