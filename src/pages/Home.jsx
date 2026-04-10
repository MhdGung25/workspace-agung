import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12 w-full">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-[#f58220] uppercase bg-orange-50 rounded-full border border-orange-100">
          Informatics Student Tools
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight max-w-3xl">
          Atur Kuliah Jadi <span className="text-[#7b2cbf]">Lebih Mudah</span> & Terstruktur 🎓
        </h2>
        
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Platform khusus mahasiswa IWU untuk menyimpan catatan materi dan daftar tugas di satu tempat. 
          Tetap produktif meski tanpa koneksi internet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => navigate('/notes')}
            className="bg-[#7b2cbf] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#6a1b9a] transition-all shadow-xl shadow-purple-200 active:scale-95"
          >
            Mulai Mencatat
          </button>
          <button 
            onClick={() => navigate('/todos')}
            className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-[#f58220] hover:text-[#f58220] transition-all active:scale-95"
          >
            Lihat Daftar Tugas
          </button>
        </div>
      </section>

      {/* FEATURES SECTION (GRID) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-6 pb-20">
        {/* Fitur 1 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-[#7b2cbf] mb-6 group-hover:bg-[#7b2cbf] group-hover:text-white transition-all">
            <span className="text-2xl font-bold">📝</span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Smart Notes</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Simpan materi kuliah dengan format yang rapi dan mudah dicari saat masuk musim ujian.
          </p>
        </div>

        {/* Fitur 2 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#f58220] mb-6 group-hover:bg-[#f58220] group-hover:text-white transition-all">
            <span className="text-2xl font-bold">✅</span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Task Manager</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Pantau deadline tugas kuliah agar tidak ada yang terlewat. Dilengkapi status pengerjaan.
          </p>
        </div>

        {/* Fitur 3 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <span className="text-2xl font-bold">🌐</span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Offline Mode</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tetap bisa mencatat materi di dalam kelas meskipun sinyal kampus sedang tidak stabil.
          </p>
        </div>
      </section>
    </div>
  );
}