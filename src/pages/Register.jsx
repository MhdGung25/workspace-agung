import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState(''); // State baru untuk nama
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validasi Input
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    // 2. Proteksi Akun Utama (Muhammad Agung)
    if (email.toLowerCase() === 'muhammadgung2003@gmail.com') {
      setError("Email ini sudah terdaftar sebagai akun utama. Silakan langsung login.");
      return;
    }

    setLoading(true);
    try {
      // A. Buat user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // B. Update nama profil (DisplayName) otomatis dari input registrasi
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // C. Paksa Sign Out agar user harus login manual (untuk keamanan sinkronisasi data)
      await signOut(auth);

      setSuccess(`Akun untuk ${fullName} berhasil dibuat! Mengarahkan ke login...`);
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar. Gunakan email lain.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Format email tidak valid.");
      } else {
        setError("Gagal mendaftar. Periksa koneksi internet Anda.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fd] px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Buat Akun ✨</h2>
          <p className="text-gray-500 font-medium">Lengkapi data untuk mulai mengelola tugas.</p>
        </div>
        
        {/* Alerts */}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 flex items-center gap-2"><span>⚠️</span> {error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm mb-6 border border-green-100 flex items-center gap-2"><span>✅</span> {success}</div>}
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all font-semibold"
              placeholder="Masukkan nama asli"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
              placeholder="mahasiswa@iwu.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7b2cbf] text-xl"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Konfirmasi Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className={`w-full bg-[#f58220] text-white py-5 md:py-6 rounded-2xl font-black text-xl md:text-2xl shadow-2xl shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e6771a] hover:shadow-orange-200'
            }`}
          >
            {loading ? (
              <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 font-medium">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#7b2cbf] font-black hover:underline underline-offset-4">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}