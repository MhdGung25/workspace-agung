import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { 
  collection, query, onSnapshot, orderBy, 
  doc, deleteDoc, updateDoc, where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // 1. Pantau Status Auth (Memastikan login sebagai muhammadagung2003)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); 
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Ambil Data Real-time Khusus User Terkait
  useEffect(() => {
    // Jika belum login atau bukan user yang dimaksud, kosongkan list
    if (!user) {
      setTasks([]);
      return;
    }

    // QUERY UTAMA: Mengambil data koleksi 'tugas' milik user yang sedang login
    const q = query(
      collection(db, 'tugas'), 
      where('userId', '==', user.uid), // Filter ini yang memisahkan data asli vs dummy
      orderBy('createdAt', 'desc')     // Tugas terbaru muncul paling atas
    );

    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setTasks(data);
    }, (err) => {
      console.error("Firebase Error:", err);
      // Jika muncul error "index requires", klik link yang ada di console log browser
    });

    return () => unsubscribeTasks();
  }, [user]);

  // Statistik Berdasarkan Data Asli
  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const totalTasksCount = tasks.length;

  const toggleComplete = async (id, currentStatus) => {
    const taskRef = doc(db, 'tugas', id);
    await updateDoc(taskRef, {
      status: currentStatus === 'done' ? 'pending' : 'done'
    });
  };

  const deleteTask = async (id) => {
    if (window.confirm('Hapus tugas ini secara permanen dari database?')) {
      try {
        await deleteDoc(doc(db, 'tugas', id));
      } catch (err) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const getDeadlineStatus = (dateString) => {
    if (!dateString) return null;
    const now = new Date();
    const target = new Date(dateString);
    const diffInMs = target - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return { label: 'TERLEWAT', color: 'bg-gray-200 text-gray-600' };
    if (diffInDays === 0) return { label: 'HARI INI!', color: 'bg-red-500 text-white animate-bounce' };
    if (diffInDays === 1) return { label: 'BESOK (H-1)', color: 'bg-orange-500 text-white animate-pulse' };
    if (diffInDays <= 3) return { label: `MENDESAK (H-${diffInDays})`, color: 'bg-yellow-400 text-black' };
    return { label: `H-${diffInDays}`, color: 'bg-blue-100 text-blue-600' };
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-[#f58220] animate-pulse tracking-widest uppercase">
      Sinkronisasi Database Baru...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-3 md:px-4 mb-20">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-t-[8px] md:border-t-[12px] border-[#f58220] overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-10 bg-gradient-to-br from-white to-orange-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-orange-100 p-3 rounded-2xl text-3xl shadow-inner">💻</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">Informatics Tasks</h2>
              <p className="text-xs md:text-sm text-gray-500 font-bold italic">
                {user?.email === 'muhammadagung2003@gmail.com' 
                  ? "Akun Terverifikasi: " + user.email 
                  : "Silahkan list tugas yang ingin Anda kerjakan."}
              </p>
            </div>
          </div>
          <Link to="/add-task" className="w-full md:w-auto">
            <button className="w-full bg-[#7b2cbf] hover:bg-[#6a1b9a] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 uppercase text-sm tracking-widest">
              + Tambah Tugas
            </button>
          </Link>
        </div>

        {/* Task List Area */}
        <div className="p-4 md:p-10 bg-gray-50/30">
          <div className="grid gap-4 md:gap-6">
            {!user ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-bold text-gray-400 uppercase tracking-widest">
                Akses Dibatasi - Silahkan Login
              </div>
            ) : totalTasksCount === 0 ? (
              <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-300">
                <div className="text-5xl mb-4 opacity-50">📑</div>
                <p className="text-sm md:text-lg font-black italic uppercase tracking-widest px-6 text-center">
                   Database baru masih kosong. <br/> Input tugas pertamamu sekarang!
                </p>
              </div>
            ) : (
              tasks.map((item) => {
                const isDone = item.status === 'done';
                const statusDeadline = getDeadlineStatus(item.dueDate);
                const isExpanded = expandedId === item.id;
                
                return (
                  <div key={item.id} className={`group flex flex-col p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all hover:shadow-xl ${isDone ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-white shadow-sm hover:border-purple-100'}`}>
                    <div className="flex flex-row items-start md:items-center gap-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={isDone}
                          onChange={() => toggleComplete(item.id, item.status)}
                          className="w-7 h-7 rounded-lg border-2 border-gray-300 text-[#7b2cbf] cursor-pointer transition-all"
                        />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                          <span 
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className={`text-lg md:text-2xl font-black cursor-pointer leading-tight break-words ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}
                          >
                            {item.text}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {!isDone && statusDeadline && (
                              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusDeadline.color}`}>
                                {statusDeadline.label}
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[9px] font-black bg-green-500 text-white px-3 py-1 rounded-full uppercase">Selesai</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 font-black text-[10px] text-gray-500 uppercase tracking-wider">
                          <span className="bg-orange-50 text-[#f58220] px-3 py-1 rounded-lg">📚 {item.subject}</span>
                          <span className="bg-gray-100 px-3 py-1 rounded-lg text-gray-600">👨‍🏫 {item.lecturer}</span>
                          {item.dueDate && (
                            <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-lg">📅 {item.dueDate}</span>
                          )}
                        </div>

                        {/* Deskripsi Wajib (Selalu Tampil jika tugas belum selesai) */}
                        {(!isDone || isExpanded) && (
                          <div className="mt-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 text-sm text-gray-600 font-bold leading-relaxed">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Detail Deskripsi:</p>
                            <div className="whitespace-pre-wrap">{item.description}</div>
                          </div>
                        )}
                      </div>

                      <button onClick={() => deleteTask(item.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Statistik Footer */}
        <div className="bg-white p-6 border-t border-gray-100">
          <div className="flex justify-center items-center gap-6 text-[10px] font-black tracking-widest uppercase">
            <div className="flex items-center gap-2 text-orange-500">
              AKTIF: <span className="bg-orange-100 px-3 py-1 rounded-full">{activeTasksCount}</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              SELESAI: <span className="bg-green-100 px-3 py-1 rounded-full">{completedTasksCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}