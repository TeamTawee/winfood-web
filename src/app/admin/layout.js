// src/app/admin/layout.js

export const metadata = {
  title: "Admin Panel | Winfood Portal", // 🟢 ชื่อบน Tab ที่คุณต้องการ
  description: "Management system for Winfood products and banners.",
};

export default function AdminLayout({ children }) {
  return (
    <section>
      {children}
    </section>
  );
}