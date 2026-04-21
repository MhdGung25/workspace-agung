import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Silahkan login dengan muhammadagung2003@gmail.com!");
    
    // Validasi: Nama Tugas, Mata Kuliah, dan Deskripsi sekarang wajib diisi
    if (!task.trim() || !subject.trim() || !description.trim()) {
      alert("Mohon isi kolom Nama Tugas, Mata Kuliah, dan Deskripsi!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tugas'), {
        userId: user.uid,
        text: task.trim(),
        subject: subject.trim(),
        lecturer: lecturer.trim() || 'Tidak disebutkan',
        // Deadline opsional: jika kosong diisi string kosong atau null
        dueDate: deadline || '', 
        description: description.trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      navigate('/todos'); 
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert("Gagal menyimpan ke database baru!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-screen bg-[#f8f9fd]">
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-50">
        <h2 className="text-3xl font-black text-gray-900 uppercase mb-8">📝 Tambah Tugas Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Tugas (Wajib) */}
          <div>
            <label className="block text-sm font-black text-gray-700 uppercase mb-2">Nama Tugas *</label>
            <input 
              type="text" 
              required 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:border-purple-500 border-2 border-transparent font-bold" 
              value={task} 
              onChange={(e) => setTask(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mata Kuliah (Wajib) */}
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase mb-2">Mata Kuliah *</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:border-purple-500 border-2 border-transparent font-bold" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
              />
            </div>
            {/* Nama Dosen (Opsional) */}
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase mb-2">Nama Dosen (Opsional)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:border-purple-500 border-2 border-transparent font-bold" 
                value={lecturer} 
                onChange={(e) => setLecturer(e.target.value)} 
              />
            </div>
          </div>

          {/* Tenggat Waktu (Sekarang Opsional) */}
          <div>
            <label className="block text-sm font-black text-gray-700 uppercase mb-2">Tenggat Waktu (Opsional)</label>
            <input 
              type="date" 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:border-purple-500 border-2 border-transparent font-bold" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
          </div>

          {/* Deskripsi (Sekarang Wajib) */}
          <div>
            <label className="block text-sm font-black text-gray-700 uppercase mb-2">Deskripsi *</label>
            <textarea 
              rows="3" 
              required
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:border-orange-500 border-2 border-transparent font-medium" 
              placeholder="Jelaskan detail tugas di sini..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading} 
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${loading ? 'bg-gray-300' : 'bg-[#7b2cbf] hover:bg-[#6a1b9a] text-white active:scale-95'}`}
          >
            {loading ? "SEDANG MENYIMPAN..." : "SIMPAN TUGAS"}
          </button>
        </form>
      </div>
    </div>
  );
}