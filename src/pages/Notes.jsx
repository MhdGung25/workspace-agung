import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, addDoc, query, onSnapshot, orderBy, 
  where, serverTimestamp, doc, deleteDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Menampilkan data real-time milik akun muhammadagung2003
    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribeNotes = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribeNotes();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return alert("Silahkan login!");
    if (!title.trim() || !content.trim()) return alert("Judul dan isi tidak boleh kosong!");
    
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp()
      });
      setTitle('');
      setContent('');
    } catch (err) {
      alert("Gagal simpan ke database baru.");
    }
  };

  // Fungsi untuk menghapus catatan
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try {
        await deleteDoc(doc(db, 'notes', id));
      } catch (err) {
        alert("Gagal menghapus catatan.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-purple-600 animate-pulse uppercase">
      Menyiapkan Database Baru...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-50 pb-20">
      {/* Form Input */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-10 border-b-[8px] border-purple-600">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
          <span>📚</span> Catat Materi Kuliah
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input 
            className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-500 transition-all" 
            placeholder="Judul Materi (Contoh: Basis Data)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-2xl h-40 outline-none border-2 border-transparent focus:border-purple-500 transition-all resize-none" 
            placeholder="Isi materi..." 
            value={content} 
            onChange={e => setContent(e.target.value)} 
          />
          <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95">
            SIMPAN KE AKUN BARU
          </button>
        </form>
      </div>

      {/* List Arsip */}
      <div className="space-y-6">
        <h3 className="text-xl font-black px-2 uppercase tracking-tight text-gray-700">
          ARSIP MATERI - <span className="text-purple-600">{user?.email}</span>
        </h3>
        
        {notes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-bold italic">
            Belum ada catatan di database baru.
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-6 rounded-[2rem] border-l-[12px] border-purple-500 shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="pr-10">
                  <h4 className="font-black text-xl text-purple-800 uppercase leading-tight">{note.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                    📅 {note.createdAt?.toDate().toLocaleString('id-ID')}
                  </p>
                </div>
                
                {/* Tombol Hapus */}
                <button 
                  onClick={() => handleDelete(note.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="Hapus Catatan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}