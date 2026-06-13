/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { OshinakiData } from '../types';
import { Heart, Star, Sparkles, AlertTriangle, BookOpen, Gift, ShoppingBag, Info } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SafeImageProps {
  src: string | undefined | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SafeImage({ src, alt, className, style }: SafeImageProps) {
  if (!src) return null;

  // Check if it is an SVG data URI
  if (src.startsWith('data:image/svg+xml')) {
    let svgContent = '';
    if (src.startsWith('data:image/svg+xml;utf8,')) {
      const raw = src.substring('data:image/svg+xml;utf8,'.length);
      try {
        svgContent = decodeURIComponent(raw);
      } catch {
        svgContent = raw;
      }
    } else if (src.startsWith('data:image/svg+xml;base64,')) {
      const raw = src.substring('data:image/svg+xml;base64,'.length);
      try {
        svgContent = atob(raw);
      } catch {
        // Fallback
      }
    } else if (src.startsWith('data:image/svg+xml,')) {
      const raw = src.substring('data:image/svg+xml,'.length);
      try {
        svgContent = decodeURIComponent(raw);
      } catch {
        svgContent = raw;
      }
    }

    if (svgContent) {
      return (
        <div 
          className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full ${className || ''}`}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={style}
        />
      );
    }
  }

  // Prevent canvas tainting in Chrome under same-origin restrictions inside an iframe.
  // We only omit the crossorigin property for base64 data URIs and blob URLs.
  const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
  const crossOrigin = isDataOrBlob ? undefined : 'anonymous';

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      referrerPolicy="no-referrer" 
      crossOrigin={crossOrigin} 
    />
  );
}

interface OshinakiCanvasProps {
  data: OshinakiData;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export default function OshinakiCanvas({ data, printRef }: OshinakiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const targetWidth = data.aspectRatio === 'sns-horizontal' ? 1000 : 800;
  
  let targetHeight = 1131; // Default A4/B5 ratio (1:1.414) -> 800 * 1.414 = 1131
  if (data.aspectRatio === 'square') {
    targetHeight = 800; // 1:1
  } else if (data.aspectRatio === 'b5') {
    targetHeight = 1131;
  } else if (data.aspectRatio === 'sns-horizontal') {
    targetHeight = 750; // 4:3
  }

  // Handle scaling to fit the preview panel width dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      const containerWidth = containerRef.current?.getBoundingClientRect().width || 400;
      const s = (containerWidth - 32) / targetWidth;
      setScale(Math.max(0.1, Math.min(s, 1.2)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Setup resize observer for dynamic changes
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [data.aspectRatio, targetWidth]);

  // CSS variables for custom colors
  const colorStyles = {
    '--bg-color': data.customColors.bg,
    '--card-bg-dash': data.customColors.cardBg,
    '--primary-color': data.customColors.primary,
    '--secondary-color': data.customColors.secondary,
    '--text-base': data.customColors.textBase,
    '--text-header': data.customColors.textHeader,
  } as React.CSSProperties;

  // Custom Font class selection
  const getFontClass = () => {
    switch (data.fontFamily) {
      case 'dela':
      case 'sans':
        return 'font-sans';
      case 'rounded':
        return 'font-rounded';
      case 'serif':
        return 'font-serif-jp';
      case 'mono':
        return 'font-cyber';
      default:
        return 'font-sans';
    }
  };

  const fontClass = getFontClass();

  // Color helper to determine contrast text
  const isDarkBg = (hexColor: string) => {
    if (!hexColor) return false;
    const c = hexColor.substring(1);
    if (c.length !== 6) return false;
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 120;
  };

  // Render logic based on selection of template
  const renderTemplateStyles = () => {
    const primaryIsDark = isDarkBg(data.customColors.primary);
    const textOnPrimary = primaryIsDark ? '#ffffff' : '#1e293b';

    switch (data.templateId) {
      case 'luxury':
        return {
          wrapper: 'bg-white border-0 relative overflow-hidden',
          wrapperBorderColor: 'transparent',
          header: 'relative p-8 px-10 flex flex-row items-stretch gap-6 min-h-[140px] z-10',
          headerBorderColor: 'transparent',
          headerBg: 'transparent',
          spaceBadge: 'text-xl font-bold tracking-wide shrink-0',
          spaceBadgeColor: data.customColors.primary,
          spaceBadgeBorder: 'transparent',
          circleName: 'text-left font-black tracking-widest text-[#0f172a] uppercase',
          circleAuthor: 'text-slate-400 font-normal text-[10px] tracking-widest uppercase mt-1',
          card: 'bg-white rounded-none border border-slate-200/60 transition-all flex flex-col relative',
          cardBorderColor: '#e2e8f0',
          cardImageWrapper: 'relative overflow-hidden aspect-[4/3] bg-slate-50',
          cardImageBorder: 'transparent',
          cardBadge: 'absolute top-3 left-3 text-[9px] font-bold tracking-widest px-2.5 py-1 text-white uppercase',
          cardBadgeBg: data.customColors.primary,
          cardBadgeBorder: 'transparent',
          cardBadgeText: '#ffffff',
          cardTitle: 'text-sm font-semibold leading-snug tracking-wide text-slate-900 line-clamp-2',
          cardPrice: 'font-sans font-semibold text-lg tracking-tight text-right flex items-baseline justify-end',
          cardPriceSymbol: 'text-xs font-normal mr-0.5 opacity-85',
          cardSpecs: 'text-[9px] font-medium tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 inline-block',
          cardSpecsBg: 'transparent',
          footer: 'p-8 mt-auto bg-transparent border-t border-slate-100',
          footerBorderColor: 'transparent',
          footerBg: 'transparent',
        };

      case 'vivid':
        return {
          wrapper: 'bg-white border-0 relative overflow-hidden',
          wrapperBorderColor: 'transparent',
          header: 'relative p-6 pt-8 pb-4 flex flex-row items-center justify-between min-h-[140px] z-10',
          headerBorderColor: 'transparent',
          headerBg: 'transparent',
          spaceBadge: 'text-lg font-black text-slate-850 bg-yellow-300 px-4 py-2 border-2 border-white rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)] shrink-0',
          spaceBadgeColor: '#fde047',
          spaceBadgeBorder: '#ffffff',
          circleName: 'text-left font-black uppercase tracking-wider',
          circleAuthor: 'text-slate-500 font-bold text-[10px] tracking-wider uppercase mt-1',
          card: 'bg-white rounded-2xl border-4 text-slate-800 transition-all flex flex-col relative shadow-[4px_4px_0px_rgba(0,0,0,0.1)]',
          cardBorderColor: '#ffffff',
          cardImageWrapper: 'relative overflow-hidden aspect-[4/3] rounded-t-xl bg-slate-50',
          cardImageBorder: 'transparent',
          cardBadge: 'absolute top-2.5 left-2.5 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full text-white shadow-sm',
          cardBadgeBg: 'transparent',
          cardBadgeBorder: 'transparent',
          cardBadgeText: '#ffffff',
          cardTitle: 'text-sm font-black leading-snug line-clamp-2 text-slate-900',
          cardPrice: 'font-rounded font-black text-2xl tracking-tight text-right flex items-baseline justify-end',
          cardPriceSymbol: 'text-xs font-black mr-0.5 opacity-80',
          cardSpecs: 'text-[9px] font-black text-purple-705 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full inline-block',
          cardSpecsBg: 'transparent',
          footer: 'p-6 mt-auto bg-transparent',
          footerBorderColor: 'transparent',
          footerBg: 'transparent',
        };

      case 'aqua_b':
        return {
          wrapper: 'bg-white border-0 relative overflow-hidden',
          wrapperBorderColor: 'transparent',
          header: 'relative p-8 px-10 flex flex-col items-start justify-between min-h-[120px] z-10',
          headerBorderColor: 'transparent',
          headerBg: 'transparent',
          spaceBadge: 'text-2xl font-black text-slate-900 tracking-wider font-sans shrink-0',
          spaceBadgeColor: 'transparent',
          spaceBadgeBorder: 'transparent',
          circleName: 'text-left text-slate-800 font-black uppercase tracking-[0.15em] text-3xl',
          circleAuthor: 'text-slate-500 font-medium text-[11px] tracking-wider uppercase mt-1',
          card: 'bg-white transition-all overflow-hidden flex flex-col', // completely white background, clean and spacious, no visible card border/shadow
          cardBorderColor: 'transparent',
          cardImageWrapper: 'relative overflow-hidden aspect-[4/3] bg-transparent', // blank transparent wrap, no border, no outline frame
          cardImageBorder: 'transparent',
          cardBadge: 'absolute top-3 left-3 text-[9px] font-black tracking-widest px-2.5 py-1 text-black bg-white select-none capitalize border border-black/80',
          cardBadgeBg: '#ffffff',
          cardBadgeBorder: 'rgba(0,0,0,0.8)',
          cardBadgeText: '#000000',
          cardTitle: 'text-xl font-extrabold leading-snug text-black tracking-tight',
          cardPrice: 'font-sans font-black text-4xl tracking-tighter text-right flex items-baseline justify-end',
          cardPriceSymbol: 'text-lg font-bold not-italic mr-1',
          cardSpecs: 'text-[10px] font-bold text-black border border-black px-2 py-0.5 bg-white inline-block',
          cardSpecsBg: 'transparent',
          footer: 'p-6 border-t border-slate-100',
          footerBorderColor: 'transparent',
          footerBg: '#ffffff',
        };

      default:
        return {};
    }
  };

  const style = renderTemplateStyles();
  const headTextContrast = isDarkBg(data.customColors.primary) ? '#ffffff' : '#1e293b';

  // Format price helper
  const formatPrice = (priceStr: string) => {
    if (!priceStr) return 'ー';
    const clean = priceStr.replace(/,/g, '').toLowerCase();
    if (clean === 'free' || clean === '無料' || clean === '0' || clean === '無料配布' || clean === 'non-commercial') {
      return priceStr;
    }
    const num = Number(clean);
    return Number.isNaN(num) ? priceStr : num.toLocaleString();
  };

  const isFreePrice = (priceStr: string) => {
    if (!priceStr) return false;
    const clean = priceStr.toLowerCase().replace(/,/g, '');
    return clean === 'free' || clean === '無料' || clean === '0' || clean === '無料配布';
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center items-center overflow-hidden bg-slate-100/60 rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-inner relative select-none animate-fade-in"
      style={{ 
        minHeight: '400px',
        height: `${targetHeight * scale + 48}px`
      }}
      id="oshinaki-preview-wrapper"
    >
      {/* 1. LAGG-FREE 100% REAL-TIME LIVE CSS PREVIEW AREA */}
      <div 
        className="relative flex items-start justify-center overflow-visible shrink-0 transition-all duration-150"
        style={{
          width: `${targetWidth * scale}px`,
          height: `${targetHeight * scale}px`,
        }}
      >
        <div 
          className="absolute top-0 flex items-center justify-center shrink-0"
          style={{
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
          ref={printRef}
          id="oshinaki-print-area"
          className={`${fontClass} ${style.wrapper} w-full h-full flex flex-col shadow-2xl rounded-2xl`}
          style={{
            ...colorStyles,
            borderColor: style.wrapperBorderColor,
            backgroundColor: data.customColors.bg,
            color: data.customColors.textBase,
          }}
        >
          {/* ==================== 0. LUXURY MARBLE BACKDROP ==================== */}
          {data.templateId === 'luxury' && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.22] mix-blend-multiply select-none z-0">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" preserveAspectRatio="none">
                <path d="M-100,50 Q100,200 300,100 T700,400 T900,200" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="300 100" />
                <path d="M-50,250 Q150,400 350,300 T750,600 T950,400" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                <path d="M200,50 Q400,300 500,600 T600,1000" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
                <path d="M-20,700 Q180,850 380,750 T780,1050" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
                <path d="M400,100 Q450,150 480,300" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
                <path d="M300,50 Q150,300 200,600 T100,1100" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
              </svg>
            </div>
          )}



          {data.templateId === 'vivid' && (
            <>
              {/* Pastel rainbow/sunset backdrop gradient */}
              <div 
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background: `linear-gradient(135deg, ${data.customColors.bg} 0%, #e0f2fe 50%, #f3e8ff 100%)`,
                }}
              />
              {/* Random floating bubble & star graphics in background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Sparkly stars ★ ✦ */}
                <span className="absolute top-[120px] left-[40px] text-[34px] text-pink-300 animate-bounce select-none">★</span>
                <span className="absolute top-[280px] right-[50px] text-[26px] text-yellow-300 select-none">✦</span>
                <span className="absolute top-[550px] left-[20px] text-[38px] text-sky-300 select-none">★</span>
                <span className="absolute bottom-[280px] right-[40px] text-[32px] text-pink-300 select-none">✦</span>
                <span className="absolute bottom-[440px] left-[35%] text-[24px] text-indigo-300 select-none">★</span>
                
                {/* Bubbles (translucent aqua/glassy circles) */}
                <div className="absolute top-[160px] right-[20%] w-14 h-14 rounded-full border-4 border-white/40 bg-cyan-200/10 shadow-lg" style={{ filter: 'blur(1px)' }} />
                <div className="absolute top-[420px] left-[15%] w-10 h-10 rounded-full border-2 border-white/60 bg-pink-100/20 shadow-md" />
                <div className="absolute bottom-[220px] left-[45%] w-16 h-16 rounded-full border-4 border-white/50 bg-yellow-105/10 shadow-lg" />
                <div className="absolute bottom-[480px] right-[8%] w-12 h-12 rounded-full border-2 border-white/60 bg-purple-100/20 shadow-sm" />
                
                {/* 3 yellow stars in row at the bottom center to match the visual reference */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-2xl text-yellow-300/80">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>

              {/* Scalloped (wavy) border SVG hanging from the top */}
              <svg className="absolute top-0 left-0 w-full h-[60px] pointer-events-none z-10" viewBox="0 0 1000 60" preserveAspectRatio="none">
                <path 
                  d="M0,0 L1000,0 L1000,20 C975,40 950,40 925,20 C900,40 875,40 850,20 C825,40 800,40 775,20 C750,40 725,40 700,20 C675,40 650,40 625,20 C600,40 575,40 550,20 C525,40 500,40 475,20 C450,40 425,40 400,20 C375,40 350,40 325,20 C300,40 275,40 250,20 C225,40 200,40 175,20 C150,40 125,40 100,20 C75,40 50,40 25,20 C12.5,20 0,10 0,10 Z" 
                  fill={data.customColors.primary} 
                  opacity="0.85" 
                />
                <path 
                  d="M0,0 L1000,0 L1000,10 C975,30 950,30 925,10 C900,30 875,30 850,10 C825,30 800,30 775,10 C750,30 725,30 700,10 C675,30 650,30 625,10 C600,30 575,30 550,10 C525,30 500,30 475,10 C450,30 425,30 400,10 C375,30 350,30 325,10 C300,30 275,30 250,10 C225,30 200,30 175,10 C150,30 125,30 100,10 C75,30 50,30 25,10 C12.5,10 0,5 0,5 Z" 
                  fill="#ffffff" 
                  opacity="0.9" 
                />
              </svg>
            </>
          )}

          {data.templateId === 'aqua_b' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-white">
              {/* Translucent wireframe circles */}
              <div className="absolute top-[12%] left-[-2%] w-[240px] h-[240px] rounded-full border border-black/[0.04]" />
              <div className="absolute top-[45%] right-[-5%] w-[330px] h-[330px] rounded-full border border-black/[0.03]" />
              <div className="absolute bottom-[10%] left-[30%] w-[180px] h-[180px] rounded-full border border-black/[0.03]" />
              
              {/* Dynamic Color Star Sparkles */}
              <span className="absolute top-[18%] left-[45%] text-[32px] select-none" style={{ color: data.customColors.primary }}>✦</span>
              <span className="absolute top-[35%] left-[12%] text-[24px] select-none text-slate-800">✦</span>
              <span className="absolute top-[48%] right-[42%] text-[18px] select-none text-slate-300">✦</span>
              <span className="absolute bottom-[21%] left-[8%] text-[28px] select-none" style={{ color: data.customColors.primary }}>✦</span>
              <span className="absolute bottom-[36%] right-[6%] text-[26px] select-none text-slate-800">✦</span>

              {/* Connecting draft lines */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 800 1131" fill="none" stroke="currentColor">
                <line x1="160" y1="280" x2="430" y2="580" stroke="black" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="680" y1="180" x2="520" y2="340" stroke="black" strokeWidth="1" />
                <circle cx="430" cy="580" r="4" fill="black" />
                <circle cx="520" cy="340" r="4" fill="black" />
              </svg>

              {/* Large abstract text watermark in center background */}
              <div className="absolute top-[32%] right-[-150px] text-[130px] font-black text-slate-900/[0.02] tracking-widest leading-none select-none uppercase rotate-90 whitespace-nowrap">
                {data.circleName || 'JERRY POISON'}
              </div>
            </div>
          )}

          {/* ==================== 2. HEADER AREA ==================== */}
          {data.headerImage && data.headerImageMode === 'replace' ? (
            /* Custom Banner Replace Mode */
            <div 
              className="w-full relative z-10 leading-none select-none overflow-hidden shrink-0 border-b border-slate-200/40"
              style={data.headerImageMirror ? { transform: 'scaleX(-1)' } : undefined}
            >
              <SafeImage 
                src={data.headerImage} 
                alt="Custom Header Banner" 
                className="w-full h-auto object-cover block"
              />
            </div>
          ) : (
            <div className="relative w-full overflow-hidden shrink-0">
              {/* Background Image Mode Overlay */}
              {data.headerImage && data.headerImageMode === 'background' && (
                <div 
                  className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
                  style={data.headerImageMirror ? { transform: 'scaleX(-1)' } : undefined}
                >
                  <SafeImage 
                    src={data.headerImage} 
                    alt="Header Background" 
                    className="w-full h-full object-cover"
                    style={{
                      filter: data.headerImageBlur !== undefined && data.headerImageBlur > 0 ? `blur(${data.headerImageBlur}px)` : undefined,
                      opacity: (data.headerImageOpacity !== undefined ? data.headerImageOpacity : 100) / 100,
                    }}
                  />
                  {/* Smart translucent overlay for maximum text readability adjusted to theme brightness */}
                  {(() => {
                    const isDarkTheme = (data.templateId === 'luxury' && data.customColors.textHeader === '#ffffff');
                    const overlayBgColorClass = isDarkTheme ? 'bg-slate-950' : 'bg-white';
                    const defaultOpacity = isDarkTheme ? 65 : 55;
                    const overlayOp = (data.headerImageOverlayOpacity !== undefined ? data.headerImageOverlayOpacity : defaultOpacity) / 100;
                    return (
                      <div 
                        className={`absolute inset-0 ${overlayBgColorClass}`} 
                        style={{ opacity: overlayOp }}
                      />
                    );
                  })()}
                </div>
              )}
              
              <div className="relative z-10 w-full">
                {data.templateId === 'luxury' ? (
                  /* Template D: Luxury Stylish Box Header */
                  <div className={`w-full p-8 pb-4 flex flex-row items-stretch gap-6 text-left ${data.headerImage && data.headerImageMode === 'background' ? 'bg-transparent' : ''}`}>
                    <div 
                      className="w-[180px] shrink-0 p-5 flex flex-col justify-between text-white relative shadow-md overflow-hidden rounded-xs"
                      style={{ backgroundColor: data.customColors.primary }}
                    >
                      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay">
                        <svg className="w-full h-full" viewBox="0 0 160 200" fill="none" stroke="white" strokeWidth="0.8">
                          <path d="M-10,30 Q80,90 170,120 T250,50" />
                          <path d="M30,120 Q120,40 190,170" />
                        </svg>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[12px] font-black tracking-widest text-slate-300 uppercase font-sans">
                          {data.eventCode || 'MENU'}
                        </p>
                        <p className="text-[11px] font-medium tracking-tight opacity-95 mt-1 truncate font-sans">
                          {data.eventDate || '2024.08.12'}
                        </p>
                      </div>
                      <div className="relative z-10 mt-8">
                        <div className="text-xl sm:text-[23px] font-black tracking-tight leading-tight select-all font-sans break-all">
                          {data.circleSpace || 'シ-65a'}
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider opacity-85 uppercase mt-1 truncate font-sans">
                          {data.circleName || 'CHOCOLATE SHEEP'}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center border-b border-dashed border-slate-300 pb-3">
                      <div className="flex flex-row items-baseline gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3.5xl font-black text-slate-900 tracking-[0.12em] uppercase select-all font-sans">
                          {data.circleName || 'SPECIAL MENU'}
                        </h1>
                        {data.circleAuthor && (
                          <span className="text-[11px] font-light text-slate-500 tracking-wider font-sans">
                            by {data.circleAuthor}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-row items-center gap-3 text-xs text-slate-500 font-medium tracking-wide mt-2 font-sans">
                        <span className="font-extrabold text-slate-950 uppercase">{data.eventTitle || 'COMIC MARKET 100'}</span>
                        <span>|</span>
                        <span>{data.eventDate || '2022.08.14 (SUN)'}</span>
                        <span>|</span>
                        <span className="opacity-80">東京ビッグサイト</span>
                      </div>
                    </div>
                  </div>
                ) : data.templateId === 'vivid' ? (
                  /* Template C: Pop & Vivid 3D Header */
                  <div className={`w-full pt-14 pb-4 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 ${data.headerImage && data.headerImageMode === 'background' ? 'bg-transparent border-0 rounded-none backdrop-blur-none' : ''}`}>
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      {/* 3D Bold Logo title */}
                      <div className="flex flex-col">
                        <h1 
                          className="text-4xl sm:text-[50px] font-black tracking-tight leading-none uppercase select-none drop-shadow-md"
                          style={{ 
                            color: data.customColors.primary,
                            textShadow: '2px 2px 0px #ffffff, 4px 4px 0px rgba(0,0,0,0.1)'
                          }}
                        >
                          {data.circleName || 'VIVID BOX'}
                        </h1>
                        {data.circleAuthor && (
                          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest mt-1 sm:pl-1">
                            {data.circleAuthor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Event rounded badge icon */}
                        {data.eventCode && (
                          <span 
                            className="inline-flex items-center justify-center text-sm font-black text-slate-900 border-2 border-white px-3 py-1 rounded-full shadow-md rotate-[-3deg]"
                            style={{ backgroundColor: data.customColors.secondary }}
                          >
                            {data.eventCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Top-Right set info / decoration text */}
                    <div className="flex flex-col items-center sm:items-end gap-1.5 font-rounded">
                      <div 
                        className="px-4 py-1.5 text-xs font-black text-white rounded-full bg-gradient-to-r from-pink-500 to-rose-450 shadow-md border border-white/50"
                        style={{ backgroundColor: data.customColors.primary }}
                      >
                        新刊 {data.items.length || 6}点セット
                      </div>
                      {data.circleSpace && (
                        <span className="text-xs font-extrabold text-blue-600 bg-white border-2 border-blue-100 px-3 py-1 rounded-full shadow-xs">
                          {data.circleSpace}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Template B: "FAN ART" Clean Gothic Header (fallback is aqua_b) */
                  <div className={`w-full pt-10 pb-6 px-10 flex flex-col items-center justify-center text-center z-10 ${data.headerImage && data.headerImageMode === 'background' ? 'bg-transparent border-b-0' : 'bg-white border-b border-slate-100'}`}>
                    <h1 className="text-5xl sm:text-[68px] font-black text-black tracking-[0.18em] leading-none mb-1 font-sans select-none">
                      FAN ART
                    </h1>
                    <div className="flex items-center gap-3 text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mt-2 font-sans">
                      <span>{data.circleName || 'JERRY POISON'}</span>
                      <span>•</span>
                      <span>{data.eventTitle || '2024.08.12 MENU'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. MAIN DISTRIBUTION LAYOUT ==================== */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto no-scrollbar z-10">
            {data.items.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-20 opacity-50">
                <ShoppingBag className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-bold">頒布物がまだ登録されていません</p>
                <p className="text-sm">左側のエディタパネルから商品を追加してください。</p>
              </div>
            ) : data.templateId === 'luxury' ? (
              /* TEMPLATE D (LUXURY): CENTRAL BIG BANNER + TWO SMALL ITEMS BOTTOM ROW */
              <div className="w-full flex flex-col z-10 text-left select-none gap-6">
                
                {/* 1. MAIN LARGE ITEM / SET AREA AT THE CENTER */}
                <div className="w-full">
                  {(() => {
                    const item = data.items[0] || {
                      title: 'C100新刊セット',
                      price: '2000',
                      badge: 'NEW',
                      description: 'セット内容 ▶ 新刊 ＋ 箔押し紙袋 ＋ ポストカード ＋ 特製アクリルキーホルダー',
                      specs: 'C100 SUMMER EDITION',
                      image: ''
                    };
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/45 p-6 rounded-none border border-slate-100 shadow-xs relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#f8fafc]/40 to-white/70 pointer-events-none z-0" />
                        
                        <div className="md:col-span-5 relative z-10 flex justify-center">
                          <div className="relative max-w-[280px] w-full aspect-[3/4] bg-slate-50 border border-slate-100 shadow-lg overflow-hidden transition-all hover:scale-102">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                                <BookOpen className="w-16 h-16 opacity-40 mb-2" />
                                <span className="text-xs font-sans">No Cover Image</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-7 relative z-10 flex flex-col items-start text-left font-sans">
                          <p className="font-serif italic text-3xl sm:text-4xl tracking-wide text-slate-405 mb-0.5" style={{ fontFamily: "Georgia, serif" }}>
                            New Issue!
                          </p>

                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide select-all leading-tight font-sans">
                            {item.title}
                          </h3>

                          <div 
                            className="mt-3.5 px-5 py-2 text-white font-bold text-xl sm:text-2xl flex items-center justify-center gap-1 shadow-sm font-sans"
                            style={{ backgroundColor: data.customColors.primary }}
                          >
                            {!isFreePrice(item.price) && <span className="text-sm font-medium mr-0.5">¥</span>}
                            <span>{formatPrice(item.price)}</span>
                          </div>

                          {item.specs && (
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-4 font-sans">
                              {item.specs}
                            </span>
                          )}

                          {item.description && (
                            <div className="text-xs text-slate-800 font-medium leading-relaxed mt-3 pt-3 border-t border-slate-100 w-full whitespace-pre-wrap font-sans">
                              {item.description}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })()}
                </div>

                {/* 2. DASHED LINE SEPARATOR */}
                <div className="w-full border-t border-dashed border-slate-300 my-4" />

                {/* 3. LOWER AREA: 2-COLUMN BOTTOM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  <div className="flex flex-col gap-6">
                    {data.items.slice(1).filter((_, idx) => idx % 2 === 0).map((item) => {
                      const isNew = item.badge?.toUpperCase() === 'NEW' || item.badge?.toUpperCase() === '新刊' || item.badge?.toUpperCase() === 'グッズ';
                      return (
                        <div key={item.id} className="bg-white/55 p-5 border border-slate-100 flex flex-row items-start gap-4 text-left relative overflow-hidden transition-all hover:translate-x-0.5">
                          <div className="absolute right-2 top-4 text-[9px] uppercase font-mono tracking-widest text-slate-404 font-bold rotate-90 origin-right whitespace-nowrap">
                            {item.badge ? item.badge.toUpperCase() : (isNew ? 'NEW' : 'ITEM')}
                          </div>

                          <div className="w-[100px] h-[100px] shrink-0 bg-slate-50 border border-slate-105 shadow-xs overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <Gift className="w-8 h-8 text-slate-300 opacity-40 pointer-events-none" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between h-full min-w-0 pr-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate tracking-wide select-all font-sans">
                                {item.title || '頒布物名未入力'}
                              </h4>
                              {item.specs && (
                                <p className="text-[9px] text-slate-400 font-semibold tracking-wider truncate uppercase font-sans">
                                  {item.specs}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1 font-light font-sans">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <div 
                              className="mt-3.5 self-start px-3.5 py-1 text-white text-md font-bold flex items-center justify-center gap-0.5 font-sans"
                              style={{ backgroundColor: data.customColors.primary }}
                            >
                              {!isFreePrice(item.price) && <span className="text-[10px] font-normal">¥</span>}
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-6">
                    {data.items.slice(1).filter((_, idx) => idx % 2 === 1).map((item) => {
                      const isOld = item.badge?.toUpperCase() === 'OLD' || item.badge?.toUpperCase() === '既刊';
                      return (
                        <div key={item.id} className="bg-white/55 p-5 border border-slate-100 flex flex-row items-start gap-4 text-left relative overflow-hidden transition-all hover:translate-x-0.5">
                          <div className="absolute right-2 top-4 text-[9px] uppercase font-mono tracking-widest text-slate-404 font-bold rotate-90 origin-right whitespace-nowrap">
                            {item.badge ? item.badge.toUpperCase() : (isOld ? 'OLD' : 'ITEM')}
                          </div>

                          <div className="w-[100px] h-[100px] shrink-0 bg-slate-50 border border-slate-105 shadow-xs overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-8 h-8 text-slate-300 opacity-40 pointer-events-none" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between h-full min-w-0 pr-4 font-sans">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate tracking-wide select-all font-sans">
                                {item.title || '頒布物名未入力'}
                              </h4>
                              {item.specs && (
                                <p className="text-[9px] text-slate-400 font-semibold tracking-wider truncate uppercase font-sans">
                                  {item.specs}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1 font-light font-sans">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <div 
                              className="mt-3.5 self-start px-3.5 py-1 text-white text-md font-bold flex items-center justify-center gap-0.5 font-sans"
                              style={{ backgroundColor: data.customColors.primary }}
                            >
                              {!isFreePrice(item.price) && <span className="text-[10px] font-normal">¥</span>}
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : data.templateId === 'vivid' ? (
              /* TEMPLATE C (VIVID POP): STAGGERED COLLAGE WITH FLOATING STICKERS */
              <div className="relative w-full z-10 p-2 font-rounded select-none">
                <div className="grid grid-cols-12 gap-6 items-start">
                  
                  {/* Left Big Collage Block */}
                  <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
                    {data.items[1] ? (() => {
                      const item = data.items[1];
                      return (
                        <div 
                          className="relative rounded-3xl p-3 bg-white border-[6px] border-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] rotate-[-1.5deg] flex flex-col justify-between transition-transform transform hover:scale-101 hover:rotate-0 duration-300 group z-10"
                        >
                          {/* Outer Sticker outline ring */}
                          <div className="absolute -inset-2.5 rounded-3.5xl border-[3px] border-dashed pointer-events-none opacity-40" style={{ borderColor: data.customColors.primary }} />

                          {/* Double ring numbering sticker (01) */}
                          <div 
                            className="absolute -top-3.5 -left-3.5 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md z-30 border-4 border-white transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: data.customColors.primary,
                              boxShadow: `0 0 0 4px ${data.customColors.primary}33`
                            }}
                          >
                            01
                          </div>

                          {/* Bold Sticker tag on top-right */}
                          {item.badge && (
                            <div 
                              className="absolute top-4 right-4 z-20 font-black text-xs px-3.5 py-1.5 rounded-full text-white shadow-md rotate-[4deg] tracking-widest uppercase"
                              style={{ backgroundColor: data.customColors.secondary }}
                            >
                              ★ {item.badge}
                            </div>
                          )}

                          {/* Image box with drop shadow inside */}
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none pointer-events-none" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <BookOpen className="w-10 h-10 opacity-60 mb-2" />
                                <span className="text-xs font-black">NO IMAGE</span>
                              </div>
                            )}

                            {/* "オリジナルプレート付き" top decor text mimicking the reference image */}
                            <div className="absolute bottom-3 left-3 bg-black/50 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                              オリジナルデザイン仕様 / Featured Item
                            </div>
                          </div>

                          {/* Info Area */}
                          <div className="p-4 pt-5 text-left flex-1 flex flex-col justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-pink-650 transition-colors">
                                {item.title || '作品名未定義'}
                              </h3>
                              
                              {item.specs && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <span 
                                    className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full inline-block"
                                  >
                                    {item.specs}
                                  </span>
                                </div>
                              )}

                              {item.description && (
                                <p className="text-xs text-slate-500 font-bold leading-relaxed mt-2.5 line-clamp-3">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            {/* Sticky Price Label */}
                            <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-3">
                              <span className="text-[10px] font-black tracking-widest text-slate-400">
                                COLLAGE SPECIAL PRICE
                              </span>
                              <div className="font-rounded font-black text-3xl tracking-tight" style={{ color: data.customColors.primary }}>
                                {!isFreePrice(item.price) && <span className="text-sm font-black mr-0.5 opacity-80">¥</span>}
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })() : data.items[0] ? (() => {
                      const item = data.items[0];
                      return (
                        <div 
                          className="relative rounded-3xl p-3 bg-white border-[6px] border-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] rotate-[-1.5deg] flex flex-col justify-between transition-transform transform hover:scale-101 hover:rotate-0 duration-300 group z-10"
                        >
                          <div className="absolute -inset-2.5 rounded-3.5xl border-[3px] border-dashed pointer-events-none opacity-40" style={{ borderColor: data.customColors.primary }} />

                          <div 
                            className="absolute -top-3.5 -left-3.5 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md z-30 border-4 border-white transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: data.customColors.primary,
                              boxShadow: `0 0 0 4px ${data.customColors.primary}33`
                            }}
                          >
                            01
                          </div>

                          {item.badge && (
                            <div 
                              className="absolute top-4 right-4 z-20 font-black text-xs px-3.5 py-1.5 rounded-full text-white shadow-md rotate-[4deg] tracking-widest uppercase"
                              style={{ backgroundColor: data.customColors.secondary }}
                            >
                              ★ {item.badge}
                            </div>
                          )}

                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <BookOpen className="w-10 h-10 opacity-60 mb-2" />
                                <span className="text-xs font-black">NO IMAGE</span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 pt-5 text-left flex-1 flex flex-col justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-pink-650 transition-colors">
                                {item.title || '作品名未定義'}
                              </h3>
                              {item.specs && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <span className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full inline-block">{item.specs}</span>
                                </div>
                              )}
                              {item.description && (
                                <p className="text-xs text-slate-500 font-bold leading-relaxed mt-2.5 line-clamp-3">{item.description}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-3">
                              <span className="text-[10px] font-black tracking-widest text-slate-400">COLLAGE SPECIAL PRICE</span>
                              <div className="font-rounded font-black text-3xl tracking-tight" style={{ color: data.customColors.primary }}>
                                {!isFreePrice(item.price) && <span className="text-sm font-black mr-0.5 opacity-80">¥</span>}
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })() : null}

                    {/* Novelty Sticker Banner below the main visual */}
                    {data.noveltyEnabled && (
                      <div 
                        className="relative rounded-3xl p-4 bg-white border-[6px] border-white shadow-[0_10px_22px_rgba(0,0,0,0.1)] rotate-[1.2deg] flex flex-col sm:flex-row items-center gap-4 text-left z-10 transition-transform hover:rotate-0 hover:scale-102"
                      >
                        {/* Outer dashes */}
                        <div className="absolute -inset-2 rounded-3.5xl border-[3px] border-dashed pointer-events-none opacity-40" style={{ borderColor: data.customColors.secondary }} />

                        <div className="relative flex-none w-[130px] h-[90px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center">
                          {data.noveltyImage1 ? (
                            <SafeImage src={data.noveltyImage1} alt="Novelty" className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="text-3xl">🎁</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-extrabold tracking-widest text-[#ec4899] bg-pink-50 border border-pink-105 px-2.5 py-0.5 rounded-full uppercase inline-block mb-1.5">
                            ★ SPECIAL BONUSES / 特典
                          </span>
                          <h4 className="text-xs font-black text-slate-800 tracking-tight truncate leading-tight">
                            {data.noveltyTitle}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-normal font-bold mt-1 line-clamp-2">
                            {data.noveltyDesc}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column group of smaller Items */}
                  <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
                    {/* Filter out item 1 (used as large left item), or fallback appropriately */}
                    {data.items.filter((_, idx) => idx !== 1).map((item, index) => {
                      const absoluteIndex = index + 2; // (01 is left, so remaining are 02, 03, 04, 05, 06...)
                      const isEven = absoluteIndex % 2 === 0;
                      
                      return (
                        <div 
                          key={item.id}
                          className="relative rounded-2.5xl p-3 bg-white border-[5px] border-white shadow-[0_10px_22px_rgba(0,0,0,0.1)] flex flex-col justify-between transition-transform transform hover:scale-102 duration-300 group z-10"
                          style={{
                            transform: `rotate(${isEven ? '1.5deg' : '-1.5deg'})`
                          }}
                        >
                          {/* Inner double circular numbered sticker */}
                          <div 
                            className="absolute -top-3.5 -right-3.5 w-11 h-11 rounded-full flex items-center justify-center font-black text-md text-white shadow-md z-30 border-4 border-white transition-transform group-hover:scale-110"
                            style={{ 
                              backgroundColor: data.customColors.primary,
                              boxShadow: `0 0 0 4px ${data.customColors.primary}33`
                            }}
                          >
                            {absoluteIndex.toString().padStart(2, '0')}
                          </div>

                          {/* Image Box */}
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                            {item.image ? (
                              <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none pointer-events-none" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Gift className="w-8 h-8 opacity-65" />
                              </div>
                            )}

                            {/* Specs badge placed over the image exactly to look like stickers */}
                            {item.specs && (
                              <div className="absolute bottom-2 left-2 max-w-[90%]">
                                <span className="text-[9px] font-black bg-white/94 text-slate-800 shadow-xs px-2 py-0.5 rounded-md border border-slate-205/65 truncate inline-block">
                                  {item.specs}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Detail Info area */}
                          <div className="p-3 pt-3.5 text-left flex-1 flex flex-col justify-between gap-2.5">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.badge && (
                                  <span 
                                    className="text-[9px] font-black text-white px-2 py-0.5 rounded-md uppercase shrink-0"
                                    style={{ backgroundColor: data.customColors.secondary }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <h3 className="text-xs font-black text-slate-900 tracking-tight leading-snug group-hover:text-pink-600 transition-colors line-clamp-1 flex-1">
                                  {item.title || '作品名未入力'}
                                </h3>
                              </div>

                              {item.description && (
                                <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1.5 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            {/* Flexible Price details */}
                            <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-2 shrink-0">
                              <span className="text-[8px] font-black tracking-widest text-slate-400">
                                PRICE
                              </span>
                              <div className="font-rounded font-black text-xl tracking-tight" style={{ color: data.customColors.primary }}>
                                {!isFreePrice(item.price) && <span className="text-[11px] font-black mr-0.5 opacity-80">¥</span>}
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            ) : data.templateId === 'aqua_b' ? (
              /* TEMPLATE B (AQUA CLEAR): HIGH-FIDELITY DESIGNED STAGGERED GRID WITH ABSOLUTE COORDINATES */
              <div className="relative w-full h-full bg-white text-black select-none z-10 overflow-hidden">
                
                {/* Slot 1: Top-Left (e.g. Card Stack Layout) */}
                {data.items[1] && (() => {
                  const item = data.items[1];
                  return (
                    <div className="absolute top-[2%] left-[4%] w-[42%] flex flex-col">
                      {/* Stacked multi-card layout mimicking the tilted cards from the reference image */}
                      <div className="relative aspect-[4/3] w-full mb-3">
                        {/* Rear card */}
                        <div className="absolute inset-0 bg-slate-200 opacity-60 rounded-xs border border-black/5 rotate-[-6deg] translate-x-[-12px] translate-y-[-8px] scale-98 shadow-xs" />
                        {/* Middle card border outline */}
                        <div className="absolute inset-0 bg-white rotate-[2deg] translate-x-[4px] translate-y-[2px] scale-98 shadow-xs border border-black/10" />
                        {/* Foreground active card without border/frame */}
                        <div className="absolute inset-0 bg-neutral-100 overflow-hidden rounded-xs shadow-md">
                          {item.image ? (
                            <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <BookOpen className="w-10 h-10 mb-1" />
                              <span className="text-[10px] font-bold tracking-wider">NO IMAGE</span>
                            </div>
                          )}
                        </div>

                        {/* Specs display running vertically on the left edge */}
                        {item.specs && (
                          <div className="absolute top-2 left-[-32px] md:left-[-38px] whitespace-nowrap text-right text-black" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-[10px] font-black tracking-widest uppercase font-sans">
                              {item.specs}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info lines */}
                      <div className="flex flex-col gap-0.5 text-left">
                        {item.badge && (
                          <div className="flex items-center gap-1">
                            <span 
                              className="text-[9px] font-black tracking-wider text-black border border-black bg-white px-1.5 py-0.5 select-none rounded-[2px] uppercase font-sans"
                            >
                              {item.badge}
                            </span>
                            <span className="text-black text-[9px] font-black shrink-0">✦ ✦</span>
                          </div>
                        )}
                        <h3 className="text-[15px] font-black text-black tracking-tight leading-tight mt-1 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 font-bold leading-normal line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price slanted display */}
                      <div className="mt-2.5 flex items-baseline justify-start leading-none font-sans italic font-black text-left shrink-0">
                        {!isFreePrice(item.price) ? (
                          <>
                            <div className="flex flex-col text-right leading-none mr-1.5 translate-y-[2px]">
                              <span className="text-[9px] font-bold not-italic text-slate-400">各</span>
                              <span className="text-xs font-black text-slate-600">¥</span>
                            </div>
                            <span className="text-[44px] tracking-tight leading-none" style={{ color: data.customColors.primary }}>
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[26px] tracking-tight leading-none text-emerald-600 not-italic font-black py-1">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Slot 0: Top-Right Feature Item */}
                {data.items[0] && (() => {
                  const item = data.items[0];
                  return (
                    <div className="absolute top-[2%] right-[4%] w-[42%] flex flex-col">
                      <div className="relative aspect-[3/4.2] bg-neutral-100 overflow-hidden w-full rounded-xs shadow-sm mb-3">
                        {item.image ? (
                          <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <BookOpen className="w-12 h-12 mb-1" />
                            <span className="text-[11px] font-bold tracking-widest">FEATURING IMAGE</span>
                          </div>
                        )}
                        
                        {/* Spec vertical note on left of card */}
                        {item.specs && (
                          <div className="absolute top-2 left-[-24px] md:left-[-30px] whitespace-nowrap text-right text-black font-sans" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-[10px] font-black tracking-widest uppercase">
                              {item.specs}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata info */}
                      <div className="flex flex-col gap-0.5 text-left">
                        {item.badge && (
                          <div className="flex items-center">
                            <span 
                              className="text-[9px] font-black tracking-wider text-black border border-black bg-white px-1.5 py-0.5 select-none rounded-[2px] uppercase font-sans"
                            >
                              {item.badge}
                            </span>
                          </div>
                        )}
                        <h3 className="text-[15px] font-black text-black tracking-tight leading-tight mt-1 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 font-bold leading-normal line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price styling */}
                      <div className="mt-2.5 flex items-baseline justify-end leading-none font-sans italic font-black text-right shrink-0">
                        {!isFreePrice(item.price) ? (
                          <>
                            <div className="flex flex-col text-right leading-none mr-1.5 translate-y-[2px]">
                              <span className="text-[9px] font-black not-italic text-slate-400">各</span>
                              <span className="text-xs font-black text-slate-600">¥</span>
                            </div>
                            <span className="text-[44px] tracking-tight leading-none" style={{ color: data.customColors.primary }}>
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[26px] tracking-tight leading-none text-emerald-600 not-italic font-black py-1">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Slot 2: Middle-Right Ticket Style Grid */}
                {data.items[2] && (() => {
                  const item = data.items[2];
                  return (
                    <div className="absolute top-[51%] right-[4%] w-[26%] flex flex-col z-10">
                      <div className="relative aspect-[1/2.2] bg-neutral-100 overflow-hidden w-full rounded-xs shadow-xs mb-2.5">
                        {item.image ? (
                          <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <BookOpen className="w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black">NO IMAGE</span>
                          </div>
                        )}
                        {/* Specs display vertical */}
                        {item.specs && (
                          <div className="absolute top-2 left-[-20px] whitespace-nowrap text-right text-black font-sans" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-[8.5px] font-bold tracking-widest uppercase">
                              {item.specs}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 text-left">
                        {item.badge && (
                          <div className="flex items-center">
                            <span className="text-[8px] font-black tracking-wider text-black border border-black bg-white px-1 py-0.5 rounded-[1px] uppercase font-sans">
                              {item.badge}
                            </span>
                          </div>
                        )}
                        <h4 className="text-[12px] font-black text-black tracking-tight leading-tight mt-1 truncate">
                          {item.title}
                        </h4>
                      </div>

                      {/* Price slanted display */}
                      <div className="mt-2 flex items-baseline justify-end leading-none font-sans italic font-black text-right shrink-0">
                        {!isFreePrice(item.price) ? (
                          <>
                            <div className="flex flex-col text-right leading-none mr-1 translate-y-[2px]">
                              <span className="text-[8px] font-black not-italic text-slate-400">各</span>
                              <span className="text-[10px] font-black text-slate-600">¥</span>
                            </div>
                            <span className="text-[34px] tracking-tight leading-none" style={{ color: data.customColors.primary }}>
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[20px] tracking-tight leading-none text-emerald-600 not-italic font-black py-1">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Slot 3: Bottom-Left Card item */}
                {data.items[3] && (() => {
                  const item = data.items[3];
                  return (
                    <div className="absolute top-[51%] left-[4%] w-[38%] flex flex-col">
                      <div className="relative aspect-[4/3] w-full mb-3">
                        {/* Rear card background reflection */}
                        <div className="absolute inset-x-[-8px] inset-y-[4px] bg-neutral-200/50 rotate-[3deg] scale-95 border border-black/5 rounded-xs overflow-hidden" />
                        <div className="absolute inset-0 bg-neutral-100 overflow-hidden rounded-xs shadow-md">
                          {item.image ? (
                            <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <BookOpen className="w-8 h-8 mb-1" />
                              <span className="text-[10px] font-bold">NO IMAGE</span>
                            </div>
                          )}
                        </div>

                        {/* Specs display vertical */}
                        {item.specs && (
                          <div className="absolute top-2 left-[-26px] md:left-[-32px] whitespace-nowrap text-right text-black font-sans" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-[9.5px] font-black tracking-widest uppercase">
                              {item.specs}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 text-left">
                        {item.badge && (
                          <div className="flex items-center">
                            <span className="text-[9px] font-black tracking-wider text-black border border-black bg-white px-1.5 py-0.5 rounded-[2px] uppercase font-sans">
                              {item.badge}
                            </span>
                          </div>
                        )}
                        <h3 className="text-[14px] font-black text-black tracking-tight leading-tight mt-1 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[10px] text-slate-500 font-bold leading-normal line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price slanted display */}
                      <div className="mt-2 flex items-baseline justify-start leading-none font-sans italic font-black text-left shrink-0">
                        {!isFreePrice(item.price) ? (
                          <>
                            <div className="flex flex-col text-right leading-none mr-1.5 translate-y-[2px]">
                              <span className="text-[9px] font-bold not-italic text-slate-400">各</span>
                              <span className="text-xs font-black text-slate-600">¥</span>
                            </div>
                            <span className="text-[40px] tracking-tight leading-none" style={{ color: data.customColors.primary }}>
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[24px] tracking-tight leading-none text-emerald-600 not-italic font-black py-1">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Slot 4: Bottom-Right Miniature (Bonus/Postcard spacing) */}
                {data.items[4] && (() => {
                  const item = data.items[4];
                  return (
                    <div className="absolute top-[51%] left-[45%] w-[20%] flex flex-col z-10">
                      <div className="relative aspect-[3/4.2] bg-neutral-100 overflow-hidden w-full rounded-xs shadow-xs mb-2 rotate-[1deg]">
                        {item.image ? (
                          <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover select-none" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <BookOpen className="w-5 h-5 mb-1" />
                            <span className="text-[7.5px] font-black">NO IMAGE</span>
                          </div>
                        )}
                        {/* Specs display vertical */}
                        {item.specs && (
                          <div className="absolute top-1 left-[-18px] whitespace-nowrap text-right text-black font-sans" style={{ writingMode: 'vertical-rl' }}>
                            <span className="text-[8px] font-bold tracking-widest uppercase">
                              {item.specs}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 text-left leading-tight">
                        <h4 className="text-[12px] font-black text-black tracking-tight leading-tight truncate">
                          {item.title}
                        </h4>
                      </div>

                      {/* Price display */}
                      <div className="mt-1.5 flex items-baseline justify-start leading-none font-sans italic font-black text-left shrink-0">
                        {!isFreePrice(item.price) ? (
                          <>
                            <div className="flex flex-col text-right leading-none mr-1 translate-y-[2px]">
                              <span className="text-[8px] font-bold not-italic text-slate-400">各</span>
                              <span className="text-[9px] font-black text-slate-600">¥</span>
                            </div>
                            <span className="text-[30px] tracking-tight leading-none" style={{ color: data.customColors.primary }}>
                              {formatPrice(item.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[18px] tracking-tight leading-none text-emerald-600 not-italic font-black">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            ) : (
              /* TRADITIONAL COLUMN LAYOUT FOR OTHER TEMPLATES */
              <div 
                className="grid gap-6 md:gap-8" 
                style={{
                  gridTemplateColumns: `repeat(${data.gridCols}, minmax(0, 1fr))`,
                }}
              >
                {data.items.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={style.card}
                      style={{
                        borderColor: style.cardBorderColor,
                        backgroundColor: data.customColors.cardBg,
                      }}
                    >
                      <div className={style.cardImageWrapper} style={{ borderColor: style.cardImageBorder }}>
                        {item.image ? (
                          <SafeImage
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center opacity-70">
                            {item.badge === 'グッズ' ? (
                              <Gift className="w-16 h-16 text-slate-300" />
                            ) : (
                              <BookOpen className="w-16 h-16 text-slate-300" />
                            )}
                          </div>
                        )}

                        {item.badge && (
                          <div
                            className={style.cardBadge}
                            style={{
                              backgroundColor: style.cardBadgeBg || data.customColors.primary,
                              borderColor: style.cardBadgeBorder || 'transparent',
                              color: style.cardBadgeText || '#ffffff',
                            }}
                          >
                            {item.badge}
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-xs px-2 py-0.5 rounded backdrop-blur-xs">
                          #{(index + 1).toString().padStart(2, '0')}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between text-left gap-3">
                        <div className="space-y-1">
                          <h3 className={style.cardTitle}>
                            {item.title || '頒布物名未入力'}
                          </h3>
                          
                          {item.specs && (
                            <div className="flex flex-wrap gap-1">
                              <span 
                                className={style.cardSpecs}
                                style={{ backgroundColor: style.cardSpecsBg }}
                              >
                                {item.specs}
                              </span>
                            </div>
                          )}

                          {item.description && (
                            <p className="text-xs opacity-80 mt-2 line-clamp-3 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div 
                          className={style.cardPrice}
                          style={{
                            color: data.customColors.primary
                          }}
                        >
                          {!isFreePrice(item.price) && <span className={style.cardPriceSymbol}>¥</span>}
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ==================== 4. FOOTER NOTE AREA ==================== */}
          {data.footerNote && data.templateId !== 'aqua_b' && (
            data.templateId === 'luxury' ? (
              <div className="w-full px-8 pb-8 pt-4 mt-auto border-t border-slate-200/60 z-10 bg-transparent">
                <div className="flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[10px] text-slate-500 font-medium tracking-wide">
                  {data.footerNote.split('\n').filter(line => line.trim().length > 0).map((line, idx) => {
                    const cleanLine = line.replace(/^[★▶\-*•\s]+/, '').trim();
                    return (
                      <div key={idx} className="flex items-center gap-1 font-sans">
                        <span className="text-slate-900 select-none">▶</span>
                        <span>{cleanLine}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`${style.footer} z-10`}
                style={{
                  borderColor: style.footerBorderColor,
                  backgroundColor: style.footerBg,
                }}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 text-sm text-slate-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>主催からのお願い・お知らせ</span>
                </div>
                <div className="text-xs leading-relaxed whitespace-pre-wrap opacity-90 font-medium break-all text-left">
                  {data.footerNote}
                </div>
              </div>
            )
          )}

          {/* ==================== 5. TEMPLATE B CUSTOM FOOTER ==================== */}
          {data.templateId === 'aqua_b' && (
            <div className="mt-auto border-t border-slate-100 flex flex-row items-center justify-between bg-white z-10 w-full p-8 px-10">
              {/* Left footer: big grey event code and date */}
              <div className="flex items-center gap-4 text-left">
                <span className="text-[52px] font-black text-slate-300 leading-none tracking-tight select-none font-sans">
                  {data.eventCode || 'C100'}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black tracking-widest text-[#a1a1aa] uppercase font-sans">
                    DATE & MENU
                  </span>
                  <span className="text-lg font-black text-black tracking-wide leading-none mt-1 font-sans">
                    {data.eventDate ? `${data.eventDate} MENU` : '2024.08.12 MENU'}
                  </span>
                </div>
              </div>

              {/* Central optional text (e.g., footerNote) */}
              {data.footerNote && (
                <div className="hidden md:block max-w-[250px] text-left">
                  <span className="text-[9px] font-black tracking-widest text-[#a1a1aa] uppercase font-sans">
                    INFORMATION
                  </span>
                  <p className="text-[10px] font-bold text-[#52525b] leading-normal line-clamp-2 mt-0.5">
                    {data.footerNote}
                  </p>
                </div>
              )}

              {/* Right footer: Circle space ID + QR code */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-black tracking-widest text-[#a1a1aa] uppercase font-sans">
                    SPACE ID
                  </span>
                  <span className="text-2xl font-black text-black tracking-tight leading-none mt-1 font-sans">
                    {data.circleSpace || '東1 01ab'}
                  </span>
                </div>

                {/* Clean inline QR Code placeholder */}
                <div className="w-14 h-14 bg-white border border-slate-200 p-1 rounded-sm flex items-center justify-center shrink-0 shadow-2xs">
                  <svg className="w-full h-full text-black opacity-85" viewBox="0 0 29 29" fill="currentColor">
                    <path d="M0,0 h9 v9 h-9 z M1,1 h7 v7 h-7 z M3,3 h3 v3 h-3 z M20,0 h9 v9 h-9 z M21,1 h7 v7 h-7 z M23,3 h3 v3 h-3 z M0,20 h9 v9 h-9 z M1,21 h7 v7 h-7 z M3,23 h3 v3 h-3 z M12,2 h2 v2 h-2 z M15,4 h2 v1 h-2 z M11,11 h3 v3 h-3 z M16,13 h3 v2 h-3 z M12,17 h4 v2 h-4 z M23,12 h4 v3 h-4 z M21,21 h2 v2 h-2 z M24,24 h4 v4 h-4 z M20,27 h2 v2 h-2 z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
