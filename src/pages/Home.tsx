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
    <div className="space-y-10 md:space-y-20 pb-10">
      {/* Hero Section - More compact on mobile */}
      <section className="relative overflow-hidden bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 p-6 md:p-16 text-center shadow-2xl shadow-orange-100/30">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[9px] md:text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3 h-3 md:w-4 h-4" />
            Kindness is Everywhere
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-gray-900 leading-tight tracking-tighter">
            街のあたたかい<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">善行</span>が<br />集まる場所
          </h1>
          <p className="text-sm md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
            素敵な店主さんのいるお店を探してみましょう。あなたの街にも、きっとあたたかい場所があります。
          </p>
        </div>
        <div className="absolute -top-24 -right-24 w-48 md:w-64 h-48 md:h-64 bg-orange-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 md:w-64 h-48 md:h-64 bg-rose-100/50 rounded-full blur-3xl"></div>
      </section>

      {/* 🏆 Hall of Fame - Horizontal scroll on mobile */}
      {!loading && topStores.length > 0 && (
        <section className="space-y-6 px-1">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic">名誉の殿堂</h2>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden md:block">Top Rated</p>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-0 px-4 md:px-0 snap-x no-scrollbar">
            {topStores.map((store, index) => {
              const rankStyles = [
                { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', icon: <Medal className="w-5 h-5" /> },
                { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-500', icon: <Medal className="w-5 h-5" /> },
                { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', icon: <Medal className="w-5 h-5" /> }
              ][index];

              return (
                <Link to={`/store/${store.id}`} key={store.id} className="min-w-[280px] md:min-w-full snap-start group relative">
                  <div className={`h-full border-2 ${rankStyles.border} ${rankStyles.bg} rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center`}>
                    <div className={`absolute top-4 left-6 ${rankStyles.text} font-black text-lg italic opacity-50`}>#{index + 1}</div>
                    <div className={`mb-4 p-3 rounded-full bg-white shadow-md ${rankStyles.text}`}>{rankStyles.icon}</div>
                    <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-2 line-clamp-1">{store.name}</h3>
                    <p className="text-gray-500 font-medium text-xs line-clamp-2 italic mb-4">"{store.summary}"</p>
                    <div className={`mt-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-white font-black text-xs ${rankStyles.text} shadow-sm`}>
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {likeCounts[store.id.toString()] || 0}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Filter Section - Glassmorphism & Fixed Bottom on Mobile? No, sticky top is better */}
      <section className="sticky top-20 z-40 px-2 md:px-0">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 space-y-2">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="店名で検索..." 
              className="w-full pl-12 pr-4 py-3.5 md:py-5 bg-gray-50/50 border-none rounded-2xl md:rounded-[2rem] focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-sm md:text-base placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Horizontal Filters for Mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            <div className="relative shrink-0">
              <select 
                className="pl-4 pr-8 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl outline-none appearance-none cursor-pointer font-bold text-[11px] text-gray-600 min-w-[100px]"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as Region | '')}
              >
                <option value="">すべての地域</option>
                {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative shrink-0">
              <select 
                className="pl-4 pr-8 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl outline-none appearance-none cursor-pointer font-bold text-[11px] text-gray-600 min-w-[100px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | '')}
              >
                <option value="">すべての業種</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative shrink-0">
              <select 
                className="pl-4 pr-8 py-2.5 bg-rose-50/50 border border-rose-100 rounded-xl outline-none appearance-none cursor-pointer font-bold text-[11px] text-rose-600 min-w-[100px]"
                value={selectedDeedType}
                onChange={(e) => setSelectedDeedType(e.target.value as DeedType | '')}
              >
                <option value="">善行の内容</option>
                {DEED_TYPES.map(deed => <option key={deed} value={deed}>{deed}</option>)}
              </select>
              <Gift className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-rose-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle - Floating on mobile? */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex bg-gray-100/50 backdrop-blur-sm p-1 rounded-xl shadow-inner">
            <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
              <LayoutGrid className="w-3 h-3" /> GRID
            </button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
              <MapIcon className="w-3 h-3" /> MAP
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div className="space-y-6 md:space-y-8 px-2 md:px-0">
        <div className="flex justify-between items-end px-4">
          <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
            {loading ? '読み込み中...' : filteredStores.length > 0 ? '見つかった善行' : '店舗なし'}
          </h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredStores.length} results</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /><p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Syncing</p></div>
        ) : error ? (
          <div className="text-center py-10 bg-rose-50 rounded-3xl border border-rose-100"><p className="text-xs text-rose-600 font-bold">{error}</p></div>
        ) : viewMode === 'map' ? (
          <StoreMap stores={filteredStores} />
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredStores.map((store) => (
              <Link to={`/store/${store.id}`} key={store.id} className="group relative">
                <div className="h-full bg-white border border-gray-100 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden">
                  {/* Floating Like Button */}
                  <button onClick={(e) => handleLike(e, store.id)} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white shadow-sm hover:bg-rose-50 transition-all">
                    <Heart className={`w-4 h-4 ${localStorage.getItem(`liked_${store.id}`) ? 'text-rose-500 fill-current' : 'text-gray-300'}`} />
                    <span className="text-[10px] font-black text-gray-600">{likeCounts[store.id.toString()] || 0}</span>
                  </button>

                  <div className="aspect-[16/10] md:aspect-[4/3] bg-gray-50 rounded-2xl md:rounded-[2rem] mb-4 md:mb-8 overflow-hidden">
                    {store.thumbnail_url ? <img src={store.thumbnail_url} alt={store.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-sm uppercase">No Photo</div>}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[9px] font-black uppercase tracking-wider">{store.region}</span>
                    {store.deed_type && <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-black uppercase tracking-wider">{store.deed_type}</span>}
                  </div>
                  
                  <h3 className="font-black text-lg md:text-2xl mb-2 text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">{store.name}</h3>
                  <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed line-clamp-2 italic flex-1 mb-4">"{store.summary}"</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(store.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                      <span>Detail</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100"><p className="text-gray-400 font-bold text-sm">該当する店舗がありません。</p></div>
        )}
      </div>
    </div>
  );
}
