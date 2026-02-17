// src/context/LanguageContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // ค่าเริ่มต้นเป็น 'en' (อังกฤษ)
  const [lang, setLang] = useState("en");

  // โหลดภาษาที่เคยเลือกไว้ (ถ้ามี) เมื่อเปิดเว็บ
  useEffect(() => {
    const savedLang = localStorage.getItem("winfood-lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // ฟังก์ชันสลับภาษา
  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("winfood-lang", newLang);
  };

  // ดึงคำแปลตามภาษาปัจจุบัน (t = translation)
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);