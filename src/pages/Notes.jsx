import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  collection, addDoc, query, onSnapshot, orderBy, 
  doc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';

// Inisialisasi Gemini AI menggunakan Environment Variable
const genAI = new GoogleGenerativeAI(import.meta.env.VAIzaSyAnQNcoC9nLET4qC0zJvEdggsJa3_nfz74);

export default function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data dari Firestore secara Real-time
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. FITUR: Voice Typing (Speech to Text)
  const handleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser kamu tidak mendukung fitur suara. Gunakan Chrome atau Safari terbaru.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Mic Error:", event.error);
      if (event.error === 'not-allowed') alert("Izin Mic ditolak!");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // 3. FITUR UTAMA: Ringkasan Materi via Gemini AI
  const summarizeAI = async (id, text) => {
    if (!text || text.length < 20) {
      alert("Materi terlalu pendek untuk diringkas!");
      return;
    }

    try {
      setIsSummarizing(id);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Tolong ringkas materi perkuliahan berikut menjadi poin-poin singkat, padat, dan jelas dalam Bahasa Indonesia: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summaryText = response.text();
      
      alert(`✨ RINGKASAN AI:\n\n${summaryText}`);
    } catch (error) {
      console.error("Gagal meringkas:", error);
      alert("Waduh, AI-nya lagi sibuk atau API Key salah. Coba lagi nanti!");
    } finally {
      setIsSummarizing(null);
    }
  };

  // 4. Simpan Catatan ke Firebase
  const saveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Matakuliah dan isi catatan tidak boleh kosong!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'notes'), {
        title: title,
        content: content,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
    } catch (err) {
      console.error("Gagal simpan:", err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Hapus Catatan
  const deleteNote = async (id) => {
    if (window.confirm('Hapus materi ini secara permanen?')) {
      await deleteDoc(doc(db, 'notes', id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Input (Sticky agar tidak hilang saat scroll) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-[#f58220] lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-800">Materi Baru</h2>
            <form onSubmit={saveNote} className="space-y-4 mt-4">
              <input 
                type="text" placeholder="Matakuliah..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#7b2cbf] outline-none font-semibold"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
              <div className="relative">
                <textarea 
                  placeholder="Bicara atau ketik catatan di sini..." rows="8"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#7b2cbf] outline-none resize-none font-medium"
                  value={content} onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button 
                  type="button" onClick={handleVoiceTyping}
                  className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#f58220] hover:scale-110'} text-white`}
                >
                  {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  )}
                </button>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-[#7b2cbf] text-white py-4 rounded-2xl font-bold hover:bg-[#6a1b9a] transition-all disabled:bg-gray-300"
              >
                {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </form>
          </div>
        </div>

        {/* List Catatan (Arsip) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-gray-800">Arsip Materi</h2>
          <div className="grid gap-4">
            {notes.length === 0 ? (
              <p className="text-gray-400 italic">Belum ada catatan tersimpan.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-[#7b2cbf] rounded-xl flex items-center justify-center font-extrabold">
                        {note.title ? note.title.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{note.title}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {note.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => summarizeAI(note.id, note.content)}
                        disabled={isSummarizing === note.id}
                        className={`p-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          isSummarizing === note.id 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-orange-50 text-[#f58220] hover:bg-[#f58220] hover:text-white'
                        }`}
                      >
                        {isSummarizing === note.id ? '⌛ Memproses...' : '✨ Ringkas AI'}
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">✕</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-50">
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}