import { useState } from 'react';
import { storeService } from '../services/storeService';
import { CheckCircle, AlertCircle, Loader2, Heart, Gift, MapPin, Tag, Camera, X, Lock } from 'lucide-react';
import type { Category, Region, DeedType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const REGIONS: Region[] = ['東京都', '大阪府', '神奈川県', '愛知県', '福岡県', '北海道', 'その他'];
const CATEGORIES: Category[] = ['飲食店', 'カフェ', 'ベーカリー', '和食', '洋食', '花屋', 'その他'];
const DEED_TYPES: DeedType[] = ['高齢者支援', '子供支援', '環境保護', '障がい者支援', '地域貢献', '寄付・譲渡', 'その他'];

export default function ReportStore() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    store_name: '',
    url: '',
    comment: '',
    category: '飲食店' as Category,
    region: '東京都' as Region,
    deed_type: '子供支援' as DeedType
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let photo_url = '';
      if (imageFile) photo_url = await storeService.uploadImage(imageFile);

      await storeService.reportStore({
        ...formData,
        user_id: user.id,
        comment: `${formData.comment}${photo_url ? `\n[Image: ${photo_url}]` : ''}`
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('投稿に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-40 text-center space-y-8 px-4">
        <div className="bg-gray-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-gray-400"><Lock className="w-10 h-10" /></div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Login Required</h1>
          <p className="text-gray-500 font-medium">善行の投稿にはログインが必要です。</p>
        </div>
        <Link to="/login" className="block w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 transition-all">ログインページへ</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-10 h-10 text-orange-600" /></div>
        <h1 className="text-3xl font-bold text-gray-900 font-jp">投稿ありがとうございます！</h1>
        <p className="text-gray-600 leading-relaxed">
          運営チームで内容を確認後、マップに登録させていただきます。<br />
          あたたかい世界を共に創っていただき、心より感謝申し上げます。
        </p>
        <button onClick={() => setSubmitted(false)} className="mt-8 text-orange-600 font-bold hover:underline">続けて投稿する</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-black tracking-widest uppercase"><Heart className="w-4 h-4 fill-current" />Share Your Story</div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">善行のお店を投稿する</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200/40">
        {error && <div className="flex items-center gap-3 p-5 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100"><AlertCircle className="w-5 h-5" />{error}</div>}
        <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Store Name</label><input required type="text" className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-gray-700" value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} /></div>
        <div className="space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Store Photo</label>
          {imagePreview ? (
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-orange-100 group"><img src={imagePreview} className="w-full h-full object-cover" alt="Preview" /><button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button></div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:bg-orange-50 transition-all"><Camera className="w-8 h-8 text-orange-500" /><input type="file" accept="image/*" className="hidden" onChange={handleImageChange} /></label>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Region</label><div className="relative"><MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer font-bold text-gray-700" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value as Region})}>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div></div>
          <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Business Type</label><div className="relative"><Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><select className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer font-bold text-gray-700" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
          <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Deed Type</label><div className="relative"><Gift className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" /><select className="w-full pl-12 pr-6 py-5 bg-rose-50/30 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none cursor-pointer font-bold text-rose-700" value={formData.deed_type} onChange={(e) => setFormData({...formData, deed_type: e.target.value as DeedType})}>{DEED_TYPES.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div>
        </div>
        <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Source URL</label><input required type="url" className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold text-gray-700" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} /></div>
        <div className="space-y-3"><label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Comment</label><textarea className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none h-40 resize-none font-medium text-gray-700" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} /></div>
        <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black py-6 rounded-2xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className="w-6 h-6 fill-current" />}内容を確認して投稿する</button>
      </form>
    </div>
  );
}
