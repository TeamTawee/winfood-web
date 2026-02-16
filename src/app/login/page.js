"use client";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, ChefHat } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // 🟢 ตรวจสอบโดเมน @fufonglabs.com ตามที่คุณต้องการ
        if (!user.email.endsWith("@fufonglabs.com")) {
            await signOut(auth);
            setError("ขออภัย! อนุญาตเฉพาะบัญชี @fufonglabs.com เท่านั้น");
            setLoading(false);
            return;
        }
        router.push("/admin");
    } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A] p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#16a34a] rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg rotate-3">
                <ChefHat size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">WINFOOD Portal</h1>
            <p className="text-slate-500 text-sm mt-2">Staff Only - ยืนยันตัวตนเพื่อจัดการข้อมูลสินค้า</p>
        </div>

        {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-xs p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {error}
            </div>
        )}

        <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 hover:border-[#16a34a] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
        >
            {loading ? <Loader2 className="animate-spin text-[#16a34a]" size={24}/> : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
                    เข้าสู่ระบบด้วย Google
                </>
            )}
        </button>
      </div>
    </div>
  );
}