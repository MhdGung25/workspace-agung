import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#f8f9fd] px-4 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center w-full max-w-5xl animate-fadeIn">
        
        {/* Badge Kampus - Responsif Text */}
        <div className="inline-block px-4 py-2 mb-8 text-[10px] md:text-xs font-bold tracking-widest text-[#f58220] uppercase bg-orange-50 rounded-full border border-orange-100 shadow-sm">
          Alat Bantu Mahasiswa Informatika
        </div>
        
        {/* Headline Utama - Ukuran teks adaptif untuk HP & Laptop */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-[1.2] tracking-tight">
          Atur Kuliah Jadi <span className="text-[#7b2cbf]">Lebih <br className="md:hidden" /> Mudah</span> & Terstruktur 🎓
        </h1>
        
        {/* Sub-headline */}
        <p className="text-gray-500 text-base md:text-xl lg:text-2xl max-w-3xl mb-12 leading-relaxed font-medium">
          Platform khusus pelajar IWU untuk menyimpan catatan materi dan daftar tugas di satu tempat. 
          Tetap produktif meski tanpa koneksi internet.
        </p>
        
        {/* BUTTON GROUP - Perbaikan Utama pada Bottom/Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
          {user ? (
            /* Tampilan Tombol Jika Sudah Login */
            <>
              <button 
                onClick={() => navigate('/notes')}
                className="w-full sm:w-60 bg-[#7b2cbf] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#6a1b9a] transition-all shadow-xl shadow-purple-200 active:scale-95"
              >
                Buka Catatan 📝
              </button>
              <button 
                onClick={() => navigate('/todos')}
                className="w-full sm:w-60 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-[#f58220] hover:text-[#f58220] transition-all active:scale-95"
              >
                Daftar Tugas ✅
              </button>
            </>
          ) : (
            /* Tampilan Tombol Jika Belum Login (Sesuai Referensi Gambar) */
            <>
              <>
  <button
    onClick={() => navigate('/login')}
    className="w-full sm:w-72 md:w-80 bg-[#7b2cbf] text-white px-12 py-5 rounded-full font-bold text-xl md:text-2xl hover:bg-[#6a1b9a] transition-all duration-300 shadow-2xl shadow-purple-300 active:scale-95"
  >
    Masuk Sekarang
  </button>

  <button
    onClick={() => navigate('/features')}
    className="w-full sm:w-72 md:w-80 bg-white text-gray-700 border-2 border-gray-200 px-12 py-5 rounded-full font-bold text-xl md:text-2xl hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
  >
    Pelajari Fitur ✨
  </button>
</>
            </>
          )}
        </div>
      </section>

      {/* FOOTER INFO RINGKAS */}
      <div className="mt-20 opacity-40 hidden md:block">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase italic">
          Informatics Student Project — IWU 2026
        </p>
      </div>
    </div>
  );
}