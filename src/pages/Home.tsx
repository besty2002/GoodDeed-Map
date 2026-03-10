import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, FilterX, ArrowRight, Sparkles, Loader2, Heart, LayoutGrid, Map as MapIcon, Gift, Trophy, Medal } from 'lucide-react';
import { storeService } from '../services/storeService';
import StoreMap from '../components/StoreMap';
import type { Store, Region, Category, DeedType } from '../types';

const REGIONS: Region[] = ['東京都', '大阪府', '神奈川県', '愛知県', '福岡県', '北海道', 'その他'];
const CATEGORIES: Category[] = ['飲食店', 'カフェ', 'ベーカリー', '和食', '洋食', '花屋', 'その他'];
const DEED_TYPES: DeedType[] = ['高齢者支援', '子供支援', '環境保護', '障がい者支援', '地域貢献', '寄付・譲渡', 'その他'];

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedDeedType, setSelectedDeedType] = useState<DeedType | ''>('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const storesData = await storeService.getStores();
        setStores(storesData);
        
        const counts = await Promise.all(
          storesData.map(async (s) => ({
            id: s.id.toString(),
            count: await storeService.getLikeCount(s.id)
          }))
        );
        
        const countsMap = counts.reduce((acc, curr) => ({
          ...acc,
          [curr.id]: curr.count
        }), {});
        
        setLikeCounts(countsMap);
      } catch (err) {
        console.error(err);
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Ranking calculation
  const topStores = useMemo(() => {
    return [...stores]
      .sort((a, b) => (likeCounts[b.id.toString()] || 0) - (likeCounts[a.id.toString()] || 0))
      .slice(0, 3)
      .filter(s => (likeCounts[s.id.toString()] || 0) > 0);
  }, [stores, likeCounts]);

  const handleLike = async (e: React.MouseEvent, storeId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    const likedKey = `liked_${storeId}`;
    if (localStorage.getItem(likedKey)) {
      alert('すでに応援済みです！');
      return;
    }
    try {
      await storeService.addLike(storeId);
      setLikeCounts(prev => ({
        ...prev,
        [storeId.toString()]: (prev[storeId.toString()] || 0) + 1
      }));
      localStorage.setItem(likedKey, 'true');
    } catch (err: any) {
      console.error(err);
      alert(`応援に失敗しました: ${err.message || 'Unknown error'}`);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === '' || store.region === selectedRegion;
      const matchesCategory = selectedCategory === '' || store.category === selectedCategory;
      const matchesDeedType = selectedDeedType === '' || store.deed_type === selectedDeedType;
      return matchesSearch && matchesRegion && matchesCategory && matchesDeedType;
    });
  }, [stores, searchQuery, selectedRegion, selectedCategory, selectedDeedType]);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden bg-white rounded-[3rem] border border-gray-100 p-8 md:p-16 text-center shadow-2xl shadow-orange-100/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-xs font-black tracking-widest uppercase"><Sparkles className="w-4 h-4" />Kindness is Everywhere</div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">街のあたたかい<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">善行</span>が<br />集まる場所</h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">SNSやニュースで紹介された、素敵な店主さんのいるお店を探してみましょう。<br className="hidden md:block" />あなたの街にも、きっとあたたかい場所があります。</p>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl"></div>
      </section>

      {!loading && topStores.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-end gap-4 px-4"><div className="bg-amber-100 p-3 rounded-2xl"><Trophy className="w-8 h-8 text-amber-600" /></div><div className="space-y-1"><h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">名誉の殿堂</h2><p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Most Warm-hearted Stores of the Month</p></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topStores.map((store, index) => {
              const rankStyles = [
                { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-100', icon: <Medal className="w-6 h-6" /> },
                { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-500', shadow: 'shadow-slate-100', icon: <Medal className="w-6 h-6" /> },
                { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', shadow: 'shadow-orange-100', icon: <Medal className="w-6 h-6" /> }
              ][index];
              return (
                <Link to={`/store/${store.id}`} key={store.id} className="group relative">
                  <div className={`h-full border-2 ${rankStyles.border} ${rankStyles.bg} rounded-[3rem] p-8 shadow-xl transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center overflow-hidden`}><div className={`absolute top-0 left-0 px-6 py-2 ${rankStyles.text} font-black text-xl italic`}>#{index + 1}</div><div className={`mb-6 p-4 rounded-full bg-white shadow-lg ${rankStyles.text}`}>{rankStyles.icon}</div><h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{store.name}</h3><div className="flex gap-2 mb-4"><span className="px-3 py-1 bg-white/80 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">{store.region}</span></div><p className="text-gray-600 font-medium text-sm line-clamp-2 italic mb-6 leading-relaxed">"{store.summary}"</p><div className={`mt-auto flex items-center gap-2 px-6 py-2 rounded-full bg-white font-black text-sm ${rankStyles.text} shadow-sm`}><Heart className="w-4 h-4 fill-current" />{likeCounts[store.id.toString()] || 0}</div></div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="sticky top-24 z-40 space-y-4">
        <div className="bg-white/80 backdrop-blur-2xl border border-white p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 flex flex-col gap-2">
          <div className="relative flex-1"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="店名やキーワードで検索" className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-none rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold placeholder:text-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2"><div className="relative"><MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full pl-12 pr-10 py-5 bg-gray-50/50 border-none rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer font-bold text-gray-700" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value as Region | '')}><option value="">すべての地域</option>{REGIONS.map(region => <option key={region} value={region}>{region}</option>)}</select></div><div className="relative"><Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full pl-12 pr-10 py-5 bg-gray-50/50 border-none rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer font-bold text-gray-700" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as Category | '')}><option value="">業種カテゴリ</option>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div><div className="relative"><Gift className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full pl-12 pr-10 py-5 bg-rose-50/30 border-none rounded-[2rem] focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none cursor-pointer font-bold text-rose-700" value={selectedDeedType} onChange={(e) => setSelectedDeedType(e.target.value as DeedType | '')}><option value="">善行の内容</option>{DEED_TYPES.map(deed => <option key={deed} value={deed}>{deed}</option>)}</select></div></div>
        </div>
        <div className="flex justify-center"><div className="inline-flex bg-gray-100 p-1.5 rounded-2xl shadow-inner"><button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid className="w-4 h-4" />GRID</button><button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}><MapIcon className="w-4 h-4" />MAP</button></div></div>
      </section>

      <div className="space-y-8">
        <div className="flex justify-between items-end px-4"><div className="space-y-1"><h2 className="text-3xl font-black text-gray-900 tracking-tighter">{loading ? '読み込み中...' : filteredStores.length > 0 ? '見つかった善行' : 'お店が見つかりません'}</h2><p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{loading ? 'Fetching kindness...' : `${filteredStores.length} results found`}</p></div></div>
        {loading ? <div className="flex flex-col items-center justify-center py-32 space-y-4"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /><p className="text-gray-400 font-black tracking-widest animate-pulse">SYNCING WITH SUPABASE</p></div> : error ? <div className="text-center py-20 bg-rose-50 rounded-[3rem] border border-rose-100"><p className="text-rose-600 font-bold">{error}</p><button onClick={() => window.location.reload()} className="mt-4 text-rose-700 underline font-bold">再試行</button></div> : viewMode === 'map' ? <StoreMap stores={filteredStores} /> : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <Link to={`/store/${store.id}`} key={store.id} className="group relative">
                <div className="h-full bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-200/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative flex flex-col"><button onClick={(e) => handleLike(e, store.id)} className="absolute top-6 right-6 z-20 flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white hover:bg-rose-50 hover:border-rose-100 transition-all group/like shadow-lg shadow-gray-200/10"><Heart className={`w-5 h-5 ${localStorage.getItem(`liked_${store.id}`) ? 'text-rose-500 fill-current' : 'text-gray-400 group-hover/like:text-rose-500 transition-colors'}`} /><span className="text-[10px] font-black text-gray-600 group-hover/like:text-rose-600">{likeCounts[store.id.toString()] || 0}</span></button><div className="relative aspect-[4/3] bg-gray-50 rounded-[2rem] mb-8 group-hover:bg-white transition-colors flex items-center justify-center overflow-hidden border border-gray-50 group-hover:border-orange-100">{store.thumbnail_url ? <img src={store.thumbnail_url} alt={store.name} className="w-full h-full object-cover" /> : <><div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-rose-100/20 opacity-0 group-hover:opacity-100 transition-opacity"></div><span className="text-gray-300 font-black text-xl tracking-tighter grayscale group-hover:grayscale-0 transition-all">NO IMAGE</span></>}</div><div className="flex flex-wrap gap-2 mb-4"><span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{store.region}</span>{store.deed_type && <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Gift className="w-3 h-3" />{store.deed_type}</span>}</div><h3 className="font-black text-2xl mb-4 text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">{store.name}</h3><p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-3 mb-8 flex-1 italic">"{store.summary}"</p><div className="pt-6 border-t border-gray-50 flex justify-between items-center"><span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(store.created_at).toLocaleDateString()}</span><div className="flex items-center gap-2 text-sm font-black text-orange-600"><span>VIEW DETAILS</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div></div></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100"><div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"><FilterX className="w-10 h-10 text-gray-300" /></div><p className="text-gray-400 font-bold text-xl mb-4 tracking-tight">条件に一致するお店がありません。</p><button onClick={() => { setSearchQuery(''); setSelectedRegion(''); setSelectedCategory(''); setSelectedDeedType(''); }} className="text-orange-600 font-black text-sm uppercase tracking-widest hover:text-orange-700 transition-colors underline decoration-2 underline-offset-8">Reset Filters</button></div>
        )}
      </div>
    </div>
  );
}
