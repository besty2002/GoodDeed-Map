export type Category = '飲食店' | 'カフェ' | 'ベーカリー' | '和食' | '洋食' | '花屋' | 'その他';

export type Region = '東京都' | '大阪府' | '神奈川県' | '愛知県' | '福岡県' | '北海道' | 'その他';

export type DeedType = '高齢者支援' | '子供支援' | '環境保護' | '障がい者支援' | '地域貢献' | '寄付・譲渡' | 'その他';

export type SourceType = 'SNS' | 'News' | 'TV' | 'Blog' | 'Other';

export interface Source {
  id: string | number;
  type: SourceType;
  url: string;
  title: string;
}

export interface Store {
  id: string | number;
  name: string;
  region: Region;
  category: Category;
  deed_type?: DeedType;
  address?: string;
  summary: string;
  description: string;
  thumbnail_url?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  sources: Source[];
  created_at: string;
}
