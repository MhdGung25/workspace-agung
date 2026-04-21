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

  // 1. Pantau Status Auth (Mengambil nama otomatis dari Firebase Auth)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); 
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Ambil Data Berdasarkan User yang Login
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    // Hanya mengambil data milik user yang sedang login (Privasi Terjamin)
    const q = query(
      collection(db, 'tugas'), 
      where('userId', '==', user.uid), 
      orderBy('dueDate', 'asc')
    );

    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    }, (err) => {
      console.error("Gagal mengambil data:", err);
    });

    return () => unsubscribeTasks();
  }, [user]);

  // Logika Statistik
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
    if (window.confirm('Hapus tugas ini dari daftar?')) {
      await deleteDoc(doc(db, 'tugas', id));
    }
  };

  const getDeadlineStatus = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diffInMs = target - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return { label: 'TERLEWAT', color: 'bg-gray-200 text-gray-600' };
    if (diffInDays === 0) return { label: 'HARI INI!', color: 'bg-red-500 text-white animate-bounce' };
    if (diffInDays === 1) return { label: 'BESOK (H-1)', color: 'bg-orange-500 text-white animate-pulse' };
    if (diffInDays <= 3) return { label: `MENDESAK (H-${diffInDays})`, color: 'bg-yellow-400 text-black' };
    return null;
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-[#f58220] animate-pulse tracking-widest uppercase">
      Memuat Daftar Tugas...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-3 md:px-4 mb-20">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-t-[8px] md:border-t-[12px] border-[#f58220] overflow-hidden">
        
        {/* Header - Sekarang Otomatis Menampilkan Nama Pendaftar */}
        <div className="p-6 md:p-10 bg-gradient-to-br from-white to-orange-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
            <div className="bg-orange-100 p-3 md:p-4 rounded-2xl md:rounded-3xl text-3xl md:text-4xl shadow-inner">🚀</div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">Informatics Tasks</h2>
              <p className="text-sm md:text-base text-gray-500 font-medium italic mt-1">
                {user ? (
                  <>
                    Halo <span className="text-[#f58220] font-bold">{user.displayName || 'Mahasiswa'}</span>, tetap semangat!
                  </>
                ) : (
                  'Silahkan login untuk mengelola tugas.'
                )}
              </p>
            </div>
          </div>
          <Link to="/add-task" className="w-full md:w-auto">
            <button className="w-full bg-[#7b2cbf] hover:bg-[#6a1b9a] text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 tracking-tight text-sm md:text-base">
              <span className="text-xl">+</span> TAMBAH TUGAS
            </button>
          </Link>
        </div>

        {/* Task List Area */}
        <div className="p-4 md:p-10 bg-gray-50/30">
          <div className="grid gap-4 md:gap-6">
            {!user ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                 <p className="text-gray-400 font-bold">Akses dibatasi. Silahkan login untuk melihat tugas Anda.</p>
              </div>
            ) : totalTasksCount === 0 ? (
              <div className="text-center py-16 md:py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-300">
                <div className="text-5xl md:text-6xl mb-4 opacity-50">☕</div>
                <p className="text-sm md:text-xl font-black italic uppercase tracking-widest px-4">
                   Belum ada tugas. Klik "Tambah Tugas" untuk memulai!
                </p>
              </div>
            ) : (
              tasks.map((item) => {
                const isDone = item.status === 'done';
                const statusDeadline = getDeadlineStatus(item.dueDate);
                
                return (
                  <div key={item.id} className={`group relative flex flex-col p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all hover:shadow-xl ${isDone ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-white shadow-sm hover:border-purple-200'}`}>
                    <div className="flex flex-row items-start md:items-center gap-4 md:gap-6">
                      <div className="flex items-center pt-1 md:pt-0">
                        <input 
                          type="checkbox" 
                          checked={isDone}
                          onChange={() => toggleComplete(item.id, item.status)}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border-2 border-gray-300 text-[#7b2cbf] focus:ring-[#7b2cbf] cursor-pointer transition-all"
                        />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                          <span className={`text-lg md:text-2xl font-black leading-tight break-words ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {item.text}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {!isDone && statusDeadline && (
                              <span className={`text-[9px] md:text-[10px] font-black px-2.5 py-0.5 md:py-1 rounded-full uppercase tracking-wider ${statusDeadline.color}`}>
                                {statusDeadline.label}
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[9px] md:text-[10px] font-black bg-green-500 text-white px-2.5 py-0.5 md:py-1 rounded-full uppercase">✓ SELESAI</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-x-5 gap-y-2 font-bold text-xs md:text-sm text-gray-600">
                          <span className="bg-orange-50 text-[#f58220] px-2 md:px-3 py-1 rounded-lg w-fit">📚 {item.subject || 'Mata Kuliah'}</span>
                          <span className="bg-gray-100 px-2 md:px-3 py-1 rounded-lg w-fit">👨‍🏫 {item.lecturer || 'Dosen'}</span>
                          <span className="py-1 uppercase text-[10px] md:text-xs text-gray-400">📅 DEADLINE: {item.dueDate}</span>
                        </div>
                      </div>

                      <button onClick={() => deleteTask(item.id)} className="p-3 text-gray-200 hover:text-red-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Statistik */}
        <div className="bg-white p-6 text-center border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 text-[11px] md:text-xs font-black tracking-widest uppercase text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">TUGAS AKTIF:</span>
              <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full min-w-[40px] shadow-sm">{activeTasksCount}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">BERES:</span>
              <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full min-w-[40px] shadow-sm">{completedTasksCount}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">TOTAL:</span>
              <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full min-w-[40px] shadow-sm">{totalTasksCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}