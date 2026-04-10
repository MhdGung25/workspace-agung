import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Install ini: npm install @google/generative-ai
import { 
  collection, addDoc, query, onSnapshot, orderBy, 
  doc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.AIzaSyASUZ06F6hI2VyAYpqrvSIIkdN6DryBAZ0);

export default function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(null); // State loading ringkasan

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // FITUR: Voice Typing (Speech to Text)
  const handleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser tidak mendukung suara.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      setContent((prev) => prev + " " + event.results[0][0].transcript);
    };
    recognition.start();
  };

  // FITUR UTAMA: Ringkasan Materi via Gemini AI
  const summarizeAI = async (id, text) => {
    if (!text || text.length < 20) {
      alert("Materi terlalu pendek untuk diringkas!");
      return;
    }

    try {
      setIsSummarizing(id);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Tolong ringkas materi perkuliahan berikut menjadi poin-poin singkat dan jelas dalam Bahasa Indonesia: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summaryText = response.text();
      
      alert(`✨ RINGKASAN AI:\n\n${summaryText}`);
    } catch (error) {
      console.error("Gagal meringkas:", error);
      alert("Waduh, AI-nya lagi sibuk. Coba lagi nanti!");
    } finally {
      setIsSummarizing(null);
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Jangan dikosongkan ya!");
      return;
    }
    await addDoc(collection(db, 'notes'), {
      title,
      content,
      createdAt: serverTimestamp(),
    });
    setTitle('');
    setContent('');
  };

  const deleteNote = async (id) => {
    if (window.confirm('Hapus materi ini?')) await deleteDoc(doc(db, 'notes', id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Input */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-[#f58220] sticky top-24">
            <h2 className="text-xl font-bold text-gray-800">Materi Baru</h2>
            <form onSubmit={saveNote} className="space-y-4 mt-4">
              <input 
                type="text" placeholder="Matakuliah..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#7b2cbf] outline-none"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
              <div className="relative">
                <textarea 
                  placeholder="Bicara atau ketik di sini..." rows="8"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#7b2cbf] outline-none resize-none"
                  value={content} onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <button 
                  type="button" onClick={handleVoiceTyping}
                  className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#f58220]'} text-white`}
                >
                  {isListening ? '🛑' : '🎤'}
                </button>
              </div>
              <button className="w-full bg-[#7b2cbf] text-white py-4 rounded-2xl font-bold hover:bg-[#6a1b9a] transition-all">
                Simpan Catatan
              </button>
            </form>
          </div>
        </div>

        {/* List Catatan */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-gray-800">Arsip Materi</h2>
          <div className="grid gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-[#7b2cbf] rounded-xl flex items-center justify-center font-bold">
                      {note.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{note.title}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {note.createdAt?.toDate().toLocaleDateString('id-ID')}
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
                      {isSummarizing === note.id ? 'Memproses...' : '✨ Ringkas AI'}
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="text-gray-300 hover:text-red-500">✕</button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-gray-600 text-sm italic">"{note.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}