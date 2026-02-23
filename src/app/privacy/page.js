"use client";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b pb-4">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
            <p className="text-slate-600 leading-relaxed">
              บริษัท วินฟู้ด อินดัสตรี คอร์ปอเรชั่น จำกัด ("บริษัท", "เรา", "พวกเรา" หรือ "ของเรา") ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ นโยบายความเป็นส่วนตัวฉบับนี้อธิบายถึงวิธีการที่เรารวบรวม ใช้ และปกป้องข้อมูลที่คุณมอบให้เมื่อเข้าชมเว็บไซต์ของเรา
            </p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8">1. ข้อมูลที่เรารวบรวม</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong className="text-slate-700">ข้อมูลที่ท่านให้ไว้โดยตรง:</strong> เมื่อคุณติดต่อเราผ่านช่องทางต่างๆ เช่น อีเมล หรือฟอร์มติดต่อ เราอาจเก็บรวบรวมข้อมูลส่วนบุคคล เช่น ชื่อ นามสกุล อีเมล และเบอร์โทรศัพท์</li>
              <li><strong className="text-slate-700">ข้อมูลที่รวบรวมโดยอัตโนมัติ:</strong> เราอาจใช้คุกกี้ (Cookies) และเทคโนโลยีการติดตามที่คล้ายกันเพื่อรวบรวมข้อมูลการใช้งานเว็บไซต์ เช่น ที่อยู่ IP, ประเภทของเบราว์เซอร์ และหน้าเว็บที่คุณเข้าชม เพื่อนำมาปรับปรุงประสบการณ์การใช้งาน</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8">2. การใช้ข้อมูลของคุณ</h2>
            <p className="text-slate-600">เราใช้ข้อมูลที่รวบรวมเพื่อ:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>ตอบกลับข้อซักถามและให้บริการสนับสนุนลูกค้า</li>
              <li>วิเคราะห์การใช้งานเว็บไซต์เพื่อนำมาพัฒนาเนื้อหาและปรับปรุงประสิทธิภาพของเว็บไซต์</li>
              <li>ป้องกันกิจกรรมที่ผิดกฎหมายหรือละเมิดเงื่อนไขของบริษัท</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8">3. การเปิดเผยข้อมูล</h2>
            <p className="text-slate-600 leading-relaxed">
              เราจะไม่ขาย ให้เช่า หรือเปิดเผยข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สามเพื่อวัตถุประสงค์ทางการค้า เว้นแต่จะได้รับความยินยอมจากคุณ หรือเป็นการปฏิบัติตามที่กฎหมายกำหนด
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">4. การรักษาความปลอดภัยของข้อมูล</h2>
            <p className="text-slate-600 leading-relaxed">
              เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสม เพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง การใช้งาน หรือการเปิดเผยที่ไม่ได้รับอนุญาต
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">5. การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว</h2>
            <p className="text-slate-600 leading-relaxed">
              เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว การเปลี่ยนแปลงใดๆ จะถูกโพสต์ลงบนหน้านี้ พร้อมระบุวันที่แก้ไขล่าสุด
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">6. ติดต่อเรา</h2>
            <p className="text-slate-600 leading-relaxed">หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราได้ที่:</p>
            <ul className="list-none text-slate-600 space-y-1">
              <li><strong>อีเมล:</strong> contact@winfic.com</li>
              <li><strong>โทรศัพท์:</strong> +66 2726 6732</li>
              <li><strong>ที่อยู่:</strong> 9 ซอยเฉลิมพระเกียรติ ร.9 ซอย 48 แยก 15 แขวงดอกไม้ เขตประเวศ กรุงเทพมหานคร 10250</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b pb-4">Privacy Policy</h1>
            <p className="text-slate-600 leading-relaxed">
              Winfood Industry Corporation Co., Ltd. ("Company," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">1. Information We Collect</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong className="text-slate-700">Information you provide:</strong> We may collect personal information such as your name, email address, and phone number when you contact us directly.</li>
              <li><strong className="text-slate-700">Automatically collected information:</strong> We may use cookies and similar tracking technologies to collect information about your interactions with our website, including your IP address, browser type, and pages visited, to improve user experience.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8">2. How We Use Your Information</h2>
            <p className="text-slate-600">We use the collected information to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Respond to your inquiries and provide customer support.</li>
              <li>Analyze website traffic and improve our website's functionality and content.</li>
              <li>Prevent fraudulent activities and maintain website security.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8">3. Data Sharing and Disclosure</h2>
            <p className="text-slate-600 leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties for commercial purposes. We may disclose information only if required by law or to protect our legal rights.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">5. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-8">6. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-none text-slate-600 space-y-1">
              <li><strong>Email:</strong> contact@winfic.com</li>
              <li><strong>Phone:</strong> +66 2726 6732</li>
              <li><strong>Address:</strong> 9 Chalermprakiat Rama 9 Road Soi 48 Yak 15, Dokmai Prawet, Bangkok Thailand 10250</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}