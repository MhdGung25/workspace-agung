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
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // A. Monitor Koneksi
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // B. Real-time Data (Firestore Offline Capability aktif)
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.warn("Firestore Mode Offline.")
    );

    // C. Setup Mic (Hanya jalan jika browser mendukung)
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
    if (!isOnline) return alert("❌ Fitur suara butuh koneksi internet!");
    if (!recognitionRef.current) return alert("Browser tidak mendukung fitur suara.");

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();

    // --- VALIDASI WAJIB ISI ---
    if (!title.trim()) {
      alert("⚠️ Nama Matakuliah wajib diisi!");
      return;
    }
    if (!content.trim()) {
      alert("⚠️ Isi catatan tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      // Data tetap masuk ke cache lokal jika offline, dan auto-sync saat online
      await addDoc(collection(db, 'notes'), {
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp()
      });
      
      // Reset Form
      setTitle('');
      setContent('');
      if (isListening) recognitionRef.current.stop();

    } catch (err) {
      console.error("Error Simpan:", err);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const summarizeAI = async (id, text) => {
    if (!isOnline) return alert("❌ AI Ringkasan butuh internet!");
    try {
      setIsSummarizing(id);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Ringkas materi kuliah ini dalam poin-poin singkat: ${text}`);
      const response = await result.response;
      alert(`✨ RINGKASAN AI:\n\n${response.text()}`);
    } catch (e) {
      alert("Gagal memproses AI. Coba lagi nanti.");
    } finally {
      setIsSummarizing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans min-h-screen bg-gray-50">
      
      {/* Banner Offline yang Jelas */}
      {!isOnline && (
        <div className="bg-red-600 text-white p-3 rounded-2xl mb-6 text-center font-bold shadow-lg animate-pulse">
          🔌 OFFLINE MODE: Catatan disimpan di HP & sinkron otomatis saat internet nyala.
        </div>
      )}

      {/* Box Input */}
      <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-b-8 border-purple-600 mb-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-black text-gray-800">Catat Materi</h2>
        </div>

        <form onSubmit={saveNote} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-500 ml-2">MATAKULIAH *</label>
            <input 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all font-bold"
              placeholder="Contoh: Pemrograman Web" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 ml-2">ISI CATATAN *</label>
            <div className="relative">
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all h-44 resize-none font-medium leading-relaxed"
                placeholder="Ketik atau gunakan mic..." 
                value={content} 
                onChange={e => setContent(e.target.value)}
              />
              <button 
                type="button" 
                onClick={toggleMic}
                className={`absolute bottom-4 right-4 p-4 rounded-full text-white shadow-xl transition-all active:scale-90 ${
                  isListening ? 'bg-red-500 animate-bounce ring-4 ring-red-100' : 'bg-[#f58220] hover:scale-105'
                }`}
              >
                {isListening ? '🛑' : '🎤'}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all active:translate-y-1 ${
              loading ? 'bg-gray-400' : 'bg-[#7b2cbf] hover:bg-[#6a1b9a]'
            }`}
          >
            {loading ? 'MENYIMPAN...' : 'SIMPAN CATATAN'}
          </button>
        </form>
      </div>

      {/* List Arsip */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-2">
          <span>📚</span> Arsip Materi
        </h2>
        
        {notes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-medium italic">Belum ada catatan materi.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-6 rounded-[2rem] shadow-md border border-gray-100 hover:shadow-xl transition-all border-l-8 border-l-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-xl text-purple-700 uppercase tracking-tight">{note.title}</h3>
                  <p className="text-[10px] font-bold text-gray-400">
                    {note.createdAt?.toDate().toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => summarizeAI(note.id, note.content)}
                    disabled={isSummarizing === note.id}
                    className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-orange-600 hover:text-white transition-all"
                  >
                    {isSummarizing === note.id ? '...' : '✨ RINGKAS'}
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Hapus?')) deleteDoc(doc(db, 'notes', note.id)) }} 
                    className="text-gray-300 hover:text-red-500 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
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