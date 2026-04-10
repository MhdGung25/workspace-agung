import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoIWU from '../assets/logo-iwu.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Fungsi untuk mengecek halaman aktif agar menu menyala
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b-4 border-[#f58220] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO & BRANDING */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={LogoIWU} 
              alt="Logo IWU" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col">
              <h1 className="font-bold text-xl text-[#7b2cbf] leading-tight">
                Kampus-IWU Docs
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">
                Informatics Student Hub
              </p>
            </div>
          </Link>

          {/* DESKTOP MENU (Muncul di Laptop) */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive('/') ? 'text-[#7b2cbf] bg-purple-50' : 'text-gray-600 hover:text-[#7b2cbf] hover:bg-gray-50'
              }`}
            >
              HOME
            </Link>
            <Link 
              to="/notes" 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive('/notes') ? 'text-[#7b2cbf] bg-purple-50' : 'text-gray-600 hover:text-[#7b2cbf] hover:bg-gray-50'
              }`}
            >
              CATATAN
            </Link>
            <Link 
              to="/todos" 
              className="ml-2 bg-[#7b2cbf] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#6a1b9a] transition-all shadow-lg hover:shadow-purple-200 active:scale-95"
            >
              LIST TUGAS
            </Link>
          </div>

          {/* MOBILE HAMBURGER BUTTON (Muncul di HP) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#7b2cbf] p-2 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-2 space-y-2 animate-fadeIn">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-gray-700 bg-gray-50"
            >
              🏠 Home
            </Link>
            <Link 
              to="/notes" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-gray-700 bg-gray-50"
            >
              📝 Catatan Kuliah
            </Link>
            <Link 
              to="/todos" 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-white bg-[#7b2cbf] shadow-md"
            >
              ✅ Daftar Tugas
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}