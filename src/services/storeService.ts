import { supabase } from './supabase';
import type { Store, Category, Region } from '../types';

// Helper to check if supabase is available
const isSupabaseReady = () => !!supabase && typeof supabase.from === 'function';

export const storeService = {
  // 승인된 모든 가게 목록 가져오기
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

  // 특정 가게 상세 정보 가져오기
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

  // 제보하기 (reports 테이블에 저장)
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
      throw new Error('Supabase not initialized. 제보하기 기능은 현재 이용할 수 없습니다.');
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

  // 관리자: 대기 중인 제보 목록 가져오기
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

  // 관리자: 제보 승인 처리
  async approveReport(reportId: string | number, storeData: any) {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not initialized.');
    }
    // 1. 가게 정보 생성
    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert([storeData])
      .select()
      .single();

    if (storeError) throw storeError;

    // 2. 제보 상태 업데이트
    const { error: reportError } = await supabase
      .from('reports')
      .update({ status: 'approved' })
      .eq('id', reportId);

    if (reportError) throw reportError;

    return newStore;
  },

  // 좋아요 개수 가져오기
  async getLikeCount(storeId: string | number) {
    if (!isSupabaseReady()) return 0;
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);
    
    if (error) throw error;
    return count || 0;
  },

  // 좋아요 누르기
  async addLike(storeId: string | number, userId?: string) {
    if (!isSupabaseReady()) return null;
    const { data, error } = await supabase
      .from('likes')
      .insert([{ store_id: storeId, user_id: userId }])
      .select();

    if (error) throw error;
    return data;
  },

  // 리뷰 가져오기
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

  // 리뷰 등록하기
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

  // 마이페이지: 내가 제보한 목록
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

  // 마이페이지: 내가 응원한 가게들
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

  // 마이페이지: 내가 쓴 리뷰
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

  // 타임라인용: 최근 활동(리뷰 + 새 가게) 가져오기
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

  // 이미지 업로드 기능
  async uploadImage(file: File, bucket: string = 'store-images') {
    if (!isSupabaseReady()) throw new Error('Supabase not initialized.');
    
    // 파일명 중복 방지를 위해 유니크한 이름 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 업로드된 파일의 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
};
