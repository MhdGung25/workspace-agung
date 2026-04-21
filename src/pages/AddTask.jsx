import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Import auth juga
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddTask() {
  const navigate = useNavigate();

  const [task, setTask] = useState('');
  const [subject, setSubject] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 1. Pantau status login untuk mendapatkan UID user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pastikan user sudah login sebelum simpan
    if (!user) {
      alert("Anda harus login untuk menambah tugas!");
      return;
    }

    // Validasi input wajib
    if (!task.trim() || !deadline || !subject.trim()) {
      alert("Mohon isi semua kolom yang bertanda bintang (*)");
      return;
    }

    setLoading(true);
    try {
      // 2. Menambahkan data ke Firestore dengan userId
      await addDoc(collection(db, 'tugas'), {
        userId: user.uid, // SANGAT PENTING: Agar filter di TodoList.jsx bekerja
        text: task.trim(),
        subject: subject.trim(),
        lecturer: lecturer.trim() || 'Tidak disebutkan',
        dueDate: deadline,
        description: description.trim() || 'Tidak ada catatan tambahan',
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // Navigasi setelah data benar-benar tersimpan
      navigate('/todos'); 
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert("Gagal menyimpan tugas! Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-left min-h-screen bg-[#f8f9fd]">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-50">
        
        {/* Header Form */}
        <div className="mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 text-[10px] font-bold tracking-widest text-[#7b2cbf] uppercase bg-purple-50 rounded-full border border-purple-100">
            Manajemen Tugas Mahasiswa
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
            📝 Tambah Tugas Baru
          </h2>
          <p className="text-gray-500 font-medium mt-2">
            Catat detail tugasmu agar tidak terlewat saat deadline tiba.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Baris 1: Nama Tugas */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-2 uppercase tracking-wide">
              Nama Tugas <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7b2cbf] focus:bg-white outline-none transition-all font-bold text-lg placeholder:text-gray-300"
              placeholder="Contoh: Laporan Akhir Praktikum"
              value={task} 
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          {/* Baris 2: Matkul & Dosen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-2 uppercase tracking-wide">
                Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7b2cbf] focus:bg-white outline-none transition-all font-bold placeholder:text-gray-300"
                placeholder="Contoh: Kecerdasan Buatan"
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-2 uppercase tracking-wide">
                Nama Dosen
              </label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7b2cbf] focus:bg-white outline-none transition-all font-bold placeholder:text-gray-300"
                placeholder="Nama Pengampu"
                value={lecturer} 
                onChange={(e) => setLecturer(e.target.value)}
              />
            </div>
          </div>

          {/* Baris 3: Deadline */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-2 uppercase tracking-wide">
              Tenggat Waktu <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              required
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7b2cbf] focus:bg-white outline-none transition-all font-bold text-gray-600 cursor-pointer"
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Baris 4: Deskripsi Pengumpulan */}
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-2 uppercase tracking-wide">
              Deskripsi Pengumpulan
            </label>
            <textarea 
              rows="3"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#f58220] focus:bg-white outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300 resize-none"
              placeholder="Contoh: Dikumpulkan di Classroom dalam format PDF."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              type="button"
              className="flex-1 py-4 rounded-2xl font-black text-gray-400 border-2 border-gray-100 hover:bg-gray-50 hover:text-gray-600 transition-all uppercase tracking-widest text-sm"
              onClick={() => navigate('/todos')}
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] bg-[#7b2cbf] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#6a1b9a] transition-all shadow-xl shadow-purple-100 active:scale-95 disabled:bg-gray-300 uppercase tracking-tight"
            >
              {loading ? "Menyimpan..." : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}