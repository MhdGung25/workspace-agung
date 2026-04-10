import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 px-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Branding Sederhana */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-black text-[#7b2cbf] tracking-tighter">
            MY<span className="text-[#f58220]">KAMPUS-IWU</span>
          </h3>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-1">
            Task & Notes Manager
          </p>
        </div>

        {/* Info Dev & Sistem */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <p className="text-sm font-bold text-gray-700">
            Muhammad Agung Pamungkas
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] bg-purple-50 text-[#7b2cbf] px-2 py-0.5 rounded-full font-bold">
              IF 2023
            </span>
          </div>
        </div>

      </div>

      {/* Copyright Kecil di Bawah */}
      <div className="text-center mt-6 text-[9px] text-gray-300 uppercase tracking-[0.3em]">
        © 2026 • Made for Agung • All Rights Reserved
      </div>
    </footer>
  );
}