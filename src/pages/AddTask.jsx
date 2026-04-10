import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function AddTask() {
  const navigate = useNavigate();
  
  const [task, setTask] = useState('');
  const [subject, setSubject] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!task.trim() || !deadline || !subject.trim()) return;

  setLoading(true);
  try {
    // Menunggu Firestore mengonfirmasi data diterima
    await addDoc(collection(db, 'tugas'), {
      text: task,
      subject: subject,
      lecturer: lecturer || 'Tidak disebutkan',
      dueDate: deadline,
      createdAt: serverTimestamp(),
      status: 'pending'
    });

    // Pindah halaman hanya jika simpan BERHASIL
    navigate('/todos'); 
  } catch (error) {
    console.error("Gagal simpan:", error);
    alert("Gagal menyimpan data ke Firestore!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-left">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-800 uppercase">📝 Tambah Tugas</h2>
          <p className="text-gray-500 font-medium italic">Input tugas baru agar terpantau di Todo List.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-2 italic">Nama Tugas *</label>
            <input 
              type="text" required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#f58220] focus:bg-white outline-none transition-all font-semibold"
              placeholder="Contoh: Membuat Laporan Praktikum"
              value={task} onChange={(e) => setTask(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2 italic">Mata Kuliah *</label>
              <input 
                type="text" required
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#f58220] focus:bg-white outline-none transition-all font-semibold"
                placeholder="Contoh: Pemrograman Web"
                value={subject} onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2 italic">Nama Dosen</label>
              <input 
                type="text"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#f58220] focus:bg-white outline-none transition-all font-semibold"
                placeholder="Nama Pengampu"
                value={lecturer} onChange={(e) => setLecturer(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-2 italic">Tenggat waktu *</label>
            <input 
              type="date" required
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#f58220] focus:bg-white outline-none transition-all font-semibold text-gray-600"
              value={deadline} onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              className="flex-1 py-4 rounded-2xl font-bold text-gray-400 border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase"
              onClick={() => navigate('/todos')}
            >
              BATAL
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#7b2cbf] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#6a1b9a] transition-all shadow-lg active:scale-95 disabled:bg-gray-300 uppercase"
            >
              {loading ? 'MENYIMPAN...' : 'SIMPAN TUGAS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}