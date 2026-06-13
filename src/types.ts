/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DistributionItem {
  id: string;
  title: string;
  price: string;
  badge: string; // 例: 新刊, 既刊, グッズ, ノベルティ, 無料配布, etc.
  description: string;
  specs: string; // 例: B5/24P/Covers, 50x50mm, etc.
  image: string; // base64データ、または空
}

export type TemplateId = 'aqua_b' | 'vivid' | 'luxury';
export type FontFamilyId = 'sans' | 'serif' | 'mono' | 'fancy' | 'playfair' | 'rounded' | 'dela';
export type AspectRatioId = 'a4' | 'square' | 'b5' | 'sns-horizontal';

export interface OshinakiData {
  eventCode: string; // 例: C104, #にじそうさく11 etc.
  eventTitle: string;
  eventDate: string;
  circleSpace: string; // サークルスペース (e.g., 東1 ホール A-12b)
  circleName: string;
  circleAuthor: string;
  items: DistributionItem[];
  footerNote: string; // お買い物のお願いなど
  templateId: TemplateId;
  fontFamily: FontFamilyId;
  aspectRatio: AspectRatioId;
  gridCols: number; // 1 | 2 | 3
  
  // 特別なノベルティ（特典）セクション
  noveltyEnabled: boolean;
  noveltyTitle: string;
  noveltyDesc: string;
  noveltyImage1: string; // サムネイル1 Base64 / SVG
  noveltyImage2: string; // サムネイル2 Base64 / SVG

  customColors: {
    bg: string;
    cardBg: string;
    primary: string; // メイン・アクセント (青や紫の部分)
    secondary: string; // セカンダリ
    textBase: string; // 通常文字色
    textHeader: string; // ヘッダー文字色
  };

  // 自分で設定可能なヘッダー画像
  headerImage?: string; // base64データ、または空
  headerImageMode?: 'replace' | 'background' | 'none'; // 'replace': 置換、'background': 背景に敷く、'none': なし
  headerImageMirror?: boolean; // 画像を左右反転（ミラーリング）するかどうか
  headerImageOpacity?: number; // 背景画像の不透明度 (10 - 100)
  headerImageBlur?: number; // 背景画像のぼかしぼかし範囲 (0 - 20)
  headerImageOverlayOpacity?: number; // 重ねる半透明カバーの不透明度 (0 - 100)
}
