# 善行マップ (GoodDeed Map Japan) プロジェクト青写真

## 1. プロジェクト概要
SNS、ニュース、テレビなどで紹介された、善行（良い行い）を行っているお店を地域別・カテゴリー別に探せるサービスです。あたたかいエピソードがあるお店を応援し、ユーザーが直接投稿できるプラットフォームを目指します。

## 2. 技術スタック
- **Frontend:** React + TypeScript (Strict)
- **Routing:** React Router DOM
- **Backend/Database:** Supabase (Auth, DB, Realtime)
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages
- **Icons:** Lucide React

## 3. 主要データモデル (Database Schema)

### 3.1 `stores` (店舗情報)
- `id` (uuid, PK)
- `name` (text): 店名
- `category` (text): 飲食店、カフェ、ベーカリーなど
- `address` (text): 住所
- `region` (text): 都道府県・地域
- `summary` (text): 善行エピソードの要約
- `description` (text): 詳細内容
- `thumbnail_url` (text): 代表画像
- `map_url` (text): 地図リンク
- `created_at` (timestamp)

### 3.2 `sources` (出典・ソース)
- `id` (uuid, PK)
- `store_id` (uuid, FK references stores.id)
- `type` (text): SNS、ニュース、テレビ、ブログなど
- `url` (text): 出典URL
- `title` (text): 記事タイトルまたは投稿タイトル

### 3.3 `reports` (ユーザー投稿)
- `id` (uuid, PK)
- `store_name` (text)
- `url` (text): 出典URL
- `comment` (text): 補足説明
- `status` (text): pending(待機中), approved(承認済み), rejected(却下)
- `user_id` (uuid, FK references profiles.id)
- `created_at` (timestamp)

## 4. MVP 機能実装計画

### Phase 1: 基盤設定 (完了)
- [x] プロジェクト構造の設定とライブラリ導入
- [x] Tailwind CSS v4 の設定
- [x] 日本語ローカライズ (UI/UX)

### Phase 2: メインUIと検索
- [ ] ホーム画面 (ヒーローセクション + フィルタリング + 店舗リスト)
- [ ] 検索機能 (キーワード、地域、カテゴリー)
- [ ] 店舗カードコンポーネントの実装

### Phase 3: 詳細ページと投稿機能
- [ ] 店舗詳細ビュー (エピソード要約、出典リスト)
- [ ] ユーザー投稿フォーム (URLベース)
- [ ] 認証システム (Supabase Auth)

### Phase 4: 管理者機能と高度化
- [ ] 投稿管理ページ (承認/却下プロセス)
- [ ] 地図連携 (Google Maps / Mapbox)
- [ ] レスポンシブ最適化とデプロイ (Cloudflare)

## 5. スタイル・デザインガイド
- **Color Palette:** 温かみと信頼感のある配色 (Warm Orange, Deep Blue, Soft Gray)
- **Typography:** 読みやすい Sans-serif (Noto Sans JP など)
- **UI Components:** カードベースのレイアウト、明確なアクションボタン
