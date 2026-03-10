import { supabase } from './supabase';
import type { Store, Category, Region } from '../types';

// Helper to check if supabase is available
const isSupabaseReady = () => !!supabase && typeof supabase.from === 'function';

export const storeService = {
  // 承認されたすべての店舗リストを取得
  async getStores() {
    if (!isSupabaseReady()) {
      console.warn('Supabase not initialized, returning empty array.');
      return [] as Store[];
    }
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        sources (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Store[];
  },

  // 特定の店舗の詳細情報を取得
  async getStoreById(id: string | number) {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not initialized.');
    }
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        sources (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Store;
  },

  // 情報提供 (reportsテーブルに保存)
  async reportStore(report: {
    store_name: string;
    url: string;
    comment: string;
    category?: Category;
    region?: Region;
    deed_type?: string;
    user_id?: string;
  }) {
    if (!isSupabaseReady()) {
      throw new Error('Supabaseが初期化されていません。情報提供機能は現在利用できません。');
    }
    const { data, error } = await supabase
      .from('reports')
      .insert([
        { 
          ...report, 
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return data;
  },

  // 管理者: 承認待ちの情報提供リストを取得
  async getPendingReports() {
    if (!isSupabaseReady()) {
      console.warn('Supabase not initialized, returning empty array for reports.');
      return [];
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 管理者: 情報提供の承認処理
  async approveReport(reportId: string | number, storeData: any) {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not initialized.');
    }
    // 1. 店舗情報の作成
    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert([storeData])
      .select()
      .single();

    if (storeError) throw storeError;

    // 2. 情報提供ステータスの更新
    const { error: reportError } = await supabase
      .from('reports')
      .update({ status: 'approved' })
      .eq('id', reportId);

    if (reportError) throw reportError;

    return newStore;
  },

  // 応援(いいね)数の取得
  async getLikeCount(storeId: string | number) {
    if (!isSupabaseReady()) return 0;
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    
    if (error) throw error;
    return count || 0;
  },

  // 応援(いいね)を追加
  async addLike(storeId: string | number, userId?: string) {
    if (!isSupabaseReady()) return null;
    const { data, error } = await supabase
      .from('likes')
      .insert([{ store_id: storeId, user_id: userId }])
      .select();

    if (error) throw error;
    return data;
  },

  // レビューの取得
  async getReviews(storeId: string | number) {
    if (!isSupabaseReady()) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // レ뷰の登録
  async addReview(review: {
    store_id: string | number;
    user_name: string;
    content: string;
    photo_url?: string;
    user_id?: string;
  }) {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized.');
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select();

    if (error) throw error;
    return data;
  },

  // マイページ: 自分が投稿した店舗リスト
  async getUserReports(userId: string) {
    if (!isSupabaseReady()) return [];
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // マイページ: 自分が応援した店舗リスト
  async getUserLikedStores(userId: string) {
    if (!isSupabaseReady()) return [];
    const { data, error } = await supabase
      .from('likes')
      .select(`
        store_id,
        stores (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[]).map((item: any) => item.stores).filter(Boolean);
  },

  // マイページ: 自分が書いたレビューリスト
  async getUserReviews(userId: string) {
    if (!isSupabaseReady()) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        stores (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // タイムライン用: 最近の活動(レビュー + 新規店舗)の取得
  async getRecentActivity(limit: number = 10) {
    if (!isSupabaseReady()) return [];
    
    const [reviews, stores] = await Promise.all([
      supabase.from('reviews').select('*, stores(name, thumbnail_url)').order('created_at', { ascending: false }).limit(limit),
      supabase.from('stores').select('*').order('created_at', { ascending: false }).limit(limit)
    ]);

    const timeline = [
      ...(reviews.data || []).map((r: any) => ({ ...r, type: 'review' })),
      ...(stores.data || []).map((s: any) => ({ ...s, type: 'store' }))
    ];

    return timeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  },

  // 画像アップロード機能
  async uploadImage(file: File, bucket: string = 'store-images') {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized.');
    
    // ファイル名の重複防止のためユニークな名前を生成
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // アップロードされたファイルの公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
