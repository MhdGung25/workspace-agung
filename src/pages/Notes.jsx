import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  collection, addDoc, query, onSnapshot, orderBy, 
  doc, deleteDoc, serverTimestamp, where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 1. Pantau Status Login - Memastikan akun Agung tetap terhubung ke datanya
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Setup Speech Recognition (Id-ID)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setContent(prev => prev + (prev.length > 0 && !prev.endsWith(" ") ? " " : "") + transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      unsubscribeAuth();
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // 2. Ambil Data Spesifik Milik User (Muhammad Agung)
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    // Filter Maut: Memastikan data lama tidak hilang & tidak tertukar
    const q = query(
      collection(db, 'notes'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribeNotes = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Mode Offline: Menggunakan data cache.");
    });

    return () => unsubscribeNotes();
  }, [user]);

  const toggleMic = () => {
    if (!isOnline) return alert("❌ Fitur suara butuh koneksi internet!");
    if (!recognitionRef.current) return alert("Browser tidak mendukung Speech Recognition.");
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!user) return alert("Silahkan login!");
    if (!title.trim() || !content.trim()) return alert("⚠️ Isi semua kolom!");

    setSaving(true);
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.uid, // Data diikat ke akun Agung
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp()
      });
      setTitle('');
      setContent('');
    } catch (err) {
      alert("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const summarizeAI = async (id, text) => {
    if (!isOnline) return alert("❌ Butuh internet!");
    try {
      setIsSummarizing(id);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Ringkas materi kuliah berikut menjadi poin-poin singkat: ${text}`);
      const response = await result.response;
      alert(`✨ RINGKASAN AI:\n\n${response.text()}`);
    } catch (e) {
      alert("Gagal memproses AI.");
    } finally {
      setIsSummarizing(null);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-black text-purple-600 animate-pulse uppercase tracking-widest">
      Memuat Arsip Materi...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen bg-gray-50 pb-20">
      {!isOnline && (
        <div className="bg-red-600 text-white p-3 rounded-2xl mb-6 text-center font-bold animate-pulse text-sm">
          🔌 OFFLINE: Data akan disinkronkan otomatis nanti.
        </div>
      )}

      {/* Form Input */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-b-[10px] border-purple-600 mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-100 p-3 rounded-2xl text-2xl">📝</div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Catat Materi Kuliah</h2>
        </div>

        <form onSubmit={saveNote} className="space-y-6">
          <input 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all font-bold text-lg"
            placeholder="Mata Kuliah" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
          />
          <div className="relative">
            <textarea 
              className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all h-56 resize-none font-medium text-gray-700"
              placeholder="Isi materi..." 
              value={content} 
              onChange={e => setContent(e.target.value)}
            />
            <button type="button" onClick={toggleMic} className={`absolute bottom-6 right-6 p-5 rounded-full text-white shadow-2xl transition-all active:scale-90 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#f58220]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-3m-3-8.5V5a3 3 0 116 0v6.5a3 3 0 11-6 0z" />
              </svg>
            </button>
          </div>
          <button disabled={saving} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all ${saving ? 'bg-gray-300' : 'bg-[#7b2cbf] hover:bg-[#6a1b9a]'}`}>
            {saving ? 'MENYIMPAN...' : 'SIMPAN KE ARSIP'}
          </button>
        </form>
      </div>

      {/* List Arsip */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 px-2">
          <span className="bg-white p-2 rounded-xl shadow-sm">📚</span> Arsip Materi {user?.displayName ? `- ${user.displayName}` : ''}
        </h2>
        
        {notes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">Belum ada catatan materi kuliah untuk akun ini.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all border-l-[12px] border-l-purple-500 group mb-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-2xl text-purple-800 uppercase tracking-tight">{note.title}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                    📅 {note.createdAt?.toDate().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => summarizeAI(note.id, note.content)} disabled={isSummarizing === note.id} className="bg-orange-50 text-orange-600 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-[#f58220] hover:text-white transition-all shadow-sm">
                    {isSummarizing === note.id ? '...' : '✨ RINGKAS'}
                  </button>
                  <button onClick={() => { if(window.confirm('Hapus?')) deleteDoc(doc(db, 'notes', note.id)) }} className="text-gray-200 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-gray-700 font-medium whitespace-pre-wrap leading-relaxed text-lg">{note.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}