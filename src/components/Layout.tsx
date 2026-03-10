import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Heart, PlusCircle, User, Map, LogOut, Zap, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-transparent text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-50">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-200/20"></div>
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" onClick={closeMenu} className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
              <div className="bg-gradient-to-br from-orange-500 to-rose-500 p-2.5 rounded-2xl shadow-lg shadow-orange-200 group-hover:shadow-orange-300 transition-all duration-300">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">善行マップ</span>
                <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">GoodDeed Map</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all duration-200 group">
                <Map className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                お店を探す
              </Link>
              <Link to="/timeline" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-xl transition-all duration-200 group">
                <Zap className="w-4 h-4 group-hover:animate-bounce transition-transform" />
                タイムライン
              </Link>
              <Link to="/report" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all duration-200 group">
                <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                善行を投稿
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/mypage"
                    className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:shadow-orange-100 transition-all group"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">My Activity</span>
                      <span className="text-xs font-bold text-gray-900">{user.email?.split('@')[0]}</span>
                    </div>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-gray-900 rounded-2xl hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 active:scale-95">
                  <User className="w-4 h-4" />
                  ログイン
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-orange-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full animate-in slide-in-from-top-4 duration-300">
            <div className="mx-4 mt-2 p-6 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 space-y-6">
              <div className="grid gap-2">
                <MobileNavLink to="/" icon={<Map className="w-5 h-5" />} label="お店を探す" onClick={closeMenu} />
                <MobileNavLink to="/timeline" icon={<Zap className="w-5 h-5 text-amber-500" />} label="タイムライン" onClick={closeMenu} />
                <MobileNavLink to="/report" icon={<PlusCircle className="w-5 h-5 text-rose-500" />} label="善行を投稿" onClick={closeMenu} />
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                    <Link 
                      to="/mypage" 
                      onClick={closeMenu}
                      className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">Logged in as</span>
                        <span className="text-sm font-bold text-gray-900 truncate block">{user.email}</span>
                      </div>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 p-4 text-rose-600 font-bold hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <LogOut className="w-5 h-5" /> ログアウト
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    <User className="w-5 h-5" /> ログイン
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative mt-20 border-t border-gray-100 bg-white/50 backdrop-blur-sm pb-10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
              <Heart className="w-6 h-6 text-orange-600 fill-current" />
              <span className="text-lg font-black tracking-tighter text-gray-900">善行マップ</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              © 2026 GoodDeed Map. Crafted with ❤️
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-400">
              <a href="#" className="hover:text-orange-600 transition-colors">利用規約</a>
              <a href="#" className="hover:text-orange-600 transition-colors">プライバシー</a>
              <Link to="/admin" className="hover:text-gray-900 transition-colors border border-gray-200 px-3 py-1 rounded-lg">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavLink({ to, icon, label, onClick }: { to: string, icon: JSX.Element, label: string, onClick: () => void }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="flex items-center gap-4 p-4 text-gray-600 font-bold hover:text-orange-600 hover:bg-orange-50/50 rounded-2xl transition-all"
    >
      <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
        {icon}
      </div>
      {label}
    </Link>
  );
}
