"use client";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 pt-50 md:pt-55 pb-20 px-4 md:px-6 font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[2rem] shadow-xl border border-slate-100"
      >
        {lang === 'th' ? (
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b pb-4">ข้อกำหนดและเงื่อนไข (Terms of Service)</h1>
            <p className="text-slate-600 leading-relaxed">
              ยินดีต้อนรับสู่เว็บไซต์ของ บริษัท วินฟู้ด อินดัสตรี คอร์ปอเรชั่น จำกัด การเข้าถึงและใช้งานเว็บไซต์นี้ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขดังต่อไปนี้ โปรดอ่านอย่างละเอียดก่อนใช้งานเว็บไซต์
            </p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8">1. การใช้งานเว็บไซต์</h2>
            <p className="text-slate-600 leading-relaxed">
              เนื้อหาทั้งหมดบนเว็บไซต์นี้มีไว้เพื่อให้ข้อมูลทั่วไปเกี่ยวกับบริษัทและสินค้าของเรา ห้ามนำเนื้อหาไปใช้เพื่อวัตถุประสงค์ที่ผิดกฎหมาย หรือก่อให้เกิดความเสียหายต่อเว็บไซต์และบริษัท
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">2. ทรัพย์สินทางปัญญา</h2>
            <p className="text-slate-600 leading-relaxed">
              เนื้อหาทั้งหมดบนเว็บไซต์นี้ รวมถึงแต่ไม่จำกัดเพียง ข้อความ รูปภาพ โลโก้ กราฟิก และการออกแบบ ถือเป็นทรัพย์สินทางปัญญาของ บริษัท วินฟู้ด อินดัสตรี คอร์ปอเรชั่น จำกัด ห้ามมิให้ทำซ้ำ ดัดแปลง แจกจ่าย หรือเผยแพร่โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">3. ความถูกต้องของข้อมูลและภาพประกอบ</h2>
            <p className="text-slate-600 leading-relaxed">
              เรามุ่งมั่นที่จะให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันที่สุด อย่างไรก็ตาม <strong>ภาพสินค้าที่ปรากฏบนเว็บไซต์ใช้เพื่อการโฆษณาและการนำเสนอเท่านั้น</strong> สินค้าจริงอาจมีลักษณะ สี หรือแพ็กเกจที่แตกต่างออกไป บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อมูลสินค้าหรือยกเลิกการจำหน่ายโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">4. ข้อจำกัดความรับผิดชอบ (Limitation of Liability)</h2>
            <p className="text-slate-600 leading-relaxed">
              บริษัทจะไม่รับผิดชอบต่อความเสียหายใดๆ ทางตรง หรือทางอ้อม ที่เกิดขึ้นจากการใช้งานเว็บไซต์ การไม่สามารถใช้งานเว็บไซต์ หรือการอ้างอิงข้อมูลใดๆ ที่ปรากฏบนเว็บไซต์นี้
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">5. กฎหมายที่บังคับใช้</h2>
            <p className="text-slate-600 leading-relaxed">
              ข้อกำหนดและเงื่อนไขนี้อยู่ภายใต้การบังคับใช้และตีความตามกฎหมายของประเทศไทย ข้อพิพาทใดๆ ที่เกิดขึ้นจะอยู่ภายใต้เขตอำนาจของศาลในประเทศไทย
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b pb-4">Terms of Service</h1>
            <p className="text-slate-600 leading-relaxed">
              Welcome to the Winfood Industry Corporation Co., Ltd. website. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">1. Use of the Website</h2>
            <p className="text-slate-600 leading-relaxed">
              The content on this website is for general informational purposes regarding our company and products. You agree not to use the site for any unlawful purpose or in any way that could damage, disable, or impair the site.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">2. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              All content included on this website, such as text, graphics, logos, images, and designs, is the property of Winfood Industry Corporation Co., Ltd. and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">3. Information Accuracy and Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              While we strive to provide accurate and up-to-date information, <strong>the images displayed on this website are for advertising and illustration purposes only.</strong> Actual products may vary in appearance, color, or packaging. We reserve the right to modify product information or discontinue products without prior notice.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">4. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              In no event shall Winfood Industry Corporation Co., Ltd. be liable for any direct, indirect, incidental, or consequential damages arising out of your use of, or inability to use, this website or reliance on any information provided herein.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">5. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of Thailand. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Thailand.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}