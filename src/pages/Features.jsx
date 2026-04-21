import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex flex-col items-center py-16 md:py-24 px-6">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-16 md:mb-24 animate-fadeIn">
        <div className="inline-block px-5 py-2 mb-6 text-[10px] md:text-xs font-bold tracking-widest text-[#7b2cbf] uppercase bg-purple-50 rounded-full border border-purple-100 shadow-sm">
          Eksklusif Mahasiswa Informatika IWU
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          Fitur Unggulan Kami 🚀
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          Solusi cerdas yang dirancang untuk membantu mahasiswa mengelola tugas dan catatan perkuliahan dengan lebih terstruktur.
        </p>
      </div>

      {/* GRID FEATURES - Responsif: 1 Kolom (HP), 3 Kolom (Laptop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Fitur 1: Catatan Pintar */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group text-center transform hover:-translate-y-3">
          <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-[#7b2cbf] mb-8 mx-auto group-hover:bg-[#7b2cbf] group-hover:text-white transition-all duration-500 shadow-inner">
            <span className="text-4xl">📝</span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Catatan Pintar</h4>
          <p className="text-gray-500 leading-relaxed text-base md:text-lg">
            Simpan materi kuliah dengan format yang cepat dan mudah dicari. Gunakan sistem kategori mata kuliah untuk persiapan ujian yang lebih efektif.
          </p>
        </div>

        {/* Fitur 2: Pengelola Tugas */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group text-center transform hover:-translate-y-3">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-[#f58220] mb-8 mx-auto group-hover:bg-[#f58220] group-hover:text-white transition-all duration-500 shadow-inner">
            <span className="text-4xl">✅</span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Pengelola Tugas</h4>
          <p className="text-gray-500 leading-relaxed text-base md:text-lg">
            Pantau batas waktu (deadline) tugas kuliah agar tidak ada yang terlewat. Pantau status pengerjaan secara real-time.
          </p>
        </div>

        {/* Fitur 3: Mode Offline */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group text-center transform hover:-translate-y-3">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-8 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
            <span className="text-4xl">🌐</span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Mode Offline</h4>
          <p className="text-gray-500 leading-relaxed text-base md:text-lg">
            Tetap produktif meski sinyal kampus sedang tidak stabil. Data akan otomatis tersinkronisasi saat perangkat Anda terhubung kembali ke internet.
          </p>
        </div>
      </div>

      {/* NAVIGATION BACK SECTION */}
      <div className="mt-20 text-center">
        <p className="text-gray-400 mb-8 font-medium italic text-sm md:text-base">
          "ekosistem belajar Mahasiswa IWU"
        </p>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#7b2cbf] font-black text-xl hover:gap-4 transition-all duration-300 mx-auto group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Kembali ke Beranda
        </button>
      </div>

    </div>
  );
}