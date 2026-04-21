import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Notes from './pages/Notes';
import TodoList from './pages/TodoList';
import AddTask from './pages/AddTask';
import Login from './pages/Login';
import Register from './pages/Register';
import Features from './pages/Features';

// --- KOMPONEN PELINDUNG (PROTECTED ROUTE) ---
// Hanya mengizinkan akses jika user sudah login
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek status login saat aplikasi pertama kali dimuat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Tampilan loading sementara Firebase mengecek sesi login
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#f8f9fd]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#7b2cbf] mb-4"></div>
        <p className="font-bold text-[#7b2cbf]">Memuat Akun...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
        
        {/* Navbar akan menyesuaikan tampilannya berdasarkan state 'user' */}
        <Navbar user={user} />

        {/* Main Content Area */}
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <Routes>
            {/* Publik: Bisa diakses siapa saja */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/features" element={<Features />} />

            {/* Terproteksi: Hanya muncul & bisa diakses jika sudah login */}
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute user={user}>
                  <Notes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/todos" 
              element={
                <ProtectedRoute user={user}>
                  <TodoList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-task" 
              element={
                <ProtectedRoute user={user}>
                  <AddTask />
                </ProtectedRoute>
              } 
            />

            {/* Jalur cadangan jika user nyasar atau belum login tapi maksa akses via URL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer tetap di bawah meskipun konten sedikit */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;