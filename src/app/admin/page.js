"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Save, X, LogOut, Settings, Package, Layers, Trash2, PlusCircle, Layout,
  ArrowUp, ArrowDown, Eye, EyeOff, Loader2, Image as ImageIcon, Minus,
  ChevronLeft, Edit3, UploadCloud, Link as LinkIcon, AlertCircle, CheckCircle, Info
} from "lucide-react";

// --- COMPONENTS ---

// 🟢 ImageUploader: ปรับภาษาไทย + Layout แนวตั้ง
function ImageUploader({ label, currentImage, onImageUpload, folderName = "general" }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 🟢 1. เรียกใช้ฟังก์ชันบีบอัดรูปก่อน
      const compressedFile = await compressImage(file);
      
      const fileName = `${Date.now()}_${compressedFile.name}`; // ใช้ชื่อไฟล์ใหม่ (ที่เป็น .webp)
      const storageRef = ref(storage, `${folderName}/${fileName}`);

      // 🟢 2. เพิ่ม Metadata เพื่อบอกให้ Cache ไว้นานๆ (1 ปี)
      const metadata = {
        cacheControl: 'public, max-age=31536000, immutable',
        contentType: compressedFile.type,
      };

      // ส่งไฟล์ที่บีบอัดแล้ว + metadata ขึ้นไป
      await uploadBytes(storageRef, compressedFile, metadata);
      
      const downloadURL = await getDownloadURL(storageRef);
      onImageUpload(downloadURL);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation();
    if (!confirm("ต้องการลบรูปภาพนี้ออกใช่ไหม? (ไฟล์รูปภาพจะถูกลบออกจากเซิร์ฟเวอร์ด้วย)")) return;
    
    // ถ้ามีรูปเดิมอยู่ พยายามลบรูปเดิมออกจาก Firebase Storage ก่อน
    if (currentImage && currentImage.includes('firebase')) {
      try {
        // ดึง Path ของไฟล์จาก URL
        const fileUrl = new URL(currentImage);
        const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?alt=media')[0]);
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef); // สั่งลบไฟล์จริง
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }

    onImageUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
        {label}
      </label>
      
      <div className="flex flex-col gap-3 items-start">
        {/* กรอบรูปภาพ */}
        <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative group self-start">
          {currentImage ? (
            <>
              <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 z-10"
                title="ลบรูปภาพ"
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <ImageIcon className="text-slate-300" size={20}/>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <Loader2 className="animate-spin text-white" size={16} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 w-full min-w-0">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          
          <div className="flex gap-2">
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 hover:border-green-200 transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
                {isUploading ? "กำลังอัปโหลด..." : <><UploadCloud size={14}/> เลือกรูปภาพ</>}
            </button>
            {currentImage && (
                <button onClick={handleRemoveImage} className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-100 transition-all flex items-center justify-center gap-2 shadow-sm"><Trash2 size={14}/></button>
            )}
          </div>
          
          <input type="text" value={currentImage || ""} readOnly className="w-full text-[10px] text-slate-400 bg-transparent border-none p-0 focus:ring-0 truncate" placeholder="ยังไม่มีรูปภาพ" />
        </div>
      </div>
    </div>
  );
}

// 🟢 StatusSelector: แปลไทย
function StatusSelector({ status, onChange }) {
  const states = {
    active: { label: "พร้อมขาย (Active)", color: "bg-green-100 text-green-700 border-green-200", icon: <Eye size={14}/> },
    out_of_stock: { label: "สั่งผลิต (Made to Order)", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <AlertCircle size={14}/> },
    hidden: { label: "ซ่อน (Hidden)", color: "bg-slate-100 text-slate-500 border-slate-200", icon: <EyeOff size={14}/> }
  };

  const currentStatus = (status === true) ? 'active' : (status === false) ? 'hidden' : (status || 'active');
  const currentStyle = states[currentStatus] || states.active;

  return (
    <div className="flex items-center gap-2">
      <select 
        value={currentStatus} 
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${currentStyle.color}`}
      >
        <option value="active">พร้อมขาย (แสดงปกติ)</option>
        <option value="out_of_stock">สั่งผลิต (แสดงป้ายสีส้ม)</option>
        <option value="hidden">ซ่อนสินค้า (ไม่แสดง)</option>
      </select>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-9999 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-green-600" size={32} />
        <span className="text-sm font-bold text-slate-600">กำลังประมวลผล...</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState("products");
  const [globalLoading, setGlobalLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // --- States Product ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [coverImage, setCoverImage] = useState(""); 
  const [heroImage, setHeroImage] = useState(""); 
  const [order, setOrder] = useState(0); 
  const [status, setStatus] = useState("active");
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(null); // เช็คเวลาอัปเดตล่าสุด 
  const [initialSnapshot, setInitialSnapshot] = useState(""); // 🟢 เพิ่มตัวนี้สำหรับเช็คว่ามีการแก้ไขไหม
  
  const [blocks, setBlocks] = useState([]); 
  const [itemsList, setItemsList] = useState([]);
  const [editId, setEditId] = useState(null); 
  const [banners, setBanners] = useState([]);
  
  const [newBannerImage, setNewBannerImage] = useState("");
  const [newBannerLink, setNewBannerLink] = useState("");
  
  const triggerUpdate = async () => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'home-data' }),
      });
    } catch (error) {
      console.error('Error triggering update:', error);
    }
  };

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
        setItemsList(snap.docs.map(doc => {
            const data = doc.data();
            let currentStatus = data.status;
            if (!currentStatus) { currentStatus = data.published ? 'active' : 'hidden'; }
            return { id: doc.id, ...data, status: currentStatus };
        }));
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
    setGlobalLoading(true);
    try {
        await deleteDoc(doc(db, "products", id));
        await fetchData();
        await triggerUpdate();
    } catch (err) { alert(err.message); }
    finally { setGlobalLoading(false); }
  };

  const normalizeBlock = (block) => ({
    type: block.type || 'product',
    status: block.status || (block.visible !== false ? 'active' : 'hidden'),
    isBestSeller: block.isBestSeller || false,
    layout: block.layout || 'left', 
    heading: block.heading || "", 
    content: block.content || "", 
    mediaSrc: block.mediaSrc || "",
    popupImage: block.popupImage || "",
    textColor: block.textColor || 'text-slate-500',
    fontWeight: block.fontWeight || 'font-bold',
    attributes: block.attributes || [], 
    fda: block.fda || "", 
    storage: block.storage || "",
    // 🟢 เพิ่มฟิลด์รูปโลโก้สำหรับเส้นคั่น
    separatorImage: block.separatorImage || "" 
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

  const removeBlock = (i) => {
      if(!confirm("ลบรายการย่อยนี้?")) return;
      setBlocks(blocks.filter((_, idx) => idx !== i));
  };
  
  const addAttrToBlock = (bi) => { const n = [...blocks]; n[bi].attributes.push({ key: "", value: "" }); setBlocks(n); };
  const updateAttrInBlock = (bi, ai, f, v) => { const n = [...blocks]; n[bi].attributes[ai][f] = v; setBlocks(n); };
  const removeAttrFromBlock = (bi, ai) => { const n = [...blocks]; n[bi].attributes = n[bi].attributes.filter((_, i) => i !== ai); setBlocks(n); };

  const handleProductSubmit = async () => {
    setGlobalLoading(true);
    
    // 🟢 ทำความสะอาด Slug ป้องกันการพิมพ์เว้นวรรคหรือตัวพิมพ์ใหญ่ (ถ้าไม่กรอก จะสร้างจาก title อัตโนมัติ)
    const finalSlug = slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = { 
        title, slug: finalSlug, category, shortDesc, image: coverImage, heroImage: heroImage,  // 🟢 เพิ่ม slug เข้าไปใน payload
        order: Number(order), status: status, isBestSeller, contentBlocks: blocks, updatedAt: new Date() 
    };
    // ... โค้ดส่วนที่เหลือของฟังก์ชันนี้เหมือนเดิม
    try {
      if (editId) { 
          // 🟢 เพิ่มระบบเช็คการเซฟชนกันตรงนี้
          const docRef = doc(db, "products", editId);
          const snap = await getDoc(docRef);
          
          if (snap.exists()) {
              const currentDbUpdatedAt = snap.data().updatedAt ? snap.data().updatedAt.toMillis() : 0;
              // ถ้าเวลาใน Database ใหม่กว่าเวลาที่เราโหลดมา แสดงว่ามีคนเซฟตัดหน้าไปแล้ว
              if (loadedUpdatedAt > 0 && currentDbUpdatedAt > loadedUpdatedAt) {
                  setGlobalLoading(false);
                  const forceSave = confirm("⚠️ มีแอดมินคนอื่นแก้ไขข้อมูลสินค้านี้ไปแล้วระหว่างที่คุณกำลังทำงานอยู่!\n\nหากคุณกด OK ข้อมูลของคุณจะไปทับข้อมูลของพวกเขา\nหากกด Cancel ให้รีเฟรชหน้าเพื่อดูข้อมูลล่าสุดก่อน");
                  if (!forceSave) return; // ยกเลิกการเซฟ
                  setGlobalLoading(true); // ถ้ากดยืนยันจะเซฟทับ ให้โหลดต่อ
              }
          }
          
          await updateDoc(docRef, payload); 
      } 
      else { 
          await addDoc(collection(db, "products"), { ...payload, createdAt: new Date() }); 
      }
      await fetchData();
      await triggerUpdate();
      backToList(true); // 🟢 สั่งให้กลับไปหน้าแรกได้เลย ไม่ต้องเตือนเพราะเซฟเสร็จแล้ว
    } catch (e) { alert(e.message); } 
    finally { setGlobalLoading(false); }
  };

  const handleCreateNew = () => {
      resetForm();
      const maxOrder = itemsList.length > 0 ? Math.max(...itemsList.map(i => i.order || 0)) : 0;
      const newOrder = maxOrder + 1;
      setOrder(newOrder);
      
      // 🟢 เพิ่ม slug: "" เข้าไปใน Snapshot เริ่มต้น
      setInitialSnapshot(JSON.stringify({ title: "", slug: "", category: "", shortDesc: "", coverImage: "", heroImage: "", order: newOrder, status: "active", isBestSeller: false, blocks: [] }));
      
      setViewMode("edit");
  };

  const handleEditClick = (item) => {
      // ดึงค่ามาพักไว้ก่อนเพื่อความชัวร์เวลาเอาไปเทียบ
      const t = item.title || "";
      const sl = item.slug || ""; // 🟢 ดึงค่า slug มาจากฐานข้อมูล
      const c = item.category || "";
      const sd = item.shortDesc || "";
      const ci = item.image || "";
      const hi = item.heroImage || "";
      const o = item.order || 0;
      const s = item.status || (item.published ? 'active' : 'hidden');
      const ibs = item.isBestSeller || false;
      const blks = (item.contentBlocks || []).map(normalizeBlock);

      setEditId(item.id); 
      setTitle(t); 
      setSlug(sl); // 🟢 อัปเดต state ของ slug
      setCategory(c);
      setShortDesc(sd); 
      setCoverImage(ci); 
      setHeroImage(hi);
      setOrder(o); 
      setStatus(s); 
      setIsBestSeller(ibs); 
      setBlocks(blks);
      setLoadedUpdatedAt(item.updatedAt ? item.updatedAt.toMillis() : 0);
      
      // 🟢 เพิ่ม slug: sl เข้าไปใน Snapshot
      setInitialSnapshot(JSON.stringify({ title: t, slug: sl, category: c, shortDesc: sd, coverImage: ci, heroImage: hi, order: o, status: s, isBestSeller: ibs, blocks: blks }));

      setViewMode("edit");
  };

  const backToList = (forceBypass = false) => {
      // เช็คว่าถ้าไม่ใช่การโดนสั่งย้อนกลับอัตโนมัติจากการกดเซฟ
      if (forceBypass !== true) {
          // 🟢 เพิ่มตัวแปร slug เข้ามาใน snapshot ปัจจุบันเพื่อเอาไปเทียบ
          const currentSnapshot = JSON.stringify({ title, slug, category, shortDesc, coverImage, heroImage, order, status, isBestSeller, blocks });
          
          // ถ้าข้อมูลปัจจุบัน "ไม่เหมือน" กับตอนแรกที่เปิดหน้ามา ค่อยเด้งเตือน
          if (currentSnapshot !== initialSnapshot) {
              const confirmLeave = window.confirm(
                  "⚠️ คำเตือน: คุณมีการแก้ไขข้อมูลค้างไว้!\n\nหากคุณย้อนกลับโดยไม่กด 'บันทึก' ข้อมูลที่แก้ไขจะสูญหายทั้งหมด\nคุณต้องการย้อนกลับใช่หรือไม่?"
              );
              if (!confirmLeave) return;
          }
      }

      resetForm();
      setViewMode("list");
  };

  const resetForm = () => { 
      setEditId(null); 
      setTitle(""); 
      setSlug(""); // 🟢 เคลียร์ค่า slug กลับเป็นค่าว่าง
      setCategory(""); 
      setShortDesc(""); 
      setCoverImage(""); 
      setHeroImage("");
      setBlocks([]); 
      setStatus('active'); 
      setIsBestSeller(false); 
      setLoadedUpdatedAt(null);
  };

  const handleMoveItem = async (col, items, idx, dir) => {
    setGlobalLoading(true);
    const newItems = [...items];
    const targetIndex = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) {
        setGlobalLoading(false); return;
    }
    [newItems[idx], newItems[targetIndex]] = [newItems[targetIndex], newItems[idx]];
    if (col === 'products') setItemsList(newItems); else setBanners(newItems);
    try {
        await updateDoc(doc(db, col, newItems[idx].id), { order: idx + 1 });
        await updateDoc(doc(db, col, newItems[targetIndex].id), { order: targetIndex + 1 });
        if (col === 'products') await fetchData(); else await fetchBanners();
        await triggerUpdate(); // 🟢 สั่งล้างแคช
    } catch (e) { console.error(e); }
    finally { setGlobalLoading(false); }
  };

  const handleStatusChangeInList = async (col, id, newStatus) => {
      setGlobalLoading(true);
      try { 
          await updateDoc(doc(db, col, id), { status: newStatus }); 
          if (col === 'products') await fetchData(); else await fetchBanners(); 
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); }
  };

  const handleAddBanner = async () => {
      if (!newBannerImage) return alert("กรุณาอัปโหลดรูปภาพก่อน");
      setGlobalLoading(true);
      try {
          const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order || 0)) : 0;
          await addDoc(collection(db, "banners"), { 
              image: newBannerImage, link: newBannerLink || "", order: maxOrder + 1, published: true, createdAt: new Date() 
          });
          setNewBannerImage(""); setNewBannerLink("");
          await fetchBanners();
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); } 
      finally { setGlobalLoading(false); }
  };

  const handleBannerLinkChange = (id, newLink) => {
      setBanners(banners.map(b => b.id === id ? { ...b, link: newLink } : b));
  };

  const handleSaveBannerLink = async (id, newLink) => {
      try { 
          await updateDoc(doc(db, "banners", id), { link: newLink }); 
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); }
  };

  const handleUpdateBannerImage = async (id, newImage) => {
      setGlobalLoading(true);
      try {
          await updateDoc(doc(db, "banners", id), { image: newImage });
          await fetchBanners();
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); }
  };

  const handleToggleBannerStatus = async (id, currentStatus) => {
      setGlobalLoading(true);
      try { 
          await updateDoc(doc(db, "banners", id), { published: !currentStatus }); 
          await fetchBanners(); 
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); }
  };

  const handleDeleteBanner = async (id) => { 
      if (!confirm("ต้องการลบแบนเนอร์นี้ใช่ไหม?")) return; 
      setGlobalLoading(true);
      try { 
          await deleteDoc(doc(db, "banners", id)); 
          await fetchBanners(); 
          await triggerUpdate(); // 🟢 สั่งล้างแคช
      } catch (e) { console.error(e); }
      finally { setGlobalLoading(false); }
  };

  if (authLoading || !isAuthorized) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      {globalLoading && <LoadingOverlay />}

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 flex flex-col z-40 shadow-sm">
         <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
             <h1 className="font-black flex items-center gap-2 tracking-tight uppercase text-lg text-green-400"><Settings size={20} className="text-white"/> ผู้ดูแลระบบ</h1>
        </div>
        <div className="p-4 space-y-2 flex-1">
            <button onClick={() => {setActiveTab("products"); setViewMode("list");}} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'products' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Package size={18}/> จัดการสินค้า</button>
            <button onClick={() => setActiveTab("banners")} className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'banners' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}><Layers size={18}/> จัดการแบนเนอร์</button>
        </div>
        <div className="p-4">
            <button onClick={() => signOut(auth)} className="w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"><LogOut size={18}/> ออกจากระบบ</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 h-screen overflow-y-auto relative">
        <div className="max-w-5xl mx-auto pb-20">
            
            {/* --- TAB: PRODUCTS --- */}
            {activeTab === "products" && (
                <>
                    {/* VIEW MODE: LIST */}
                    {viewMode === "list" && (
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">หมวดหมู่สินค้า</h2><p className="text-slate-400 text-xs mt-1">จัดการหมวดหมู่และสินค้าภายใน</p></div>
                                <button onClick={handleCreateNew} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"><PlusCircle size={18}/> เพิ่มหมวดหมู่</button>
                            </div>

                            <div className="grid gap-4">
                                {itemsList.length === 0 && <div className="text-center py-20 text-slate-400">ยังไม่มีข้อมูล กดเพิ่มหมวดหมู่ได้เลย!</div>}
                                {itemsList.map((item, index) => (
                                    <div key={item.id} className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-green-400 transition-all group ${item.status === 'hidden' && 'opacity-60 grayscale'}`}>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'up')}} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600"><ArrowUp size={16}/></button>
                                            <button onClick={(e) => {e.stopPropagation(); handleMoveItem('products', itemsList, index, 'down')}} className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600"><ArrowDown size={16}/></button>
                                        </div>
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 relative flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt="icon"/>
                                            ) : (
                                                <ImageIcon className="text-slate-300" size={24}/>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{item.category}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800 truncate">{item.title}</h3>
                                            
                                            <p className="text-xs text-slate-400 truncate">
                                                {item.contentBlocks?.filter(b => b.type !== 'separator').length || 0} รายการย่อยข้างใน
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusSelector status={item.status} onChange={(val) => handleStatusChangeInList('products', item.id, val)} />
                                            <button onClick={() => handleEditClick(item)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-green-600 transition-colors flex items-center gap-2"><Edit3 size={14}/> แก้ไข</button>
                                            <button onClick={(e) => handleDeleteCategory(item.id, e)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16}/></button>
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
                                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h2>
                                        <span className="text-xs text-slate-400 font-medium">จัดการรายละเอียดและสินค้าภายใน</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setIsBestSeller(!isBestSeller)} 
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2 ${isBestSeller ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-400 border-slate-200'}`}
                                    >
                                        {isBestSeller ? <CheckCircle size={14}/> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300"></div>}
                                        สินค้าขายดี (Best Seller)
                                    </button>

                                    <StatusSelector status={status} onChange={setStatus} />
                                    
                                    <button onClick={handleProductSubmit} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-green-700 hover:shadow-green-200 transition-all flex items-center gap-2 min-w-30 justify-center"><Save size={18}/> บันทึก</button>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อหมวดหมู่ / ชื่อสินค้าหลัก</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-2xl md:text-3xl font-black border-b-2 border-slate-100 focus:border-green-500 outline-none py-2 bg-transparent placeholder:text-slate-200" placeholder="ชื่อสินค้า..."/>
        </div>
        {/* 🟢 เพิ่มช่องกรอกลิงก์ Slug ตรงนี้ */}
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL (Slug) - ตัวพิมพ์เล็กภาษาอังกฤษ</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full text-lg border-b-2 border-slate-100 focus:border-green-500 outline-none py-2 bg-transparent placeholder:text-slate-200 mt-1 md:mt-2 text-green-600" placeholder="เช่น premium-jasmine-rice (เว้นว่างไว้ระบบจะสร้างให้)"/>
        </div>
    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <ImageUploader 
                                            label="รูปปก (สี่เหลี่ยมจัตุรัส)" 
                                            currentImage={coverImage} 
                                            onImageUpload={setCoverImage}
                                            folderName="products"
                                        />
                                        <ImageUploader 
                                            label="รูปหัวข้อ (แนวนอนยาว)" 
                                            currentImage={heroImage} 
                                            onImageUpload={setHeroImage}
                                            folderName="products"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">แท็ก (Tag)</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-green-500" placeholder="เช่น BEVERAGE"/></div>
                                        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">คำอธิบายสั้นๆ</label><textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} rows={2} className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none resize-none focus:ring-2 focus:ring-green-500" placeholder="รายละเอียดสั้นๆ..."/></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-2"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout size={14}/> จัดการรายการสินค้าภายใน</div></div>
                                    {blocks.map((block, index) => (
                                        <div key={index} className={`rounded-3xl border p-6 shadow-sm relative transition-all ${block.type === 'separator' ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200'} ${block.status === 'hidden' && 'opacity-60 bg-slate-50 grayscale'}`}>
                                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                                <div className="flex gap-2">
                                                    <span className={`bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase mr-2 ${block.type==='separator' && 'bg-slate-400'}`}>{block.type === 'separator' ? 'เส้นคั่น' : 'สินค้า'}</span>
                                                    <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowUp size={14}/></button>
                                                    <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowDown size={14}/></button>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    
                                                    {block.type !== 'separator' && (
                                                        <button 
                                                            onClick={() => updateBlock(index, 'isBestSeller', !block.isBestSeller)}
                                                            className={`px-2 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all text-[10px] font-bold ${block.isBestSeller ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-300 border-slate-200'}`}
                                                            title="ตั้งเป็นสินค้าขายดี"
                                                        >
                                                            <CheckCircle size={12} />
                                                            {block.isBestSeller ? 'ขายดี (Best Seller)' : 'ขายดี'}
                                                        </button>
                                                    )}

                                                    {block.type !== 'separator' && (
                                                      <StatusSelector status={block.status} onChange={(val) => updateBlock(index, 'status', val)} />
                                                    )}
                                                    
                                                    <button onClick={() => removeBlock(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                            
                                            {block.type === 'separator' ? (
                                                <div className="space-y-6">
                                                    {/* 🟢 ส่วนที่เพิ่มใหม่: อัปโหลดรูปโลโก้สำหรับเส้นคั่น */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                        <ImageUploader 
                                                            label="รูปโลโก้คั่น (Separator Logo)" 
                                                            currentImage={block.separatorImage} 
                                                            onImageUpload={(url) => updateBlock(index, 'separatorImage', url)}
                                                            folderName="products/separators"
                                                        />
                                                        <div className="text-xs text-slate-500 space-y-2 mt-6">
                                                            <p className="font-bold flex items-center gap-1"><Info size={14}/> คำแนะนำ:</p>
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                <li>ควรใช้รูปสัดส่วน 1:1 (สี่เหลี่ยมจัตุรัส)</li>
                                                                <li>พื้นหลังควรโปร่งใส (Transparent PNG/WEBP) เพื่อความสวยงาม</li>
                                                                <li>รูปจะแสดงอยู่ตรงกลางเหนือข้อความ (ถ้ามี)</li>
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ข้อความคั่น (Separator Text)</label>
                                                        <input 
                                                            type="text" 
                                                            value={block.content} 
                                                            onChange={e => updateBlock(index, 'content', e.target.value)} 
                                                            className={`w-full p-4 bg-white rounded-xl text-sm border border-slate-200 outline-none focus:border-green-500 font-mono ${block.textColor} ${block.fontWeight}`} 
                                                            placeholder="เว้นว่างไว้เพื่อแสดงเส้นคั่นยาว (---)"
                                                        />
                                                        <p className="text-[10px] text-slate-400 pl-1 flex items-center gap-1">
                                                            <Info size={12}/> หากเว้นว่างไว้ จะแสดงเป็นเส้นขีดคั่นยาวตลอดแนว
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {[{l:'สีเทา',c:'text-slate-500'},{l:'สีเขียว',c:'text-green-600'},{l:'สีฟ้า',c:'text-cyan-500'},{l:'สีแดง',c:'text-red-500'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'textColor',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.textColor===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                                        <div className="w-px h-4 bg-slate-300 mx-1 self-center"></div>
                                                        {[{l:'ตัวธรรมดา',c:'font-normal'},{l:'ตัวหนา',c:'font-bold'},{l:'ตัวหนามาก',c:'font-black'}].map(p=>(<button key={p.c} onClick={()=>updateBlock(index,'fontWeight',p.c)} className={`px-2 py-1 rounded text-[10px] font-bold border ${block.fontWeight===p.c?'bg-slate-800 text-white':'bg-white text-slate-400'}`}>{p.l}</button>))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อสินค้า</label>
                                                            <input type="text" value={block.heading} onChange={e => updateBlock(index, 'heading', e.target.value)} className="w-full font-bold border-b border-slate-200 outline-none py-2 text-lg focus:border-green-500 bg-transparent" placeholder="ระบุชื่อสินค้า..."/>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <ImageUploader 
                                                                label="รูปแสดงในตาราง (Grid)" 
                                                                currentImage={block.mediaSrc} 
                                                                onImageUpload={(url) => updateBlock(index, 'mediaSrc', url)}
                                                                folderName="products/subitems"
                                                            />
                                                            <ImageUploader 
                                                                label="รูปขยาย (Popup)" 
                                                                currentImage={block.popupImage} 
                                                                onImageUpload={(url) => updateBlock(index, 'popupImage', url)}
                                                                folderName="products/subitems"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">รายละเอียดสินค้า</label>
                                                            <textarea value={block.content} onChange={e => updateBlock(index, 'content', e.target.value)} rows={3} className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none outline-none resize-none focus:ring-2 focus:ring-green-500" placeholder="ใส่รายละเอียด..."/>
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100 space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-green-700 uppercase">รายละเอียดสินค้า (แบบข้อ)</label>
                                                            {block.attributes.map((attr, attrIdx) => (
                                                                <div key={attrIdx} className="flex gap-2 items-center"><input type="text" value={attr.key} onChange={e => updateAttrInBlock(index, attrIdx, 'key', e.target.value)} placeholder="ชื่อ (Key)" className="flex-1 p-2 bg-white rounded-lg text-xs outline-none shadow-sm"/><input type="text" value={attr.value} onChange={e => updateAttrInBlock(index, attrIdx, 'value', e.target.value)} placeholder="ค่า (Value)" className="w-20 p-2 bg-white rounded-lg text-xs outline-none shadow-sm"/><button onClick={() => removeAttrFromBlock(index, attrIdx)} className="text-red-400 hover:text-red-600"><X size={14}/></button></div>
                                                            ))}
                                                            <button onClick={() => addAttrToBlock(index)} className="w-full py-2 border border-dashed border-green-300 rounded-lg text-green-600 text-[10px] font-bold hover:bg-white transition-all">+ เพิ่มส่วนประกอบ</button>
                                                        </div>
                                                        <div className="space-y-2 pt-2 border-t border-green-200/50">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase">เลข อย. (FDA)</label>
                                                                <input type="text" value={block.fda} onChange={e => updateBlock(index, 'fda', e.target.value)} className="w-full p-2 bg-white rounded-lg text-xs outline-none shadow-sm" placeholder="เลข อย..."/>
                                                            </div>
                                                            <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase">การเก็บรักษา (Storage) | รองรับการขึ้นบรรทัดใหม่</label>
    <textarea 
        value={block.storage} 
        onChange={e => updateBlock(index, 'storage', e.target.value)} 
        rows={3} // ปรับให้ใหญ่ขึ้นเป็น 3 บรรทัด
        className="w-full p-2 bg-white rounded-lg text-xs outline-none shadow-sm resize-none focus:ring-2 focus:ring-green-500" 
        placeholder="ข้อมูลการเก็บรักษา (กด Enter เพื่อขึ้นบรรทัดใหม่ได้)..."
    />
</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={addBlockProduct} className="flex-1 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all flex justify-center items-center gap-2"><PlusCircle size={20}/> เพิ่มสินค้าใหม่</button>
                                        <button onClick={addBlockSeparator} className="px-8 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all flex justify-center items-center gap-2"><Minus size={20}/> เพิ่มเส้นคั่น</button>
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
                    <h2 className="text-2xl font-black text-slate-800 uppercase mb-8">จัดการแบนเนอร์</h2>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 mb-8">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เพิ่มแบนเนอร์ใหม่</label>
                         <div className="flex flex-col gap-4">
                             <ImageUploader 
                                 label="อัปโหลดรูปภาพ" 
                                 currentImage={newBannerImage} 
                                 onImageUpload={setNewBannerImage}
                                 folderName="banners"
                             />
                             <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <LinkIcon size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                                    <input 
                                      type="text" 
                                      value={newBannerLink} 
                                      onChange={e => setNewBannerLink(e.target.value)} 
                                      className="w-full p-3 pl-10 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-green-500 outline-none" 
                                      placeholder="ลิงก์ปลายทาง (ถ้ามี) เช่น /product/123"
                                    />
                                </div>
                                <button onClick={handleAddBanner} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg"><PlusCircle size={18}/> เพิ่ม</button>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-4">
                        {banners.map((banner, index) => (
                            <div key={banner.id} className={`bg-white p-4 rounded-3xl border flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm ${banner.published ? 'border-slate-200' : 'border-slate-100 opacity-70'}`}>
                                <div className="flex flex-row md:flex-col gap-1">
                                  <button onClick={() => handleMoveItem('banners', banners, index, 'up')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowUp size={16}/></button>
                                  <button onClick={() => handleMoveItem('banners', banners, index, 'down')} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ArrowDown size={16}/></button>
                                </div>
                                <div className="w-full md:w-48 shrink-0">
    <ImageUploader 
        label="รูปภาพแบนเนอร์" 
        currentImage={banner.image} 
        onImageUpload={(url) => handleUpdateBannerImage(banner.id, url)}
        folderName="banners"
    />
</div>

<div className="flex-1 min-w-0 w-full space-y-2 self-start mt-6 md:mt-0">
    <label className="text-[10px] font-bold text-slate-400 uppercase">ลิงก์ปลายทาง (แก้ไขแล้วคลิกพื้นที่ว่างเพื่อบันทึก)</label>
    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all">
        <LinkIcon size={14} className="text-slate-400"/>
        <input 
            type="text" 
            value={banner.link || ""} 
            onChange={(e) => handleBannerLinkChange(banner.id, e.target.value)}
            onBlur={(e) => handleSaveBannerLink(banner.id, e.target.value)}
            placeholder="วางลิงก์ที่นี่ เช่น /product/123"
            className="text-sm text-slate-700 bg-transparent border-none outline-none w-full placeholder:text-slate-300"
        />
    </div>
</div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <button 
                                        onClick={() => handleToggleBannerStatus(banner.id, banner.published)} 
                                        className={`p-2 rounded-xl transition-all ${banner.published ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}
                                        title={banner.published ? "ซ่อนแบนเนอร์" : "แสดงแบนเนอร์"}
                                    >
                                        {banner.published ? <Eye size={18}/> : <EyeOff size={18}/>}
                                    </button>
                                    <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18}/></button>
                                </div>
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

// 🟢 ฟังก์ชันช่วยบีบอัดรูปภาพ (สูตร Premium Food: ชัดระดับ HD+ สีสด รายละเอียดครบ)
const compressImage = (file) => {
  return new Promise((resolve) => {
    // ถ้าไม่ใช่รูปภาพ ให้คืนค่าไฟล์เดิมกลับไป
    if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
    }

    // 🚀 ใช้ createObjectURL เพื่อความเร็วสูงสุด
    const imgUrl = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src = imgUrl;
    
    img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // 🟢 ปรับ 1: เพิ่มความกว้างเป็น 1920px (Full HD Standard)
        // รายละเอียด Texture อาหารจะมาชัดกว่าเดิมมาก
        const MAX_WIDTH = 1920; 
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            // ถ้ารูปเล็กกว่า 1920px อยู่แล้ว ให้ใช้ขนาดเดิมเลย (ไม่ย่อ ไม่ขยาย)
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext("2d");
        
        // 🟢 ปรับ 2: เปิดโหมด "High Quality" แบบเต็มสูบ
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 🟢 ปรับ 3: ดันคุณภาพเป็น 0.96 (96%) 
        // จุดนี้คือ Sweet Spot ของภาพอาหารที่ต้องการความใสและคม
        canvas.toBlob((blob) => {
          // สร้างชื่อไฟล์ใหม่
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          
          const newFile = new File([blob], newName, { 
              type: "image/webp", 
              lastModified: Date.now() 
          });
          
          // 🧹 คืนหน่วยความจำ
          URL.revokeObjectURL(imgUrl);
          
          // Debug ดูขนาดไฟล์ใหม่
          console.log(`Premium Food Mode: ${file.size} -> ${newFile.size} bytes`);
          
          resolve(newFile);
        }, "image/webp", 0.96); 
    }
    
    img.onerror = () => {
        URL.revokeObjectURL(imgUrl);
        resolve(file); 
    }
  })
}