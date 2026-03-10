import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase"; 
import { unstable_cache } from "next/cache";
import HomeClient from "./HomeClient";

// 🟢 ดึงข้อมูลแบบ Server-side และทำการแคชไว้ (ติด tag 'home-data')
const getHomeData = unstable_cache(
  async () => {
    let products = [];
    let banners = [];
    try {
      // ดึงสินค้า
      const prodQ = query(collection(db, "products"), orderBy("order", "asc"));
      const prodSnap = await getDocs(prodQ);
      products = prodSnap.docs.map(doc => {
          const data = doc.data();
          let status = data.status || (data.published ? 'active' : 'hidden');
          // แปลง Date/Timestamp ให้เป็นข้อความธรรมดา เพื่อส่งผ่าน Props ได้
          const cleanBlocks = data.contentBlocks ? data.contentBlocks.map(b => ({...b})) : [];
          return { id: doc.id, ...data, status, contentBlocks: cleanBlocks, createdAt: null, updatedAt: null };
      }).filter(p => p.status !== 'hidden'); 

      // ดึงแบนเนอร์
      const banQ = query(collection(db, "banners"), where("published", "==", true), orderBy("order", "asc"));
      const banSnap = await getDocs(banQ);
      banners = banSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, createdAt: null };
      });
    } catch (e) { console.error("Error fetching data:", e); }
    
    return { products, banners };
  },
  ['home-data-key'], // ชื่อ Cache
  { tags: ['home-data'] } // Tag สำหรับให้ Admin สั่งลบ
);

export default async function HomePage() {
  const { products, banners } = await getHomeData();
  
  // โยนข้อมูลที่ดึงเสร็จแล้วไปให้ฝั่ง Client แสดงผลแอนิเมชัน
  return <HomeClient initialProducts={products} initialBanners={banners} />;
}