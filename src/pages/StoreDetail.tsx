import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Tv, Newspaper, Share2, MapPin, Calendar, Loader2, Heart, Send, Camera, User, Twitter, Link as LinkIcon, X } from 'lucide-react';
import { storeService } from '../services/storeService';
import { useAuth } from '../hooks/useAuth';
import type { Store, SourceType } from '../types';

const getSourceIcon = (type: SourceType) => {
  switch (type) {
    case 'SNS': return <MessageCircle className="w-5 h-5 text-sky-500" />;
    case 'News': return <Newspaper className="w-5 h-5 text-emerald-500" />;
    case 'TV': return <Tv className="w-5 h-5 text-rose-500" />;
    default: return <Share2 className="w-5 h-5 text-gray-500" />;
  }
};

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    content: ''
  });
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewPreview, setReviewPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const [storeData, count, reviewsData] = await Promise.all([
          storeService.getStoreById(id),
          storeService.getLikeCount(id),
          storeService.getReviews(id)
        ]);
        setStore(storeData);
        setLikeCount(count);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        setError('情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReviewPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async () => {
    if (!id || !store) return;
    const likedKey = `liked_${id}`;
    if (localStorage.getItem(likedKey)) {
      alert('すでに応援済みです！');
      return;
    }
    try {
      await storeService.addLike(id, user?.id);
      setLikeCount(prev => prev + 1);
      localStorage.setItem(likedKey, 'true');
    } catch (err: any) {
      console.error(err);
      alert(`応援に失敗しました: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || submitting) return;
    
    try {
      setSubmitting(true);
      let photo_url = '';
      if (reviewFile) photo_url = await storeService.uploadImage(reviewFile, 'store-images');

      const [newReview] = await storeService.addReview({
        store_id: id,
        user_name: reviewForm.user_name || (user?.email?.split('@')[0] || 'Anonymous'),
        content: reviewForm.content,
        photo_url,
        user_id: user?.id
      });

      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ user_name: '', content: '' });
      setReviewFile(null);
      setReviewPreview(null);
      alert('温かいレビューをありがとうございます！');
    } catch (err: any) {
      console.error(err);
      alert('レビューの投稿に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const shareToSNS = (platform: 'twitter' | 'line' | 'copy') => {
    if (!store) return;
    const url = window.location.href;
    const text = `【善行マップ】素敵な店主さんのいる「${store.name}」を紹介します。あなたの街にも、きっとあたたかい場所があります。 #善행 맵 #따뜻한 세계`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'line') window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    else if (platform === 'copy') navigator.clipboard.writeText(`${text}\n${url}`).then(() => alert('링크를 복사했습니다.'));
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-40 space-y-4"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /><p className="text-gray-400 font-black tracking-widest text-sm">FETCHING DETAILS</p></div>;
  if (error || !store) return <div className="max-w-2xl mx-auto py-20 text-center space-y-6"><div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-rose-500"><Share2 className="w-10 h-10" /></div><h1 className="text-2xl font-bold text-gray-900">{error || '店舗が見つかりませんでした。'}</h1><button onClick={() => navigate('/')} className="bg-gray-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mx-auto"><ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기</button></div>;

  const isLiked = localStorage.getItem(`liked_${id}`);

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20 px-4 md:px-0">
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors"><ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /><span className="font-bold uppercase tracking-widest text-xs">Back to Map</span></button>
          <div className="flex items-center gap-2"><button onClick={() => shareToSNS('copy')} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all" title="Copy Link"><LinkIcon className="w-4 h-4" /></button><button onClick={() => shareToSNS('twitter')} className="p-2.5 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-100 transition-all" title="Share on X"><Twitter className="w-4 h-4" /></button></div>
        </div>

        <header className="space-y-10">
          <div className="aspect-[21/9] bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl shadow-gray-200/30 flex items-center justify-center relative overflow-hidden group">
            {store.thumbnail_url ? <img src={store.thumbnail_url} alt={store.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50/30 flex items-center justify-center"><span className="text-gray-200 font-black text-4xl tracking-tighter uppercase grayscale">GoodDeed Map</span></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <button onClick={handleLike} className={`absolute bottom-8 right-8 z-20 flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md border transition-all duration-300 transform hover:scale-105 active:scale-95 ${isLiked ? 'bg-rose-500 border-rose-400 text-white shadow-xl shadow-rose-200' : 'bg-white/80 border-white text-gray-900 hover:bg-white shadow-xl shadow-gray-200/20'}`}><Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : 'text-rose-500'}`} /><span className="font-black text-sm tracking-tight">{likeCount} 応援中</span></button>
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3"><span className="px-5 py-2 bg-orange-600 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-orange-200">{store.category}</span><span className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-gray-200">{store.region}</span></div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">{store.name}</h1>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-gray-400 font-bold text-sm"><div className="flex items-center gap-2"><div className="bg-gray-100 p-2 rounded-xl"><MapPin className="w-4 h-4 text-gray-500" /></div><span>{store.address || '住所情報なし'}</span></div><div className="flex items-center gap-2"><div className="bg-gray-100 p-2 rounded-xl"><Calendar className="w-4 h-4 text-gray-500" /></div><span>登録日: {new Date(store.created_at).toLocaleDateString()}</span></div></div>
          </div>
        </header>

        <section className="bg-white p-10 md:p-16 border border-gray-100 rounded-[4rem] shadow-2xl shadow-orange-100/20 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-rose-500" /><div className="flex items-center gap-4 mb-10"><div className="w-12 h-px bg-orange-200" /><h2 className="text-xl font-black text-orange-600 uppercase tracking-[0.3em]">Story</h2></div><p className="text-gray-800 leading-[2.2] text-xl md:text-2xl font-bold font-jp whitespace-pre-wrap">{store.description}</p></section>
      </div>

      <section className="text-center space-y-8 bg-orange-50/50 p-12 md:p-20 rounded-[4rem] border border-orange-100/50"><div className="space-y-2"><h2 className="text-3xl font-black text-gray-900 tracking-tighter">この温かさを誰かに届ける</h2><p className="text-gray-500 font-medium italic">Share this warmth with someone special</p></div><div className="flex flex-wrap justify-center gap-4"><button onClick={() => shareToSNS('twitter')} className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-gray-100"><Twitter className="w-5 h-5 text-sky-500 fill-current" />X (Twitter)</button><button onClick={() => shareToSNS('line')} className="flex items-center gap-3 px-8 py-4 bg-[#06C755] text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"><MessageCircle className="w-5 h-5 fill-current" />LINE</button><button onClick={() => shareToSNS('copy')} className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"><LinkIcon className="w-5 h-5" />COPY LINK</button></div></section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">訪れた感想を届ける</h2>
          <form onSubmit={handleReviewSubmit} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
            <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2"><User className="w-3 h-3" /> Name</label><input required type="text" placeholder={user?.email?.split('@')[0] || "お名前"} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold" value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2"><MessageCircle className="w-3 h-3" /> Content</label><textarea required placeholder="感動したエピソード..." className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-medium h-32 resize-none" value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2"><Camera className="w-3 h-3" /> Photo</label>
              {reviewPreview ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden group"><img src={reviewPreview} className="w-full h-full object-cover" alt="Preview" /><button type="button" onClick={() => { setReviewFile(null); setReviewPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button></div>
              ) : (
                <label className="flex flex-col items-center justify-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-orange-50 transition-all"><Camera className="w-6 h-6 text-gray-400 mb-2" /><span className="text-[10px] font-bold text-gray-400">Click to upload photo</span><input type="file" accept="image/*" className="hidden" onChange={handleReviewImageChange} /></label>
              )}
            </div>
            <button disabled={submitting} className="w-full py-5 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}投稿する</button>
          </form>
        </section>

        <section className="space-y-8">
          <div className="flex items-end gap-4"><h2 className="text-3xl font-black text-gray-900 tracking-tighter">みんなの認証</h2><span className="bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest">{reviews.length} items</span></div>
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black">{review.user_name[0]}</div><div><h4 className="font-black text-gray-900">{review.user_name}</h4><p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p></div></div>
                <p className="text-gray-600 font-medium leading-relaxed italic">"{review.content}"</p>
                {review.photo_url && <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100"><img src={review.photo_url} className="w-full h-full object-cover" alt="Review" /></div>}
              </div>
            )) : <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"><p className="text-gray-400 font-bold">まだレビューがありません。</p></div>}
          </div>
        </section>
      </div>
    </div>
  );
}
