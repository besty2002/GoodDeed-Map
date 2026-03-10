import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storeService } from '../services/storeService';
import { Heart, MessageCircle, Send, Loader2, ArrowRight, User as UserIcon, Award, Star, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Store } from '../types';

type TabType = 'reports' | 'likes' | 'reviews';

interface BadgeInfo {
  name: string;
  color: string;
  icon: React.ReactNode;
  minScore: number;
}

const BADGES: BadgeInfo[] = [
  { name: 'KINDNESS SEED', color: 'from-slate-400 to-slate-500', icon: <Star className="w-5 h-5" />, minScore: 0 },
  { name: 'WARM SPROUT', color: 'from-emerald-400 to-teal-500', icon: <Zap className="w-5 h-5" />, minScore: 5 },
  { name: 'HEART BLOOM', color: 'from-rose-400 to-orange-500', icon: <Heart className="w-5 h-5" />, minScore: 20 },
  { name: 'WORLD GUARDIAN', color: 'from-purple-600 to-blue-600', icon: <Award className="w-5 h-5" />, minScore: 50 },
];

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    reports: any[];
    likes: Store[];
    reviews: any[];
  }>({
    reports: [],
    likes: [],
    reviews: []
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchUserActivity();
  }, [user, authLoading]);

  const fetchUserActivity = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [reports, likes, reviews] = await Promise.all([
        storeService.getUserReports(user.id),
        storeService.getUserLikedStores(user.id),
        storeService.getUserReviews(user.id)
      ]);
      setData({ reports, likes, reviews });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userStats = useMemo(() => {
    const score = (data.reports.length * 5) + (data.reviews.length * 3) + (data.likes.length * 1);
    const currentBadge = [...BADGES].reverse().find(b => score >= b.minScore) || BADGES[0];
    const nextBadge = BADGES[BADGES.indexOf(currentBadge) + 1] || null;
    const progress = nextBadge ? ((score - currentBadge.minScore) / (nextBadge.minScore - currentBadge.minScore)) * 100 : 100;
    
    return { score, currentBadge, nextBadge, progress };
  }, [data]);

  if (authLoading || loading) return <div className="flex flex-col items-center justify-center py-40 space-y-4"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /><p className="text-gray-400 font-black tracking-widest">CALCULATING YOUR KINDNESS</p></div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-12">
      <header className="bg-white p-8 md:p-12 rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${userStats.currentBadge.color}`} />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className={`w-32 h-32 bg-gradient-to-br ${userStats.currentBadge.color} rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-gray-200`}>
              <UserIcon className="w-14 h-14 text-white" />
            </div>
            <div className={`absolute -bottom-4 -right-4 p-4 rounded-2xl bg-white shadow-xl border border-gray-50 flex items-center justify-center`}>
              {userStats.currentBadge.icon}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${userStats.currentBadge.color} tracking-[0.2em] mb-2`}>{userStats.currentBadge.name}</span>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{user?.email?.split('@')[0]}様の活動</h1>
            </div>
            <div className="space-y-3 max-w-md">
              <div className="flex justify-between items-end"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kindness Level Progress</span><span className="text-sm font-black text-gray-900">{userStats.score} pts</span></div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner"><div className={`h-full rounded-full bg-gradient-to-r ${userStats.currentBadge.color} transition-all duration-1000`} style={{ width: `${userStats.progress}%` }} /></div>
              {userStats.nextBadge && <p className="text-[10px] font-bold text-gray-400 text-center md:text-left">次のランク <span className="text-gray-600">[{userStats.nextBadge.name}]</span> まであと {userStats.nextBadge.minScore - userStats.score} ポイントです！</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 md:flex md:flex-col shrink-0">
            <StatBadge icon={<Send className="w-4 h-4" />} label="Reports" value={data.reports.length} color="text-orange-500" />
            <StatBadge icon={<Heart className="w-4 h-4" />} label="Likes" value={data.likes.length} color="text-rose-500" />
            <StatBadge icon={<MessageCircle className="w-4 h-4" />} label="Reviews" value={data.reviews.length} color="text-blue-500" />
          </div>
        </div>
      </header>

      <div className="flex justify-center"><div className="inline-flex bg-gray-100 p-1.5 rounded-2xl shadow-inner gap-1"><button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'reports' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}><Send className="w-4 h-4" /> 投稿した店舗</button><button onClick={() => setActiveTab('likes')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'likes' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}><Heart className="w-4 h-4" /> 応援した店舗</button><button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'reviews' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}><MessageCircle className="w-4 h-4" /> 投稿したレビュー</button></div></div>

      <div className="min-h-[400px]">
        {activeTab === 'reports' && (
          <div className="grid gap-6">
            {data.reports.length > 0 ? data.reports.map((report) => (
              <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"><div className="space-y-3 flex-1"><div className="flex items-center gap-3"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${report.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{report.status === 'approved' ? '承認済み' : '承認待ち'}</span><span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(report.created_at).toLocaleDateString()}</span></div><h3 className="text-xl font-black text-gray-900">{report.store_name}</h3><p className="text-gray-500 text-sm italic">"{report.comment}"</p></div>{report.status === 'approved' && <Link to="/" className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all"><ArrowRight className="w-5 h-5" /></Link>}</div>
            )) : <EmptyState message="まだ投稿した店舗はありません。" link="/report" btnText="初めての投稿をする" />}
          </div>
        )}
        {activeTab === 'likes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.likes.length > 0 ? data.likes.map((store) => (
              <Link to={`/store/${store.id}`} key={store.id} className="group relative"><div className="h-full bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative flex flex-col"><div className="relative aspect-video bg-gray-50 rounded-2xl mb-6 overflow-hidden">{store.thumbnail_url ? <img src={store.thumbnail_url} className="w-full h-full object-cover" alt={store.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-200 font-black">NO IMAGE</div>}</div><h3 className="font-black text-lg text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-2">{store.name}</h3><div className="flex gap-2"><span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-black uppercase tracking-widest">{store.region}</span></div></div></Link>
            )) : <div className="col-span-full"><EmptyState message="まだ応援した店舗はありません。" link="/" btnText="店舗を探す" /></div>}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="grid gap-6">
            {data.reviews.length > 0 ? data.reviews.map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-4"><div className="flex justify-between items-start"><div><h4 className="font-black text-gray-900 text-lg">{review.stores?.name}</h4><p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p></div><Link to={`/store/${review.store_id}`} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-all"><ArrowRight className="w-4 h-4" /></Link></div><p className="text-gray-600 font-medium leading-relaxed italic">"{review.content}"</p>{review.photo_url && <div className="w-32 aspect-video rounded-xl overflow-hidden border border-gray-100"><img src={review.photo_url} className="w-full h-full object-cover" alt="Review" /></div>}</div>
            )) : <EmptyState message="まだ投稿したレビューはありません。" link="/" btnText="最初のレビューを書く" />}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100 min-w-[120px]">
      <div className={`${color} bg-white p-2 rounded-lg shadow-sm`}>{icon}</div>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-lg font-black text-gray-900">{value}</span>
      </div>
    </div>
  );
}

function EmptyState({ message, link, btnText }: { message: string, link: string, btnText: string }) {
  return <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 space-y-6"><p className="text-gray-400 font-bold">{message}</p><Link to={link} className="inline-block px-8 py-3 bg-white text-orange-600 font-black rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all active:scale-95">{btnText}</Link></div>;
}
