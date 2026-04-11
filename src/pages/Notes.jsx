import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  collection, addDoc, query, onSnapshot, orderBy, 
  doc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // A. Cek Status Internet secara Real-time
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // B. Ambil Data (Firestore otomatis pakai cache jika offline)
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.warn("Sedang offline: Menggunakan data lokal.")
    );

    // C. Setup Mic
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) setContent(prev => prev + (prev ? " " : "") + transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      unsubscribe();
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const toggleMic = () => {
    if (!isOnline) return alert("Mic butuh internet!");
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      // Akan tersimpan di HP dulu jika offline, lalu otomatis ke Cloud saat online
      await addDoc(collection(db, 'notes'), {
        title, content, createdAt: serverTimestamp()
      });
      setTitle(''); setContent('');
    } catch (err) {
      console.error("Gagal simpan:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      {/* Notifikasi Offline */}
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-lg mb-4 text-center font-bold text-sm">
          🔌 Kamu sedang offline. Catatan akan disimpan secara lokal.
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-purple-600 mb-8">
        <h2 className="text-xl font-bold mb-4">Materi Kuliah Baru</h2>
        <form onSubmit={saveNote} className="space-y-4">
          <input 
            className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-purple-500"
            placeholder="Mata Kuliah..." value={title} onChange={e => setTitle(e.target.value)}
          />
          <div className="relative">
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-purple-500 h-40"
              placeholder="Isi catatan..." value={content} onChange={e => setContent(e.target.value)}
            />
            <button 
              type="button" onClick={toggleMic}
              className={`absolute bottom-4 right-4 p-4 rounded-full text-white shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-orange-500 hover:scale-105'}`}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
          </div>
          <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all">
            SIMPAN CATATAN
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-black">Arsip Catatan</h2>
        {notes.map(note => (
          <div key={note.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-purple-700">{note.title}</h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{note.content}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => deleteDoc(doc(db, 'notes', note.id))} className="text-red-400 text-xs font-bold px-3 py-1 border border-red-100 rounded-lg">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}