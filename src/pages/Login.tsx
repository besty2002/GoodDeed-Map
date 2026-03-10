import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Heart, Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert('確認メールを送信しました。メールボックスを確認してください！');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '認証に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    try {
      setLoading(true);

      // Construct redirect URL
      let redirectTo = window.location.origin;
      if (window.location.hostname.includes('github.io')) {
        // Ensure subpath is included for GitHub Pages
        redirectTo = `${window.location.origin}/GoodDeed-Map/`;
      }

      console.log('Redirecting to:', redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google認証に失敗しました。');
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="text-center space-y-6 mb-10">
        <div className="inline-flex bg-gradient-to-br from-orange-500 to-rose-500 p-4 rounded-[2rem] shadow-xl shadow-orange-200">
          <Heart className="w-10 h-10 text-white fill-current" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            {isSignUp ? '新しく始める' : 'おかえりなさい'}
          </h1>
          <p className="text-gray-500 font-medium">
            善行マップへログインして、温かい世界を広げましょう。
          </p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">
            {error}
          </div>
        )}

        {/* Social Logins */}
        <div className="space-y-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border border-gray-200 text-gray-700 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.95] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Googleでログイン
          </button>
          
          <button 
            onClick={() => alert('Coming soon!')}
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-[0.95]"
          >
            <Github className="w-5 h-5" />
            GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-gray-300">Or use email</span></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <input 
              required
              type="email" 
              placeholder="example@mail.com"
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-gray-700 transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-gray-700 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-orange-600 hover:underline"
          >
            {isSignUp ? 'すでにアカウントをお持ちですか？ ログイン' : 'まだアカウントをお持ちでないですか？ 新規登録'}
          </button>
        </div>
      </div>
    </div>
  );
}
