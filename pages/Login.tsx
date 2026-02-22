
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, Mail, Lock, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { Role, User as AppUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: AppUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const userEmail = fbUser.email || '';

      // Only specific emails are allowed as admins (must match Firestore rules)
      let role: Role;
      if (userEmail === 'admin@njmakeup.com') {
        role = 'ADMIN_MASTER';
      } else if (userEmail === 'admin2@njmakeup.com') {
        role = 'ADMIN_FITTING';
      } else {
        await auth.signOut();
        setError('Akun ini tidak terdaftar sebagai admin.');
        return;
      }

      const appUser: AppUser = {
        id: fbUser.uid,
        name: role === 'ADMIN_MASTER' ? 'NIA JESSICA (Owner)' : 'Staff Fitting',
        email: userEmail,
        role
      };

      onLoginSuccess(appUser);
      navigate('/admin');
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Email atau Password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full -mr-48 -mt-48 opacity-[0.03] blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37] rounded-full -ml-48 -mb-48 opacity-[0.03] blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali ke Website</span>
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex p-3 bg-zinc-50 rounded-2xl border border-zinc-100 mb-6">
                <Sparkles className="text-[#D4AF37]" size={32} />
              </div>
              <h1 className="font-serif text-3xl text-zinc-900 mb-2">NJ Admin Portal</h1>
              <p className="text-zinc-500 text-sm">Silakan masuk untuk mengelola NJ Makeup</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-shake">
                <AlertCircle size={18} />
                <p className="font-medium text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-[#D4AF37]/20 focus:bg-white rounded-2xl focus:outline-none transition-all placeholder:text-zinc-300 text-sm" 
                    placeholder="admin@njmakeup.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    required 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent focus:border-[#D4AF37]/20 focus:bg-white rounded-2xl focus:outline-none transition-all placeholder:text-zinc-300 text-sm" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <LogIn size={20} />
                    Masuk Sekarang
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Secured by NJ Makeup Security System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Login;
