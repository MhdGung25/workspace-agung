import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy, where, serverTimestamp } from 'firebase/firestore';
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

  if (loading) return <div className="text-center p-10 font-bold">Menyiapkan Database Baru...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl mb-10">
        <h2 className="text-2xl font-black uppercase mb-6">📚 Catat Materi Kuliah</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="Judul Materi" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full p-4 bg-gray-50 rounded-2xl h-40 outline-none" placeholder="Isi materi..." value={content} onChange={e => setContent(e.target.value)} />
          <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700">SIMPAN KE AKUN BARU</button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black px-2">ARSIP MATERI - {user?.email}</h3>
        {notes.map(note => (
          <div key={note.id} className="bg-white p-6 rounded-[2rem] border-l-[10px] border-purple-500 shadow-sm">
            <h4 className="font-black text-lg text-purple-700 uppercase">{note.title}</h4>
            <p className="text-gray-600 mt-2 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}