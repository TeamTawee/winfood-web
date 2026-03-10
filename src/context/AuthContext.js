"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import { useRouter, usePathname } from "next/navigation";
// 🟢 เพิ่ม import Image เข้ามาด้วยครับ
import { Loader2 } from "lucide-react";
import Image from "next/image";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // ตรวจสอบโดเมน (อนุญาตเฉพาะคนในองค์กร)
        if (currentUser.email.endsWith("@fufonglabs.com")) {
          setUser(currentUser);
        } else {
          await signOut(auth);
          setUser(null);
          alert("สิทธิ์การเข้าถึงจำกัดเฉพาะบุคลากรของ fufonglabs.com เท่านั้น");
        }
      } else {
        setUser(null);
      }
      // หน่วงเวลาปิดหน้านี้ 1 วินาที เพื่อให้เห็น Logo Branding สวยๆ ก่อนเข้าเว็บ
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ระบบ Protection สำหรับหน้า Admin
  useEffect(() => {
    if (loading) return;

    const isAdminPage = pathname.startsWith("/admin");
    const isLoginPage = pathname === "/login";

    if (isAdminPage && !user) {
        router.push("/login");
    }

    if (isLoginPage && user) {
        router.push("/admin");
    }
  }, [user, loading, pathname, router]);

  // 🟢 แก้ไขตรงนี้: เปลี่ยนจาก Text ธรรมดา เป็นหน้า Logo Loader
  if (loading) {
    const isSpecialPage = pathname.startsWith("/admin") || pathname === "/login";
    if (isSpecialPage) {
      return (
        <div className="fixed inset-0 bg-white z-9999 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-40 h-20 animate-pulse">
              <Image 
                  src="/images/Logo cl.png" 
                  alt="Winfood Loading" 
                  fill 
                  className="object-contain" 
                  priority 
              />
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              <Loader2 className="animate-spin text-green-600" size={18} />
              Loading Experience...
          </div>
        </div>
      );
    }
  }

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};