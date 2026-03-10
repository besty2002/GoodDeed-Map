import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Check, X, ExternalLink, Loader2, MapPin, Info, Lock, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Category, Region, DeedType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// Leaflet icon setup
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {

  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    thumbnail_url: '',
    region: '東京都' as Region,
    category: '飲食店' as Category,
    deed_type: '子供支援' as DeedType,
    latitude: 35.6895,
    longitude: 139.6917
  });

  useEffect(() => { if (user) loadReports(); }, [user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await storeService.getPendingReports();
      setReports(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await storeService.uploadImage(file);
      setFormData({ ...formData, thumbnail_url: url });
    } catch (err) {
      alert('이미지 업로드에 실패했습니다.');
    } finally { setUploading(false); }
  };

  const startApproval = (report: any) => {
    setEditingReport(report);
    setFormData({
      name: report.store_name,
      summary: report.comment.substring(0, 100),
      description: report.comment,
      thumbnail_url: '',
      region: report.region || '東京都',
      category: report.category || '飲食店',
      deed_type: report.deed_type || '子供支援',
      latitude: 35.6895,
      longitude: 139.6917
    });
  };

  const handleApprove = async () => {
    if (!editingReport) return;
    setActionLoading(true);
    try {
      await storeService.approveReport(editingReport.id, { ...formData, created_at: new Date().toISOString() });
      setReports(reports.filter(r => r.id !== editingReport.id));
      setEditingReport(null);
      alert('承認完了！');
    } catch (err) { alert('承認に失敗しました。'); } finally { setActionLoading(false); }
  };

  if (authLoading) return <div className="flex flex-col items-center justify-center py-40 space-y-4"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /><p className="text-gray-400 font-black tracking-widest">AUTHENTICATING</p></div>;
  if (!user || user.email !== 'doogiya2002@gmail.com') return <div className="max-w-md mx-auto py-40 text-center space-y-8 px-4"><div className="bg-rose-100 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-100"><Lock className="w-10 h-10" /></div><div className="space-y-2"><h1 className="text-3xl font-black text-gray-900 tracking-tighter">Access Restricted</h1><p className="text-gray-500 font-medium">{!user ? '관리자 전용 페이지입니다. 로그인 후 이용해 주세요.' : '죄송합니다. 관리자 권한이 없습니다.'}</p></div><Link to="/login" className="block w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 transition-all">로그인 페이지로 이동</Link></div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-[10px] font-black tracking-widest uppercase">Admin Console</div><h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">承認待ちの善行</h1></div>
        <div className="bg-orange-50 px-8 py-4 rounded-[2rem] border border-orange-100 flex items-center gap-4"><div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div><span className="text-orange-700 font-black text-lg">{reports.length} 件の待機中</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          {loading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></div> : reports.length === 0 ? <div className="text-center py-32 bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100"><Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" /><p className="text-gray-400 font-bold">現在、承認待ちの投稿はありません。</p></div> : reports.map((report) => (
            <div key={report.id} onClick={() => startApproval(report)} className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group ${editingReport?.id === report.id ? 'border-orange-500 bg-orange-50/30 shadow-xl shadow-orange-100' : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg'}`}><div className="space-y-4"><div className="flex justify-between items-start"><div className="flex flex-wrap gap-2"><span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{report.region}</span><span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{report.category}</span></div><span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(report.created_at).toLocaleDateString()}</span></div><h2 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">{report.store_name}</h2><p className="text-gray-500 text-sm line-clamp-2 italic">"{report.comment}"</p><div className="flex items-center justify-between pt-4"><a href={report.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-blue-500 font-bold hover:underline text-xs"><ExternalLink className="w-3 h-3" /> Source</a><button className={`p-2 rounded-full transition-all ${editingReport?.id === report.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400'}`}><Check className="w-4 h-4" /></button></div></div></div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {editingReport ? (
            <div className="bg-white border border-gray-100 rounded-[3.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 sticky top-24 space-y-10">
              <div className="flex items-center gap-4"><div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200"><Info className="w-6 h-6 text-white" /></div><h2 className="text-3xl font-black text-gray-900 tracking-tighter">編集と承認</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Name</label><input className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Photo</label>
                    {formData.thumbnail_url ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-orange-100"><img src={formData.thumbnail_url} className="w-full h-full object-cover" alt="Store" /><button onClick={() => setFormData({...formData, thumbnail_url: ''})} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button></div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-orange-50 transition-all">{uploading ? <Loader2 className="w-6 h-6 text-orange-500 animate-spin" /> : <Camera className="w-6 h-6 text-gray-400" />}<input type="file" className="hidden" onChange={handleImageUpload} /></label>
                    )}
                  </div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex justify-between"><span>Location Picker</span><span className="text-orange-600">Click to set</span></label><div className="h-[280px] rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner relative z-10"><MapContainer center={[formData.latitude, formData.longitude]} zoom={13} className="h-full w-full"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><LocationMarker position={[formData.latitude, formData.longitude]} setPosition={(pos) => setFormData({...formData, latitude: pos[0], longitude: pos[1]})} /></MapContainer></div></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label><textarea className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none font-medium h-32 resize-none text-gray-700" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className="flex gap-4"><button onClick={() => setEditingReport(null)} className="flex-1 py-5 bg-gray-50 text-gray-500 font-black rounded-2xl active:scale-95">キャンセル</button><button disabled={actionLoading} onClick={handleApprove} className="flex-[2] py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-3">{actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}承認して公開</button></div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100 space-y-6"><div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/20"><MapPin className="w-12 h-12 text-gray-200" /></div><p className="text-gray-400 font-bold text-center max-w-xs leading-relaxed">제보를 선택하여<br />상세 내용을 편집하고 승인하세요.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
