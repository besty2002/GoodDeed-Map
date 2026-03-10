import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Heart, MessageCircle, Sparkles, Loader2, Calendar, MapPin, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Timeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await storeService.getRecentActivity(20);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="text-gray-400 font-black tracking-widest">LOADING KINDNESS FEED</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black tracking-widest uppercase">
          <Sparkles className="w-4 h-4" />
          Live Timeline
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">全国の善行ニュース</h1>
        <p className="text-gray-500 font-medium">今この瞬間、日本中で起きている温かい出来事</p>
      </div>

      <div className="space-y-10 relative">
        {/* Vertical line connector */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 -z-10" />

        {activities.map((item, index) => (
          <div key={`${item.type}-${item.id}`} className="relative flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Timeline Marker */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${item.type === 'review' ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-orange-500 text-white shadow-orange-200'}`}>
              {item.type === 'review' ? <Heart className="w-6 h-6 fill-current" /> : <MapPin className="w-6 h-6" />}
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white border border-gray-100 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 space-y-6 hover:shadow-2xl transition-all duration-500">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-black text-xs uppercase">
                    {item.user_name?.[0] || <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">{item.user_name || 'Anonymous User'}</h4>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.type === 'review' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.type === 'review' ? 'Review Authored' : 'New Store Listed'}
                </span>
              </div>

              <div className="space-y-4">
                {item.type === 'review' ? (
                  <>
                    <p className="text-gray-700 text-lg font-bold leading-relaxed italic">"{item.content}"</p>
                    <Link to={`/store/${item.store_id}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group/store">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                        {item.stores?.thumbnail_url ? <img src={item.stores.thumbnail_url} className="w-full h-full object-cover" /> : <MapPin className="w-5 h-5 text-gray-200" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Regarding Store</span>
                        <h5 className="font-black text-gray-900 leading-none group-hover/store:text-orange-600 transition-colors">{item.stores?.name}</h5>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover/store:translate-x-1 transition-transform" />
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-gray-900">{item.name} がマップに追加されました！</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.summary}</p>
                    <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-gray-100">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-50 flex items-center justify-center"><Sparkles className="w-10 h-10 text-orange-200" /></div>
                      )}
                    </div>
                    <Link to={`/store/${item.id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-orange-600 transition-all">
                      この善行を見る <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>

              {/* Review Photo (if exists) */}
              {item.type === 'review' && item.photo_url && (
                <div className="aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
                  <img src={item.photo_url} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-10">
        <p className="text-gray-400 font-bold text-sm italic">You've reached the end of the kindness feed. Keep spreading the warmth!</p>
      </div>
    </div>
  );
}
