"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Save, X, LogOut, Settings, Package, Layers, Trash2, PlusCircle, Layout,
  ArrowUp, ArrowDown, Eye, EyeOff, Info, Loader2, Image as ImageIcon, Minus,
  ChevronLeft, Edit3, MoreVertical
} from "lucide-react";

// 🟢 Component: หน้าจอโหลดแบบ Full Screen
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-green-600" size={32} />
        <span className="text-sm font-bold text-slate-600">Processing...</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState("products");
  
  // 🟢 State สำหรับ Loading รวม (เมื่อเป็น true จะแสดง Overlay ทันที)
  const [globalLoading, setGlobalLoading] = useState(false);

  const [viewMode, setViewMode] = useState("list"); // 'list' | 'edit'

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
    } catch (e) { console.error(e); }
  };

  const fetchBanners = async () => {
    try {
        const q = query(collection(db, "banners"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id, e) => {
    e.stopPropagation();
    if (!confirm("⚠️ คำเตือน: คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่? ข้อมูลสินค้าภายในทั้งหมดจะหายไป")) return;
    
    setGlobalLoading(true); // 🟢 เริ่มโหลด
    try {
        await deleteDoc(doc(db, "products", id));
        await fetchData(); // รอโหลดข้อมูลใหม่ให้เสร็จ
    } catch (err) { alert(err.message); }
    finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  const normalizeBlock = (block) => ({
    type: block.type || 'product',
    visible: block.visible !== false,
    layout: block.layout || 'left', 
    heading: block.heading || "", 
    content: block.content || "", 
    mediaSrc: block.mediaSrc || "",
    popupImage: block.popupImage || "",
    textColor: block.textColor || 'text-slate-500',
    fontWeight: block.fontWeight || 'font-bold',
    attributes: block.attributes || [], 
    fda: block.fda || "", 
    storage: block.storage || ""
  });

  const addBlockProduct = () => setBlocks([...blocks, normalizeBlock({ type: 'product', layout: 'left' })]);
  const addBlockSeparator = () => setBlocks([...blocks, normalizeBlock({ type: 'separator', content: 'New Section' })]);

  const toggleBlockVisibility = (index) => {
    const newBlocks = [...blocks];
    newBlocks[index].visible = !newBlocks[index].visible;
    setBlocks(newBlocks);
  };

  const updateBlock = (i, f, v) => { const n = [...blocks]; n[i][f] = v; setBlocks(n); };
  
  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const removeBlock = (i) => {
      if(!confirm("ลบรายการย่อยนี้?")) return;
      setBlocks(blocks.filter((_, idx) => idx !== i));
  };
  
  const addAttrToBlock = (bi) => { const n = [...blocks]; n[bi].attributes.push({ key: "", value: "" }); setBlocks(n); };
  const updateAttrInBlock = (bi, ai, f, v) => { const n = [...blocks]; n[bi].attributes[ai][f] = v; setBlocks(n); };
  const removeAttrFromBlock = (bi, ai) => { const n = [...blocks]; n[bi].attributes = n[bi].attributes.filter((_, i) => i !== ai); setBlocks(n); };

  const handleProductSubmit = async () => {
    setGlobalLoading(true); // 🟢 เริ่มโหลด
    const payload = { 
        title, category, shortDesc, image: coverImage, heroImage: heroImage, 
        order: Number(order), published: isPublished, contentBlocks: blocks, updatedAt: new Date() 
    };
    try {
      if (editId) { await updateDoc(doc(db, "products", editId), payload); } 
      else { await addDoc(collection(db, "products"), { ...payload, createdAt: new Date() }); }
      await fetchData(); // รอโหลดข้อมูลใหม่
      backToList(); 
    } catch (e) { alert(e.message); } 
    finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  const handleCreateNew = () => {
      resetForm();
      const maxOrder = itemsList.length > 0 ? Math.max(...itemsList.map(i => i.order || 0)) : 0;
      setOrder(maxOrder + 1);
      setViewMode("edit");
  };

  const handleEditClick = (item) => {
      setEditId(item.id); setTitle(item.title); setCategory(item.category);
      setShortDesc(item.shortDesc); setCoverImage(item.image); setHeroImage(item.heroImage || "");
      setOrder(item.order); setIsPublished(item.published !== false); 
      setBlocks((item.contentBlocks || []).map(normalizeBlock));
      setViewMode("edit");
  };

  const backToList = () => {
      resetForm();
      setViewMode("list");
  };

  const resetForm = () => { 
      setEditId(null); setTitle(""); setCategory(""); setShortDesc(""); setCoverImage(""); setHeroImage("");
      setBlocks([]); setIsPublished(true); 
  };

  const handleMoveItem = async (col, items, idx, dir) => {
    setGlobalLoading(true); // 🟢 เริ่มโหลด
    const newItems = [...items];
    const targetIndex = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) {
        setGlobalLoading(false); return;
    }
    
    [newItems[idx], newItems[targetIndex]] = [newItems[targetIndex], newItems[idx]];
    
    // อัปเดต UI ทันทีเพื่อให้รู้ว่ากดแล้ว (Optimistic UI)
    if (col === 'products') setItemsList(newItems); else setBanners(newItems);
    
    try {
        await updateDoc(doc(db, col, newItems[idx].id), { order: idx + 1 });
        await updateDoc(doc(db, col, newItems[targetIndex].id), { order: targetIndex + 1 });
        // โหลดข้อมูลจริงอีกรอบเพื่อความชัวร์
        if (col === 'products') await fetchData(); else await fetchBanners();
    } catch (e) { console.error(e); }
    finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  const handleToggleStatus = async (col, id, status) => {
      setGlobalLoading(true); // 🟢 เริ่มโหลด
      try { 
          await updateDoc(doc(db, col, id), { published: !status }); 
          if (col === 'products') await fetchData(); else await fetchBanners(); 
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  const handleAddBanner = async () => {
      if (!newBannerImage) return alert("URL Required");
      setGlobalLoading(true); // 🟢 เริ่มโหลด
      try {
          const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order || 0)) : 0;
          await addDoc(collection(db, "banners"), { image: newBannerImage, order: maxOrder + 1, published: true, createdAt: new Date() });
          setNewBannerImage(""); 
          await fetchBanners();
      } catch (e) { console.error(e); } 
      finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  const handleDeleteBanner = async (id) => { 
      if (!confirm("Delete this banner?")) return; 
      setGlobalLoading(true); // 🟢 เริ่มโหลด
      try { 
          await deleteDoc(doc(db, "banners", id)); 
          await fetchBanners(); 
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); } // 🟢 หยุดโหลด
  };

  if (authLoading || !isAuthorized) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* 🟢 แสดงหน้าจอโหลดถ้า globalLoading เป็น true */}
      {globalLoading && <LoadingOverlay />}

      {/* 🟢 SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 flex flex-col z-40 shadow-sm">
         <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
             <h1 className="font-black flex items-center gap-2 tracking-tight uppercase text-lg text-green-400"><Settings size={20} className="text-white"/> WINFOOD ADMIN</h1>
        </div>
        <div className="p-4 space-y-2 flex-1">
            <button onClick={() => {setActiveTab("products"); setViewMode("list");}} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'products' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Package size={18}/> Products</button>
            <button onClick={() => setActiveTab("banners")} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'banners' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Layers size={18}/> Banners</button>
        </div>
        <div className="p-4">
            <button onClick={() => signOut(auth)} className="w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"><LogOut size={18}/> Logout</button>
        </div>
      </div>

      {/* 🟢 MAIN CONTENT */}
      <div className="flex-1 h-screen overflow-y-auto relative">
        <div className="max-w-5xl mx-auto pb-20">
            
            {/* --- TAB: PRODUCTS --- */}
            {activeTab === "products" && (
                <>
                    {/* VIEW MODE: LIST */}
                    {viewMode === "list" && (
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Product Categories</h2><p className="text-slate-400 text-xs mt-1">Manage main categories and items inside.</p></div>
                                <button onClick={handleCreateNew} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"><PlusCircle size={18}/> New Category</button>
                            </div>

                            <div className="grid gap-4">
                                {itemsList.length === 0 && <div className="text-center py-20 text-slate-400">No categories found. Create one!</div>}
                                {itemsList.map((item, index) => (
                                    <div key={item.id} className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-green-400 transition-all group ${!item.published && 'opacity-60 grayscale'}`}>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'up')}} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600"><ArrowUp size={16}/></button>
                                            <button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'down')}} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600"><ArrowDown size={16}/></button>
                                        </div>
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative flex items-center justify-center">
                                            {/* 🟢 FIX: เช็คก่อนแสดงผลรูปภาพ */}
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt="icon"/>
                                            ) : (
                                                <ImageIcon className="text-slate-300" size={24}/>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{item.category}</span>
                                                {!item.published && <span className="bg-red-100 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hidden</span>}
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800 truncate">{item.title}</h3>
                                            <p className="text-xs text-slate-400 truncate">{item.contentBlocks?.length || 0} Sub-items inside</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleToggleStatus('products', item.id, item.published)} className={`p-2.5 rounded-xl transition-all ${item.published ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>{item.published ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                                            <button onClick={() => handleEditClick(item)} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center gap-2"><Edit3 size={16}/> Edit</button>
                                            <button onClick={(e) => handleDeleteCategory(item.id, e)} className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VIEW MODE: EDIT */}
                    {viewMode === "edit" && (
                        <div className="bg-slate-50 min-h-full">
                            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button onClick={backToList} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ChevronLeft size={24}/></button>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editId ? "Edit Category" : "New Category"}</h2>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{isPublished ? 'Published' : 'Draft (Hidden)'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsPublished(!isPublished)} className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${isPublished ? 'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500' : 'border-green-200 text-green-600 bg-green-50'}`}>{isPublished ? 'Hide Category' : 'Publish Now'}</button>
                                    <button onClick={handleProductSubmit} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-green-700 hover:shadow-green-200 transition-all flex items-center gap-2 min-w-[120px] justify-center"><Save size={18}/> Save</button>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-3xl font-black border-b-2 border-slate-100 focus:border-green-500 outline-none py-2 bg-transparent placeholder:text-slate-200" placeholder="Category Name..."/></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ImageIcon size={12}/> Thumbnail (Square)</label><input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none focus:border-green-500" placeholder="URL..."/></div>
                                        <div className="space-y-2"><label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Layers size={12}/> Hero Image (Wide)</label><input type="text" value={heroImage} onChange={e => setHeroImage(e.target.value)} className="w-full p-3 bg-white rounded-xl text-sm border border-slate-200 outline-none focus:border-green-500" placeholder="URL..."/></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tag</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. BEVERAGE"/></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label><textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={2} className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none resize-none focus:ring-2 focus:ring-green-500" placeholder="Short description..."/></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-2"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout size={14}/> Sub-Items Management</div></div>
                                    {blocks.map((block, index) => (
                                        <div key={index} className={`rounded-3xl border p-6 shadow-sm relative transition-all ${block.type === 'separator' ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200'} ${!block.visible && 'opacity-60 bg-slate-50 grayscale'}`}>
                                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                                <div className="flex gap-2">
                                                    <span className={`bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase mr-2 ${block.type==='separator' && 'bg-slate-400'}`}>{block.type}</span>
                                                    <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowUp size={14}/></button>
                                                    <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowDown size={14}/></button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleBlockVisibility(index)} className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${block.visible ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-200 text-slate-500'}`}>
                                                        {block.visible ? <><Eye size={16}/> Visible</> : <><EyeOff size={16}/> Hidden</>}
                                                    </button>
                                                    <button onClick={() => removeBlock(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                            
                                            {block.type === 'separator' ? (
                                                <div className="space-y-4">
                                                    <input type="text" value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} className={`w-full p-4 bg-white rounded-xl text-sm border border-slate-200 outline-none focus:border-green-500 font-mono ${block.textColor} ${block.fontWeight}`} placeholder="Separator Text..."/>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[{l:'Slate',c:'text-slate-500'},{l:'Green',c:'text-green-600'},{l:'Cyan',c:'text-cyan-500'},{l:'Red',c:'text-red-500'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'textColor',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.textColor===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                                        <div className="w-px h-4 bg-slate-300 mx-1 self-center"></div>
                                                        {[{l:'Normal',c:'font-normal'},{l:'Bold',c:'font-bold'},{l:'Black',c:'font-black'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'fontWeight',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.fontWeight===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <input type="text" value={block.heading} onChange={e => updateBlock(index, 'heading', e.target.value)} className="w-full font-bold border-b border-slate-200 outline-none py-2 text-lg focus:border-green-500 bg-transparent" placeholder="Item Name..."/>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Grid Image</label><input type="text" value={block.mediaSrc} onChange={e => updateBlock(index, 'mediaSrc', e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg text-xs border border-slate-100 outline-none focus:border-green-500" placeholder="Show on Grid..."/></div>
                                                            <div className="space-y-1"><label className="text-[10px] font-bold text-green-600 uppercase">Popup Image</label><input type="text" value={block.popupImage} onChange={e => updateBlock(index, 'popupImage', e.target.value)} className="w-full p-2 bg-green-50 rounded-lg text-xs border border-green-100 outline-none focus:border-green-500" placeholder="Show on Popup..."/></div>
                                                        </div>
                                                        <textarea value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} rows={3} className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none resize-none focus:ring-2 focus:ring-green-500" placeholder="Detail..."/>
                                                    </div>
                                                    <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100 space-y-4">
                                                        <div className="space-y-2">
                                                            {block.attributes.map((attr, attrIdx) => (
                                                                <div key={attrIdx} className="flex gap-2 items-center"><input type="text" value={attr.key} onChange={e => updateAttrInBlock(index, attrIdx, 'key', e.target.value)} placeholder="Key" className="flex-1 p-2 bg-white rounded-lg text-xs outline-none shadow-sm"/><input type="text" value={attr.value} onChange={e => updateAttrInBlock(index, attrIdx, 'value', e.target.value)} placeholder="Val" className="w-20 p-2 bg-white rounded-lg text-xs outline-none shadow-sm"/><button onClick={() => removeAttrFromBlock(index, attrIdx)} className="text-red-400 hover:text-red-600"><X size={14}/></button></div>
                                                            ))}
                                                            <button onClick={() => addAttrToBlock(index)} className="w-full py-2 border border-dashed border-green-300 rounded-lg text-green-600 text-[10px] font-bold hover:bg-white transition-all">+ Add Ingredient</button>
                                                        </div>
                                                        <div className="space-y-2 pt-2 border-t border-green-200/50">
                                                            <input type="text" value={block.fda} onChange={e => updateBlock(index, 'fda', e.target.value)} className="w-full p-2 bg-white rounded-lg text-xs outline-none shadow-sm" placeholder="FDA Number..."/>
                                                            <input type="text" value={block.storage} onChange={e => updateBlock(index, 'storage', e.target.value)} className="w-full p-2 bg-white rounded-lg text-xs outline-none shadow-sm" placeholder="Storage Info..."/>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={addBlockProduct} className="flex-1 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex justify-center items-center gap-2"><PlusCircle size={20}/> Add Product</button>
                                        <button onClick={addBlockSeparator} className="px-8 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all flex justify-center items-center gap-2"><Minus size={20}/> Separator</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {/* --- TAB: BANNERS --- */}
            {activeTab === "banners" && (
                <div className="p-6 md:p-10 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-black text-slate-800 uppercase mb-8">Manage Banners</h2>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 mb-8">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Banner Link</label>
                         <div className="flex gap-4">
                             <input type="text" value={newBannerImage} onChange={e => setNewBannerImage(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none" placeholder="Image URL..."/>
                             <button onClick={handleAddBanner} disabled={loading} className="px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg"><PlusCircle size={18}/> Add</button>
                         </div>
                    </div>
                    <div className="space-y-4">
                        {banners.map((banner, index) => (
                            <div key={banner.id} className={`bg-white p-4 rounded-3xl border flex gap-6 items-center shadow-sm ${banner.published ? 'border-slate-200' : 'border-slate-100 opacity-70'}`}>
                                <div className="flex flex-col gap-1"><button onClick={() => handleMoveItem('banners', banners, index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowUp size={16}/></button><button onClick={() => handleMoveItem('banners', banners, index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowDown size={16}/></button></div>
                                <div className="w-32 aspect-21/9 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                                    {/* 🟢 FIX: เช็คก่อนแสดงผลรูปภาพแบนเนอร์ */}
                                    {banner.image ? (
                                        <img src={banner.image} className="w-full h-full object-cover" alt="banner"/>
                                    ) : (
                                        <ImageIcon className="text-slate-300" size={24}/>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0"><div className="text-xs font-bold text-slate-400 uppercase truncate">{banner.image}</div></div>
                                <div className="flex items-center gap-2"><button onClick={() => handleToggleStatus('banners', banner.id, banner.published)} className={`p-2 rounded-xl transition-all ${banner.published ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}><Eye size={18}/></button><button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button></div>
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