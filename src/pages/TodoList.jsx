import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'tugas'), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white rounded-[2rem] shadow-2xl border-t-8 border-[#f58220] overflow-hidden">
        
        {/* Header & Tombol Navigasi */}
        <div className="p-8 bg-gradient-to-br from-white to-orange-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Informatics Tasks</h2>
              <p className="text-gray-500 font-medium">Daftar deadline tugas aktif kamu.</p>
            </div>
          </div>
          <Link to="/add-task">
  <button className="bg-[#7b2cbf] hover:bg-[#6a1b9a] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2">
    <span className="text-xl">+</span> TAMBAH TUGAS BARU
  </button>
</Link>
        </div>

        <div className="p-8">
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200 text-gray-400">
                <p className="text-xl font-bold italic">Santai dulu... belum ada tugas nih! 😎</p>
              </div>
            ) : (
              tasks.map((item) => {
                const statusDeadline = getDeadlineStatus(item.dueDate);
                return (
                  <div key={item.id} className={`flex flex-col md:flex-row md:items-center p-6 rounded-3xl border-2 transition-all hover:shadow-md ${item.status === 'done' ? 'bg-gray-50 border-transparent opacity-75' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-5 flex-1">
                      <input 
                        type="checkbox" 
                        checked={item.status === 'done'}
                        onChange={() => toggleComplete(item.id, item.status)}
                        className="w-7 h-7 rounded-xl border-2 border-gray-300 text-[#7b2cbf] focus:ring-[#7b2cbf] cursor-pointer"
                      />
                      <div className="flex flex-col text-left">
                        <span className={`text-xl font-black ${item.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.text}
                        </span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-semibold">
                          <span className="text-sm text-[#f58220]">📚 {item.subject}</span>
                          <span className="text-sm text-gray-500">👨‍🏫 {item.lecturer}</span>
                          <span className="text-sm text-gray-400">📅 {new Date(item.dueDate).toLocaleDateString('id-ID', { weekday:'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {item.status !== 'done' && statusDeadline && (
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${statusDeadline.color}`}>
                              {statusDeadline.label}
                            </span>
                          )}
                          {item.status === 'done' && (
                            <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 rounded-full">✓ SELESAI</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(item.id)} className="mt-4 md:mt-0 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-end md:self-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}