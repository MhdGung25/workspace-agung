import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi sederhana sebelum kirim ke Firebase
    if (!email || !password) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); 
    } catch (err) {
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fd] px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50">
        
        {/* Header Login */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-500 font-medium">
            Masuk ke akun <span className="text-[#7b2cbf] font-bold">IWU Docs</span> milikmu.
          </p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 flex items-center gap-3 border border-red-100 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Email
            </label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all text-gray-800 placeholder:text-gray-300"
              placeholder="contoh@iwu.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input dengan Toggle Lihat Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#7b2cbf] focus:ring-4 focus:ring-purple-50 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7b2cbf] transition-colors p-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
         <button
  disabled={loading}
  className={`w-full bg-[#7b2cbf] text-white py-5 md:py-6 rounded-2xl font-black text-xl md:text-2xl shadow-2xl shadow-purple-200 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 mt-8 ${
    loading
      ? 'opacity-70 cursor-not-allowed'
      : 'hover:bg-[#6a1b9a] hover:shadow-purple-300'
  }`}
>
  {loading ? (
    <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
  ) : (
    "Masuk ke Akun"
  )}
</button>
        </form>
        
        {/* Link ke Register */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#f58220] font-black hover:underline underline-offset-4">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}