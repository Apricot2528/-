/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OshinakiData } from './types';

// Artistic, transparent fluid vector designs styled exactly to look like "JERRY POISON" (blue, turquoise, purple, light particles, starry glows)
export const PLACEHOLDER_IMAGES = {
  // B5 24P Illustration book: Beautiful blue & cyan gradient with bubble patterns, high contrast
  aquaBook1: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%2360a5fa" />
        <stop offset="40%" stop-color="%238b5cf6" />
        <stop offset="100%" stop-color="%23ec4899" />
      </linearGradient>
      <radialGradient id="g2" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="300" height="420" fill="url(%23g1)"/>
    <rect width="300" height="420" fill="url(%23g2)"/>
    <!-- Overlapping translucent glass circle -->
    <circle cx="150" cy="180" r="90" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.25" stroke-width="2"/>
    <!-- Bubbles -->
    <circle cx="70" cy="120" r="15" fill="none" stroke="white" stroke-opacity="0.4" stroke-width="1.5"/>
    <circle cx="220" cy="240" r="25" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="2"/>
    <circle cx="120" cy="260" r="8" fill="none" stroke="white" stroke-opacity="0.5" stroke-width="1"/>
    <!-- Star elements -->
    <path d="M 150 110 L 153 125 L 168 128 L 153 131 L 150 146 L 147 131 L 132 128 L 147 125 Z" fill="white" fill-opacity="0.8"/>
    <path d="M 80 280 L 82 288 L 90 290 L 82 292 L 80 300 L 78 292 L 70 290 L 78 288 Z" fill="white" fill-opacity="0.6"/>
    <!-- Jellyfish conceptual lines -->
    <path d="M120,180 Q150,150 180,180 Q190,210 180,240 T150,280 T120,240 Z" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.3" stroke-width="1.5"/>
    <!-- Flowing typography -->
    <text x="150" y="340" font-family="'Helvetica Neue', sans-serif" font-size="28" font-weight="900" fill="white" letter-spacing="4" text-anchor="middle">JERRY</text>
    <text x="150" y="375" font-family="'Helvetica Neue', sans-serif" font-size="28" font-weight="900" fill="white" letter-spacing="4" text-anchor="middle">POISON</text>
    <text x="150" y="200" font-family="'Courier New', monospace" font-size="12" fill="white" fill-opacity="0.8" letter-spacing="2" text-anchor="middle">ILLUSTRATION BOOK</text>
    <text x="150" y="45" font-family="sans-serif" font-size="10" fill="white" fill-opacity="0.6" text-anchor="middle">006 × NEKOME TOWORU</text>
    <line x1="100" y1="55" x2="200" y2="55" stroke="white" stroke-opacity="0.4" stroke-width="1"/>
  </svg>`,

  // Postcard: cyan/blue wave patterns
  aquaPostcard: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="%233b82f6" />
        <stop offset="100%" stop-color="%2322d3ee" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" fill="url(%23g3)"/>
    <rect x="10" y="10" width="280" height="180" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="1"/>
    <!-- Floating particles -->
    <circle cx="90" cy="60" r="18" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.3"/>
    <circle cx="210" cy="140" r="30" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.2"/>
    <path d="M 50,150 C 100,100 200,200 250,150" fill="none" stroke="white" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round"/>
    <text x="150" y="105" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="3" text-anchor="middle">CLEAR POSTCARD</text>
    <text x="150" y="130" font-family="sans-serif" font-size="9" fill="white" fill-opacity="0.8" text-anchor="middle">Special Transparent Printing</text>
  </svg>`,

  // Tall Ticket Clear Card: violet-ocean waves
  aquaTicket: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="320" viewBox="0 0 150 320">
    <defs>
      <linearGradient id="g4" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%234f46e5" />
        <stop offset="50%" stop-color="%23818cf8" />
        <stop offset="100%" stop-color="%23c084fc" />
      </linearGradient>
    </defs>
    <rect width="150" height="320" rx="10" fill="url(%23g4)"/>
    <rect x="8" y="8" width="134" height="304" rx="6" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="1.5"/>
    <circle cx="75" cy="120" r="40" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8,4"/>
    <circle cx="45" cy="200" r="5" fill="white" fill-opacity="0.5"/>
    <circle cx="105" cy="80" r="8" fill="white" fill-opacity="0.3"/>
    <text x="75" y="270" font-family="sans-serif" font-size="13" font-weight="900" fill="white" letter-spacing="2" text-anchor="middle">CLEAR CARD</text>
    <text x="75" y="290" font-family="sans-serif" font-size="8" fill="white" fill-opacity="0.7" text-anchor="middle">TICKET SIZE</text>
  </svg>`,

  // Pansy Girl: beautiful water purple colors
  aquaPansy: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="300" viewBox="0 0 220 300">
    <defs>
      <linearGradient id="g5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23a78bfa" />
        <stop offset="100%" stop-color="%23f472b6" />
      </linearGradient>
    </defs>
    <rect width="220" height="300" fill="url(%23g5)"/>
    <circle cx="110" cy="130" r="65" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.3"/>
    <path d="M110 90 L115 105 L130 110 L115 115 L110 130 L105 115 L90 110 L105 105 Z" fill="white" fill-opacity="0.9"/>
    <!-- Flower circles conceptual -->
    <circle cx="75" cy="140" r="15" fill="%23f472b6" fill-opacity="0.5" stroke="white" stroke-opacity="0.5"/>
    <circle cx="145" cy="140" r="15" fill="%237c3aed" fill-opacity="0.4" stroke="white" stroke-opacity="0.5"/>
    <text x="110" y="240" font-family="'Georgia', serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">PANSY GIRL</text>
    <text x="110" y="265" font-family="sans-serif" font-size="9" fill="white" fill-opacity="0.8" text-anchor="middle">Personal Illustration Book</text>
  </svg>`,

  // Double overlapping tarot/secret novelties with a gradient and "?" query mark on them
  noveltyMystery: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">
    <defs>
      <linearGradient id="cardG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%2338bdf8" />
        <stop offset="100%" stop-color="%23b779f3" />
      </linearGradient>
    </defs>
    <!-- Left overlay card -->
    <g transform="rotate(-15, 45, 60)">
      <rect x="15" y="10" width="60" height="90" rx="4" fill="url(%23cardG)" stroke="white" stroke-width="1.5" shadow="0 4px 6px rgba(0,0,0,0.3)"/>
      <rect x="20" y="15" width="50" height="80" rx="2" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="3,1.5"/>
      <text x="45" y="60" font-family="'Helvetica Neue', sans-serif" font-size="24" font-weight="900" fill="white" text-anchor="middle">?</text>
    </g>
    <!-- Right overlapping card -->
    <g transform="rotate(10, 105, 60)">
      <rect x="75" y="15" width="60" height="90" rx="4" fill="url(%23cardG)" stroke="white" stroke-width="1.5" shadow="0 4px 6px rgba(0,0,0,0.3)"/>
      <rect x="80" y="20" width="50" height="80" rx="2" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="3,1.5"/>
      <text x="105" y="65" font-family="'Helvetica Neue', sans-serif" font-size="24" font-weight="900" fill="white" text-anchor="middle">?</text>
    </g>
  </svg>`
};

export const SAMPLE_OSHINAKI: OshinakiData = {
  eventCode: 'C100',
  eventTitle: 'コミックマーケット2日目',
  eventDate: '2024.08.12',
  circleSpace: '東1 01ab',
  circleName: 'Circlename',
  circleAuthor: 'Name',
  footerNote: '★ 開場直後の混雑時は小銭へのご協力をお願いします。\n★ 会場限定特典（クリアしおり・ショッパー）は先着順となり、無くなり次第配布終了いたします。\n★ 本イベントにて頒布した作品は、すべてBOOTHにて自家オンライン通販を予定しております。',
  templateId: 'aqua_b',
  fontFamily: 'sans',
  aspectRatio: 'a4',
  gridCols: 2,
  
  // Dedicated overlay novelty item
  noveltyEnabled: true,
  noveltyTitle: 'イラスト名刺セット（シークレット）',
  noveltyDesc: 'イラスト本をお買い上げの方限定で、006と猫目トヲルのイラスト名刺2種セットをプレゼントいたします！デザインは当日までシークレットお楽しみ。',
  noveltyImage1: PLACEHOLDER_IMAGES.noveltyMystery,
  noveltyImage2: '',

  // 自分で設定可能なヘッダー画像
  headerImage: '',
  headerImageMode: 'none',
  headerImageMirror: false,

  customColors: {
    bg: '#ffffff',
    cardBg: '#eef2ff70', // Transparent lavender-white block
    primary: '#1e40af',  // Transparent Deep Ocean Blue (600/800 range)
    secondary: '#8b5cf6', // Indigo Violet
    textBase: '#0f172a',  // Warm charcoal
    textHeader: '#1e293b',
  },
  items: [
    {
      id: '1',
      title: 'Title',
      price: '1000',
      badge: 'new',
      description: '猫目トヲルと006による、澄んだ「水」と、きらめく「毒（ジェリー）」を連想する幻想世界の少女たちを凝縮した、至極の合同フルカラー画集。',
      specs: 'B5 / 24P / フルカラー / 特殊クリア箔押し表紙',
      image: PLACEHOLDER_IMAGES.aquaBook1,
    },
    {
      id: '2',
      title: 'クリアポストカード (JERRY POISON)',
      price: '200',
      badge: 'new',
      description: 'アクリルやガラスのような透明度に加え、星々の装飾が光に照らされてキラキラ浮かび上がる美しいクリアポストカードです。キャラ部以外が透ける仕様です。',
      specs: 'ポストカードサイズ / 厚手高透明PP製 / 片面特殊クリア印刷',
      image: PLACEHOLDER_IMAGES.aquaPostcard,
    },
    {
      id: '3',
      title: 'クリアカード (大きめチケットサイズ)',
      price: '200',
      badge: 'new',
      description: '縦長フォルムがシックな、読書用しおりやスマホケースの着せ替えに大人気の透明アートクリアカード。',
      specs: 'チケットサイズ / 縦長クリア特殊印刷仕様 / 数量極少',
      image: PLACEHOLDER_IMAGES.aquaTicket,
    },
    {
      id: '4',
      title: 'PANSY GIRL (猫目トヲル個人新刊イラスト集)',
      price: '1000',
      badge: 'old',
      description: '「パンジー」のように可憐で毒気のある少女たちの装飾・おめかしシーンを結集した、猫目トヲルの個人新刊イラストまとめ本。極小の残り部数となります。',
      specs: 'A5 / 20P / フルカラーイラスト本 / 既刊',
      image: PLACEHOLDER_IMAGES.aquaPansy,
    }
  ]
};

// Return template-specific default colors
export const getTemplateDefaults = (templateId: string) => {
  switch (templateId) {
    case 'aqua_b':
      return {
        bg: '#ffffff',
        cardBg: '#ffffff', // pure white card
        primary: '#000000',  // Pure Black basis
        secondary: '#ef4444', // vibrant red accent, customizable
        textBase: '#000000', // black text
        textHeader: '#000000',
      };
    case 'vivid':
      return {
        bg: '#f3e8ff', // Soft violet pastel
        cardBg: '#ffffff',
        primary: '#3b82f6', // Vivid custom color
        secondary: '#fb7185', // Accent light pink
        textBase: '#1e1b4b', // deep violet-slate
        textHeader: '#1e1b4b',
      };
    case 'luxury':
      return {
        bg: '#f8fafc', // Very thin elegant slate gray
        cardBg: '#ffffff',
        primary: '#1e293b', // Luxurious dark slate/black box
        secondary: '#64748b', // Accent charcoal
        textBase: '#020617', // Sharp dark slate
        textHeader: '#ffffff',
      };
    default:
      return {
        bg: '#ffffff',
        cardBg: '#ffffff',
        primary: '#2563eb',
        secondary: '#a855f7',
        textBase: '#0f172a',
        textHeader: '#0f172a',
      };
  }
};

/**
 * Converts svg+xml;utf8 data URIs into base64 data URIs.
 * This guarantees that html2canvas will render them correctly
 * without raising taint exceptions or ignoring unencoded SVG characters.
 */
export const convertSvgToHtml2canvasFriendly = (imgUrl: string | undefined | null): string => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('data:image/svg+xml;utf8,')) {
    const svgContent = imgUrl.substring('data:image/svg+xml;utf8,'.length);
    try {
      const decoded = decodeURIComponent(svgContent);
      const base64 = btoa(unescape(encodeURIComponent(decoded)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
      return imgUrl;
    }
  } else if (imgUrl.startsWith('data:image/svg+xml,')) {
    const svgContent = imgUrl.substring('data:image/svg+xml,'.length);
    try {
      const decoded = decodeURIComponent(svgContent);
      const base64 = btoa(unescape(encodeURIComponent(decoded)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
      return imgUrl;
    }
  }
  return imgUrl;
};

/**
 * Converts OKLCH color space to sRGB color space.
 * This is based on standard W3C Color Level 4 conversion algorithm.
 */
export function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // If Hue is NaN or undefined, default to 0
  if (isNaN(h) || h === undefined) {
    h = 0;
  }
  // Convert hue from degrees to radians
  const hRad = (h * Math.PI) / 180;
  const lab_a = c * Math.cos(hRad);
  const lab_b = c * Math.sin(hRad);

  // OKLAB to LMS
  const l_ = l + 0.3963377774 * lab_a + 0.2158037573 * lab_b;
  const m_ = l - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
  const s_ = l - 0.0894841775 * lab_a - 1.2914855480 * lab_b;

  // LMS linear
  const l_cube = l_ * l_ * l_;
  const m_cube = m_ * m_ * m_;
  const s_cube = s_ * s_ * s_;

  // LMS to linear sRGB
  const r_lin = +4.0767245293 * l_cube - 3.3072168827 * m_cube + 0.2307590544 * s_cube;
  const g_lin = -1.2681437731 * l_cube + 2.6093323231 * m_cube - 0.3411344290 * s_cube;
  const b_lin = -0.0041119885 * l_cube - 0.7034763098 * m_cube + 1.7068272510 * s_cube;

  // Linear sRGB to standard sRGB (with gamma correction)
  const gamma = (val: number) => {
    if (isNaN(val)) return 0;
    return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1.0 / 2.4) - 0.05;
  };

  const r = Math.max(0, Math.min(255, Math.round(gamma(r_lin) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(gamma(g_lin) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(gamma(b_lin) * 255)));

  return [r, g, b];
}

/**
 * Parses and replaces any CSS rule containing "oklch(...)" with standard "rgb(...)" or "rgba(...)" color codes.
 * This prevents html2canvas parser crashes in environments loaded with Tailwind v4.
 */
export function convertOklchInCss(cssText: string): string {
  // Matches "oklch(L C H)" or "oklch(L C H / alpha)"
  // Supports percentages (like 96.8%), degrees (like 150deg or just 150), and various spacings
  const regex = /oklch\(\s*([0-9.]+%?)\s+([0-9.%]+)\s+([0-9.]+(?:deg)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi;

  return cssText.replace(regex, (match, lStr, cStr, hStr, aStr) => {
    try {
      // Parse Lightness
      let l = parseFloat(lStr);
      if (lStr.includes('%')) {
        l = l / 100;
      }

      // Parse Chroma
      let c = parseFloat(cStr);
      if (cStr.includes('%')) {
        c = c / 100;
      }

      // Parse Hue (ignores "deg" string suffix)
      const h = parseFloat(hStr);

      // Parse Alpha (optional)
      let alpha = 1;
      if (aStr) {
        alpha = parseFloat(aStr);
        if (aStr.includes('%')) {
          alpha = alpha / 100;
        }
      }

      // Convert OKLCH to standard RGB
      const [r, g, b] = oklchToRgb(l, c, h);

      if (alpha === 1) {
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    } catch (e) {
      console.warn('Failed to convert oklch color:', match, e);
      return 'rgb(0, 0, 0)'; // Return black as safe fallback
    }
  });
}

