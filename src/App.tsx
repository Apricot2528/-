/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  SAMPLE_OSHINAKI, 
  getTemplateDefaults, 
  PLACEHOLDER_IMAGES 
} from './sampleData';
import { OshinakiData, DistributionItem, TemplateId, FontFamilyId, AspectRatioId } from './types';
import OshinakiCanvas from './components/OshinakiCanvas';
import ImageCropperModal from './components/ImageCropperModal';
import ExportModal from './components/ExportModal';
import html2canvas from 'html2canvas';

import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Download, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Image as ImageIcon, 
  Check, 
  FileText, 
  Palette, 
  Layers, 
  BookOpen, 
  HelpCircle,
  RefreshCw,
  Info,
  Gift
} from 'lucide-react';

const STORAGE_KEY = 'oshinaki_maker_data_v1';

// Base64 Image Compression to keep local storage light (< 3MB)
const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize down to maximum 500px on the longest edge
        const MAX_DIM = 500;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82); // Compresses efficiently
          resolve(compressed);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [data, setData] = useState<OshinakiData>(SAMPLE_OSHINAKI);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(0);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OshinakiData;
        // Fix for backward compatibility or missing values
        if (!parsed.customColors) {
          parsed.customColors = getTemplateDefaults(parsed.templateId || 'aqua_b');
        }
        if (!parsed.fontFamily) parsed.fontFamily = 'sans';
        if (!parsed.aspectRatio) parsed.aspectRatio = 'a4';
        if (!parsed.gridCols) parsed.gridCols = 2;
        if (parsed.noveltyEnabled === undefined) {
          parsed.noveltyEnabled = true;
          parsed.noveltyTitle = 'イラスト名刺セット（シークレット）';
          parsed.noveltyDesc = 'イラスト本をお買い上げの方限定で、006と猫目トヲルのイラスト名刺2種セットをプレゼントいたします！';
          parsed.noveltyImage1 = PLACEHOLDER_IMAGES.noveltyMystery;
          parsed.noveltyImage2 = '';
        }
        if (!parsed.eventCode) parsed.eventCode = 'C104';
        if (parsed.headerImage === undefined) parsed.headerImage = '';
        if (parsed.headerImageMode === undefined) parsed.headerImageMode = 'none';
        if (parsed.headerImageMirror === undefined) parsed.headerImageMirror = false;
        if (parsed.headerImageOpacity === undefined) parsed.headerImageOpacity = 100;
        if (parsed.headerImageBlur === undefined) parsed.headerImageBlur = 0;
        if (parsed.headerImageOverlayOpacity === undefined) parsed.headerImageOverlayOpacity = 55;
        setData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data, loading default', e);
        setData(SAMPLE_OSHINAKI);
      }
    } else {
      setData(SAMPLE_OSHINAKI);
    }
  }, []);

  // Save to LocalStorage automatically when data changes
  useEffect(() => {
    if (data !== SAMPLE_OSHINAKI) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Show a temporary toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Preset quick change
  const handleTemplateChange = (templateId: TemplateId) => {
    const defaults = getTemplateDefaults(templateId);
    let newFont: FontFamilyId = 'sans';
    if (templateId === 'aqua_b') newFont = 'sans';
    if (templateId === 'vivid') newFont = 'rounded';
    if (templateId === 'luxury') newFont = 'sans';

    setData(prev => ({
      ...prev,
      templateId,
      fontFamily: newFont,
      customColors: defaults
    }));
    showToast(`テンプレートを「${
      templateId === 'aqua_b' ? 'テンプレートB (アクア・クリア)' :
      templateId === 'vivid' ? 'テンプレートC (ビビッド・ボックス)' : 'テンプレートD (スタイリッシュ・ラグジュアリー)'
    }」に切り替え、カラーも最適化しました！`);
  };

  // Color modification
  const handleColorChange = (key: keyof OshinakiData['customColors'], val: string) => {
    setData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [key]: val
      }
    }));
  };

  const resetColorsToDefault = () => {
    const defaults = getTemplateDefaults(data.templateId);
    setData(prev => ({
      ...prev,
      customColors: defaults
    }));
    showToast('配色のカスタマイズを初期色（デフォルト）に戻しました。');
  };

  // Handle Form changes
  const handleMetaChange = (key: keyof OshinakiData, val: any) => {
    setData(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Add Item
  const handleAddItem = () => {
    const newItem: DistributionItem = {
      id: Date.now().toString(),
      title: '',
      price: '',
      badge: '新刊',
      description: '',
      specs: '',
      image: ''
    };
    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setActiveItemIndex(data.items.length); // Open the newly added item
    showToast('新しく頒布物を追加しました！下部にフォームが追加されています。');
  };

  // Delete Item
  const handleDeleteItem = (indexToDelete: number) => {
    if (window.confirm('この頒布物を削除してもよろしいですか？')) {
      setData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== indexToDelete)
      }));
      if (activeItemIndex === indexToDelete) {
        setActiveItemIndex(null);
      } else if (activeItemIndex !== null && activeItemIndex > indexToDelete) {
        setActiveItemIndex(activeItemIndex - 1);
      }
      showToast('頒布物を削除しました。');
    }
  };

  // Move Item Up / Down
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedItems = [...data.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[targetIndex];
    updatedItems[targetIndex] = temp;

    setData(prev => ({
      ...prev,
      items: updatedItems
    }));
    setActiveItemIndex(targetIndex);
  };

  // Modify Item Field
  const handleItemFieldChange = (index: number, key: keyof DistributionItem, val: string) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [key]: val
    };
    setData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Item Image Upload
  const handleImageFileChange = async (index: number, file: File) => {
    try {
      showToast('画像を最適化中...');
      const base64 = await compressAndGetBase64(file);
      handleItemFieldChange(index, 'image', base64);
      showToast('画像をアップロード＆リサイズしました！');
    } catch (e) {
      console.error(e);
      alert('画像ファイルの読み込みに失敗しました。他の画像をお試しください。');
    }
  };

  // 自分で設定可能なヘッダー画像
  const handleHeaderImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperSrc(result); // クロップモーダルを立ち上げる
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setData(prev => ({
      ...prev,
      headerImage: croppedBase64,
      headerImageMode: prev.headerImageMode === 'none' || !prev.headerImageMode ? 'replace' : prev.headerImageMode
    }));
    setCropperSrc(null);
    showToast('ヘッダー画像の切り抜き（トリミング）が完了しました！');
  };

  const handleRemoveHeaderImage = () => {
    setData(prev => ({
      ...prev,
      headerImage: '',
      headerImageMode: 'none',
      headerImageMirror: false
    }));
    showToast('ヘッダー画像を消去しました。');
  };

  // Reset entire form
  const handleResetAllData = () => {
    if (window.confirm('すべての内容を消去して初期状態（白紙）に戻します。よろしいですか？')) {
      const emptyOshinaki: OshinakiData = {
        eventCode: '',
        eventTitle: '',
        eventDate: '',
        circleSpace: '',
        circleName: '',
        circleAuthor: '',
        footerNote: '★ 開場直後の1万円札でのお支払いは、できるだけ避けていただけますと大変助かります！',
        templateId: 'aqua_b',
        fontFamily: 'sans',
        aspectRatio: 'a4',
        gridCols: 2,
        noveltyEnabled: true,
        noveltyTitle: '',
        noveltyDesc: '',
        noveltyImage1: '',
        noveltyImage2: '',
        headerImage: '',
        headerImageMode: 'none',
        headerImageMirror: false,
        customColors: getTemplateDefaults('aqua_b'),
        items: []
      };
      setData(emptyOshinaki);
      setActiveItemIndex(null);
      localStorage.removeItem(STORAGE_KEY);
      showToast('すべての作成データをリセットしました。');
    }
  };

  // Load sample template again
  const handleLoadSample = () => {
    if (window.confirm('現在の内容は上書きされますが、サンプルデータを上書きロードしてもよろしいですか？')) {
      setData(SAMPLE_OSHINAKI);
      setActiveItemIndex(0);
      showToast('サンプルお品書きデータを読み込みました！');
    }
  };

  // Trigger high resolution image download (CORS friendly)
  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    showToast('高解像度お品書き画像を生成中...（約3〜5秒）');

    setTimeout(async () => {
      try {
        // Wait for images to load fully in background
        const images = printRef.current?.querySelectorAll('img');
        if (images) {
          const promises = Array.from(images).map(imgNode => {
            const img = imgNode as HTMLImageElement;
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          });
          await Promise.all(promises);
        }

        const targetWidth = data.aspectRatio === 'sns-horizontal' ? 1000 : 800;
        let targetHeight = 1131;
        if (data.aspectRatio === 'square') {
          targetHeight = 800;
        } else if (data.aspectRatio === 'b5') {
          targetHeight = 1131;
        } else if (data.aspectRatio === 'sns-horizontal') {
          targetHeight = 750;
        }

        // html2canvas capture with scale 2.5 for High Quality print & screen resolutions.
        // allowTaint: false + useCORS: true is required to prevent SecurityErrors on exporting
        const canvas = await html2canvas(printRef.current!, {
          scale: 2.5, // Ultra Sharp!
          useCORS: true,
          logging: false,
          allowTaint: false,
          backgroundColor: data.customColors.bg,
          width: targetWidth,
          height: targetHeight,
          windowWidth: targetWidth,
          windowHeight: targetHeight,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('oshinaki-print-area');
            if (clonedEl) {
              const parent = clonedEl.parentElement;
              if (parent) {
                parent.style.position = 'absolute';
                parent.style.left = '0px';
                parent.style.top = '0px';
                parent.style.width = `${targetWidth}px`;
                parent.style.height = `${targetHeight}px`;
              }
            }
          }
        });

        const image = canvas.toDataURL('image/png');
        
        // Save to state to trigger the modal preview
        setExportedImageUrl(image);

        // Attempt automated direct download
        try {
          const link = document.createElement('a');
          const cleanCircle = data.circleName ? `_${data.circleName}` : '';
          const cleanEvent = data.eventTitle ? `_${data.eventTitle}` : '';
          link.download = `oshinaki${cleanCircle}${cleanEvent}.png`;
          link.href = image;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('画像をエクスポートしました！ダウンロードフォルダをご確認ください。');
        } catch (linkError) {
          console.warn('Direct file download triggering is blocked by browser environment, preview modal available.', linkError);
        }
      } catch (err) {
        console.error(err);
        alert('画像の保存中にエラーが発生しました。一部の画像フォーマットが非対応であるか、お使いのブラウザでの制限の可能性があります。');
      } finally {
        setIsExporting(false);
      }
    }, 500); // Small timeout to let state reflect
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-xl p-2 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                同人お品書きメーカー
                <span className="text-3s bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  オートセーブ対応
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                同人誌やグッズの素敵なサークルお品書きを「ブラウザだけ」で簡単に着せ替え・高解像度保存
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSample}
              id="btn-load-sample"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100/80 active:bg-blue-200/80 rounded-lg transition"
              title="最初から内容の入ったお品書きを参照して使い方を確認できます"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              お手本サンプル
            </button>
            <button
              onClick={handleResetAllData}
              id="btn-reset"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100/80 active:bg-orange-200/80 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              白紙に戻す
            </button>
            <div className="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>
            <button
              onClick={handleDownloadImage}
              id="btn-download"
              disabled={isExporting}
              className={`flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 active:scale-95 transition-all text-sm cursor-pointer ${isExporting ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? '画像出力中...' : 'お品書きを画像で保存'}
            </button>
          </div>
        </div>
      </header>

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-100 text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 transition-all animate-bounce">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: EDIT PANELS (7 COLS ON LARGE SCREEN) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. CIRCLE & EVENT METADATA */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              イベント・サークル情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">イベント回 (例: C104)</label>
                <input
                  type="text"
                  value={data.eventCode}
                  onChange={e => handleMetaChange('eventCode', e.target.value)}
                  placeholder="C104 / コミティア150"
                  id="input-event-code"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">開催日 / 曜日</label>
                <input
                  type="text"
                  value={data.eventDate}
                  onChange={e => handleMetaChange('eventDate', e.target.value)}
                  placeholder="2024.08.12 / 2026.08.15"
                  id="input-event-date"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">イベント回詳細タイトル</label>
                <input
                  type="text"
                  value={data.eventTitle}
                  onChange={e => handleMetaChange('eventTitle', e.target.value)}
                  placeholder="コミックマーケット2日目 / etc."
                  id="input-event-title"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 text-orange-600 flex items-center gap-1">
                  スペース番号 / ホール
                </label>
                <input
                  type="text"
                  value={data.circleSpace}
                  onChange={e => handleMetaChange('circleSpace', e.target.value)}
                  placeholder="東V 02ab"
                  id="input-circle-space"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-orange-700 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">サークル名</label>
                <input
                  type="text"
                  value={data.circleName}
                  onChange={e => handleMetaChange('circleName', e.target.value)}
                  placeholder="JERRY POISON"
                  id="input-circle-name"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-800 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">著者・主催名</label>
                <input
                  type="text"
                  value={data.circleAuthor}
                  onChange={e => handleMetaChange('circleAuthor', e.target.value)}
                  placeholder="NEKOME TOWORU & 006 (省略可)"
                  id="input-circle-author"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* 1.5. HEADER CUSTOM IMAGE SECTION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              オリジナルヘッダー画像設定
            </h2>
            <p className="text-xs text-slate-450 mb-4 leading-relaxed">
              ヘッダー領域に自分で用意したサークルバナーや背景画を設定・トリミングして配置できます。
            </p>

            <div className="space-y-4">
              {/* Display Mode Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">表示モード</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: '使用しない', desc: 'テキスト看板' },
                    { id: 'replace', label: '画像を置換', desc: '看板ごと画像へ' },
                    { id: 'background', label: '背景として敷く', desc: '文字の下に敷く' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleMetaChange('headerImageMode', mode.id)}
                      className={`px-3 py-2 border rounded-xl text-center select-none cursor-pointer transition flex flex-col items-center justify-center ${
                        data.headerImageMode === mode.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-500/10'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-black">{mode.label}</span>
                      <span className="text-[9px] opacity-75 mt-0.5">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload image area */}
              {data.headerImageMode !== 'none' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {data.headerImage ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center h-[90px] group">
                        <img 
                          src={data.headerImage} 
                          alt="Cropped Header" 
                          className="h-full w-full object-cover" 
                          style={data.headerImageMirror ? { transform: 'scaleX(-1)' } : undefined}
                        />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 gap-2">
                          <button
                            type="button"
                            onClick={() => setCropperSrc(data.headerImage || '')}
                            className="bg-white/95 text-slate-800 text-[10px] font-extrabold py-1.5 px-3 rounded-lg shadow-sm hover:bg-white transition cursor-pointer"
                          >
                            再トリミング
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveHeaderImage}
                            className="bg-red-600 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-lg shadow-sm hover:bg-red-700 transition cursor-pointer"
                          >
                            削除
                          </button>
                        </div>
                      </div>

                      {/* Mirror controls */}
                      <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">画像を左右反転（ミラーリング）</span>
                          <span className="text-[10px] text-slate-400">背景画像のキャラクターや構図の左右を反転します</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={data.headerImageMirror || false}
                            onChange={(e) => handleMetaChange('headerImageMirror', e.target.checked)}
                            className="sr-only peer cursor-pointer" 
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Background styling sliders - only relevant in background mode */}
                      {data.headerImageMode === 'background' && (
                        <div className="space-y-2.5 pt-1 border-t border-slate-100 mt-1">
                          {/* Background Opacity control */}
                          <div className="bg-white border border-slate-200/60 rounded-xl p-3 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span>背景画像の不透明度</span>
                              <span className="font-mono text-blue-600">{data.headerImageOpacity !== undefined ? data.headerImageOpacity : 100}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="100" 
                              step="5"
                              value={data.headerImageOpacity !== undefined ? data.headerImageOpacity : 100}
                              onChange={(e) => handleMetaChange('headerImageOpacity', parseInt(e.target.value))}
                              className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                            />
                          </div>

                          {/* Background Blur control */}
                          <div className="bg-white border border-slate-200/60 rounded-xl p-3 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span>背景画像のぼかし</span>
                              <span className="font-mono text-blue-600">{data.headerImageBlur !== undefined ? data.headerImageBlur : 0}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="15" 
                              step="1"
                              value={data.headerImageBlur !== undefined ? data.headerImageBlur : 0}
                              onChange={(e) => handleMetaChange('headerImageBlur', parseInt(e.target.value))}
                              className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                            />
                          </div>

                          {/* Text Readability Layer Opacity control */}
                          <div className="bg-white border border-slate-200/60 rounded-xl p-3 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span>文字の読みやすさ重ね幅（カバーの不透明度）</span>
                              <span className="font-mono text-blue-600">{data.headerImageOverlayOpacity !== undefined ? data.headerImageOverlayOpacity : 55}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="95" 
                              step="5"
                              value={data.headerImageOverlayOpacity !== undefined ? data.headerImageOverlayOpacity : 55}
                              onChange={(e) => handleMetaChange('headerImageOverlayOpacity', parseInt(e.target.value))}
                              className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pl-1">
                        <span>設定完了（アスペクト比 40:9 推奨）</span>
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => setCropperSrc(data.headerImage || '')}
                            className="text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            再トリミング
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={handleRemoveHeaderImage}
                            className="text-red-500 font-bold hover:underline cursor-pointer"
                          >
                            画像を消去
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 bg-white hover:bg-slate-50 transition text-center relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleHeaderImageUpload(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="header-image-uploader"
                      />
                      <div className="space-y-1">
                        <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-blue-600">
                          ヘッダー画像をアップロード
                        </p>
                        <p className="text-[10px] text-slate-400">
                          PNG, JPG, WEBP対応 (アップロード後にトリミング枠が出ます)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. STYLE & PRESET CONTROLLERS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600"></div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-violet-600" />
              お品書きをデザイン・着せ替え
            </h2>

            {/* Template Buttons */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. 世界観デザインテンプレート
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { id: 'aqua_b', name: 'テンプレートB (クリア)', icon: '🌟', color: 'border-slate-800 text-slate-800' },
                  { id: 'vivid', name: 'テンプレートC (ポップ)', icon: '🎉', color: 'border-purple-400 text-purple-600' },
                  { id: 'luxury', name: 'テンプレートD (高級感)', icon: '💎', color: 'border-slate-400 text-slate-800' },
                ].map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleTemplateChange(tmpl.id as TemplateId)}
                    id={`tmpl-btn-${tmpl.id}`}
                    name={`tmpl-btn-${tmpl.id}`}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition text-center cursor-pointer ${
                      data.templateId === tmpl.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-102 font-bold' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-xl mb-1.5">{tmpl.icon}</span>
                    <span className="text-xs">{tmpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 border-t border-b border-slate-100 py-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">比率 / 用紙サイズ</label>
                <select
                  value={data.aspectRatio}
                  onChange={e => handleMetaChange('aspectRatio', e.target.value as AspectRatioId)}
                  id="select-aspect-ratio"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">A4 縦長 (縦1.41倍) *一番人気</option>
                  <option value="b5">B5 縦長 (縦1.41倍)</option>
                  <option value="square">スクエア正方形 (1:1) *SNS向け</option>
                  <option value="sns-horizontal">横型 4:3 *X(旧Twitter)用</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">商品配置グリッド</label>
                <select
                  value={data.gridCols}
                  onChange={e => handleMetaChange('gridCols', Number(e.target.value))}
                  id="select-grid-cols"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1カラム (大きく見せる)</option>
                  <option value={2}>2カラム (標準・見やすい)</option>
                  <option value={3}>3カラム (点数が多い場合)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">文字フォント</label>
                <select
                  value={data.fontFamily}
                  onChange={e => handleMetaChange('fontFamily', e.target.value as FontFamilyId)}
                  id="select-font-family"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sans">モダン角ゴシック</option>
                  <option value="rounded">和み丸ゴシック</option>
                  <option value="serif">気品ある秀麗明朝</option>
                  <option value="mono">デジタル・等幅</option>
                </select>
              </div>
            </div>

            {/* Custom Palette Customizer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. 自由なカスタム配色設定
                </label>
                <button
                  onClick={resetColorsToDefault}
                  id="btn-reset-colors"
                  className="text-3s text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
                >
                  デフォルト色に戻す
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/50 rounded-xl p-3">
                {[
                  { key: 'primary', label: 'メイン・装飾' },
                  { key: 'secondary', label: 'サブカラー' },
                  { key: 'bg', label: '全体の背景' },
                  { key: 'cardBg', label: 'アイテム枠内' },
                  { key: 'textBase', label: '一般文字' },
                  { key: 'textHeader', label: 'ヘッダー文字' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg shadow-2xs">
                    <input
                      type="color"
                      value={data.customColors[item.key as keyof OshinakiData['customColors']]}
                      onChange={e => handleColorChange(item.key as keyof OshinakiData['customColors'], e.target.value)}
                      className="w-6 h-6 border-0 rounded cursor-pointer shrink-0"
                      title={item.label}
                    />
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block truncate">{item.label}</span>
                      <span className="text-[11px] font-mono font-semibold text-slate-600 uppercase">
                        {data.customColors[item.key as keyof OshinakiData['customColors']]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC DISTRIBUTION ITEMS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                頒布物（同人誌・作品・グッズ）
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {data.items.length} 点
                </span>
              </h2>
              <button
                onClick={handleAddItem}
                id="btn-add-item"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                頒布物を追加
              </button>
            </div>

            {/* If empty */}
            {data.items.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold">追加された頒布物がありません</p>
                <p className="text-xs mb-4">「頒布物を追加」ボタンを押して作品を並べましょう！</p>
                <button
                  onClick={handleAddItem}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2 px-4 border border-emerald-200 rounded-lg"
                >
                  お品書きの1点目を追加する
                </button>
              </div>
            )}

            {/* List of items */}
            <div className="space-y-3">
              {data.items.map((item, index) => {
                const isOpen = activeItemIndex === index;
                
                return (
                  <div 
                    key={item.id}
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      isOpen 
                        ? 'border-slate-400 shadow-md bg-white' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    {/* Header bar of the item accordion */}
                    <div 
                      onClick={() => setActiveItemIndex(isOpen ? null : index)}
                      className="px-4 py-3 flex items-center justify-between cursor-pointer select-none bg-white border-b border-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Circle Item Number */}
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-inner shrink-0">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        
                        {/* Item image preview tiny */}
                        <div className="w-10 h-10 rounded-md bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>

                        {/* Title & Badge */}
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 shrink-0">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-xs font-mono font-bold text-slate-600 shrink-0 select-none">
                              {item.price ? `¥${item.price}` : '価格未定'}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 truncate">
                            {item.title || '(タイトル未入力の頒布物)'}
                          </h3>
                        </div>
                      </div>

                      {/* Controls inside header */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                          title="上に移動"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === data.items.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                          title="下に移動"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Accordion Content Body */}
                    {isOpen && (
                      <div className="p-4 bg-white border-t border-slate-100 space-y-4 text-left">
                        
                        {/* Title and Badge */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">頒布物タイトル</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={e => handleItemFieldChange(index, 'title', e.target.value)}
                              placeholder="例: イラスト画集「Summer Memory」 / アクリルキーホルダー"
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">バッジ (新刊・ノベルティ等)</label>
                            <input
                              type="text"
                              value={item.badge}
                              onChange={e => handleItemFieldChange(index, 'badge', e.target.value)}
                              placeholder="新刊 / 既刊 / グッズ"
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-700 bg-blue-50/20"
                            />
                            {/* Fast Tag Select */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['新刊', '既刊', 'グッズ', 'ノベルティ', '無料配布'].map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleItemFieldChange(index, 'badge', tag)}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price and Specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">金額 (価格)</label>
                            <input
                              type="text"
                              value={item.price}
                              onChange={e => handleItemFieldChange(index, 'price', e.target.value)}
                              placeholder="例: 500 / 1000 / 無料"
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-emerald-700"
                            />
                            {/* Fast Price Select */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['0', '100', '300', '500', '800', '1000', '無料配布'].map(prc => (
                                <button
                                  key={prc}
                                  onClick={() => handleItemFieldChange(index, 'price', prc === '無料配布' ? 'FREE' : prc)}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                >
                                  {prc === '無料配布' ? '無料' : `¥${prc}`}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">補足仕様・ボリューム</label>
                            <input
                              type="text"
                              value={item.specs}
                              onChange={e => handleItemFieldChange(index, 'specs', e.target.value)}
                              placeholder="例: A5 / 24P / フルカラー , 50mm角 / 両面印刷"
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Image Upload Area */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">作品の表紙・サンプル画像</label>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            {/* Small preview block */}
                            <div className="md:col-span-3 flex justify-center">
                              <div className="w-24 h-24 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner relative group">
                                {item.image ? (
                                  <>
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => handleItemFieldChange(index, 'image', '')}
                                      className="absolute inset-0 bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs"
                                    >
                                      画像を消去
                                    </button>
                                  </>
                                ) : (
                                  <ImageIcon className="w-8 h-8 text-slate-300" />
                                )}
                              </div>
                            </div>
                            
                            {/* Real File Input Drag Drop wrapper */}
                            <div className="md:col-span-9">
                              <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/60 transition text-center relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`file-input-${index}`}
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleImageFileChange(index, e.target.files[0]);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-blue-600">
                                    ファイルをドラッグ、またはクリックして追加
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    JPG, PNG, WEBP対応 (自動リサイズ・圧縮されるので軽快です)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">頒布物の説明・こだわり（最大3行で表示）</label>
                          <textarea
                            value={item.description}
                            onChange={e => handleItemFieldChange(index, 'description', e.target.value)}
                            placeholder="例: イラスト集の新刊です。海と青空をモチーフにした透明感のある作品を詰め込みました！ノベルティ等も付属します。"
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.5 NOVELTY / PURCHASE BONUS SECTION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600" />
                ノベルティ（購入特典）情報
              </h2>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={data.noveltyEnabled} 
                  onChange={e => handleMetaChange('noveltyEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-500">表示する</span>
              </label>
            </div>

            {data.noveltyEnabled && (
              <div className="space-y-4 pt-3 border-t border-slate-100 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">特典の名称・タイトル</label>
                  <input
                    type="text"
                    value={data.noveltyTitle}
                    onChange={e => handleMetaChange('noveltyTitle', e.target.value)}
                    placeholder="例: イラスト名刺セット / 特製クリアポストカード"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">特典の説明・配布条件</label>
                  <textarea
                    value={data.noveltyDesc}
                    onChange={e => handleMetaChange('noveltyDesc', e.target.value)}
                    placeholder="例: 新刊本お買い上げの方全員に先着順でプレゼントします！なくなり次第終了となります。"
                    rows={2}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">特典用サムネイル画像</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button
                      onClick={() => handleMetaChange('noveltyImage1', PLACEHOLDER_IMAGES.noveltyMystery)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border transition font-semibold ${
                        data.noveltyImage1 === PLACEHOLDER_IMAGES.noveltyMystery
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      🔮 シークレットW名刺 (初期お勧め)
                    </button>
                    <button
                      onClick={() => handleMetaChange('noveltyImage1', '')}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border transition font-semibold ${
                        !data.noveltyImage1
                          ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      🎁 デフォルトギフトアイコン
                    </button>
                  </div>

                  {/* Manual thumbnail upload */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3 flex justify-center">
                      <div className="w-24 h-16 rounded-lg bg-slate-55 border flex items-center justify-center overflow-hidden relative group shadow-inner bg-slate-50">
                        {data.noveltyImage1 ? (
                          <>
                            <img src={data.noveltyImage1} alt="Novelty Preview" className="w-full h-full object-contain" />
                            <button
                              onClick={() => handleMetaChange('noveltyImage1', '')}
                              className="absolute inset-0 bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs"
                            >
                              消去
                            </button>
                          </>
                        ) : (
                          <span className="text-xl">🎁</span>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-9">
                      <div className="border border-dashed border-slate-200 rounded-xl p-2.5 bg-slate-50 relative hover:bg-slate-100 transition text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              const base64 = await compressAndGetBase64(e.target.files[0]);
                              handleMetaChange('noveltyImage1', base64);
                              showToast('特典画像をアップロードしました！');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-purple-600">独自の特典画像をアップロード (JPG/PNG)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 4. FOOTER NOTE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-amber-500" />
              お買い物メモ・注意書き（フッター表示）
            </h2>
            <p className="text-xs text-slate-400 mb-2">
              当日の決済方法（現金、QR等）、ノベルティの有無、一万円札についての配慮お願いなどを自由に書いてください。
            </p>
            <textarea
              value={data.footerNote}
              onChange={e => handleMetaChange('footerNote', e.target.value)}
              placeholder="★ 釣銭が不足しがちです。小銭でのご協力をお願いします。
★ ノベルティは数に限りがございます！"
              rows={3}
              id="input-footer-note"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed transition"
            />
          </div>
        </section>

        {/* RIGHT COLUMN: PREVIEW PANEL (5 COLS ON LARGE SCREEN) */}
        <section className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          
          {/* Download & Stats Callout card */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg border border-slate-800 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Download className="w-28 h-28 text-white" />
            </div>
            
            <div className="flex items-center gap-2 text-green-400 font-extrabold text-sm mb-2">
              <Check className="w-5 h-5" />
              <span>自動保存中 & 高解像度準備完了</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              編集内容は<strong>ブラウザのストレージに自動保存</strong>されています。
              「お品書きを画像で保存」を押すと、<strong>2.5倍の超高精細解像度（Ultra Sharp）</strong>で
              文字つぶれの無いPNG画像を書き出します。
            </p>

            <button
              onClick={handleDownloadImage}
              id="btn-download-right"
              disabled={isExporting}
              className={`w-full py-3 bg-green-600 hover:bg-green-500 font-bold rounded-xl text-white shadow-xl hover:shadow-green-500/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer ${
                isExporting ? 'opacity-80' : ''
              }`}
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? '画像をエクスポート中...' : 'お品書きを画像で保存'}
            </button>

            <div className="mt-4 pt-3.5 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-400 font-mono">
              <div>
                <span className="block font-sans text-slate-500">出力サイズ / 比率</span>
                <span className="font-bold text-slate-200">
                  {data.aspectRatio === 'a4' ? 'A4 縦長 (1:1.41)' : 
                   data.aspectRatio === 'b5' ? 'B5 縦長 (1:1.41)' :
                   data.aspectRatio === 'square' ? 'スクエア (1:1)' : 'SNS横型 (4:3)'}
                </span>
              </div>
              <div>
                <span className="block font-sans text-slate-500">推定推奨ネップリ</span>
                <span className="font-bold text-slate-200">A4 / L判 / ハガキサイズ可</span>
              </div>
            </div>
          </div>

          {/* REALTIME CANVAS PREVIEW CONTAINER */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                リアルタイムプレビュー 
                <span className="font-normal text-[10px]">({data.aspectRatio === 'sns-horizontal' ? '1000x750' : '800px'} 相当をスケーリング表示)</span>
              </h2>
            </div>
            
            <OshinakiCanvas data={data} printRef={printRef} />
          </div>

          {/* AUTHORS TIPS HELPER CARD */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 text-left text-xs">
            <h3 className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              お品書きをオシャレに見せるコツ 💡
            </h3>
            <ul className="space-y-1.5 text-amber-800/80 list-disc list-inside leading-relaxed pl-1">
              <li>
                <strong>サークルスペース名は太字で：</strong>「東3あ-12a」のように、配置場所やホールは一番目立つようハッキリと書きましょう。
              </li>
              <li>
                <strong>価格を大きなフォントで：</strong>イベント当日は混雑します。一瞬でいくらか視認できるように価格は明確な数字を推奨します。
              </li>
              <li>
                <strong>バッジで誘導：</strong>「新刊」や「無料配布」はバッジでおすすめアピールが効果的です。
              </li>
              <li>
                <strong>コンビニプリント（ネップリ）：</strong>「A4縦長」テンプレートでお品書きを画像保存し、ローソンのネットワークプリントやセブンのネットプリントに「登録しA4サイズで印刷」すれば、当日スペースの卓上に美しく掲示できます！
              </li>
            </ul>
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-medium">© 2026 同人お品書きメーカー. All Rights Reserved.</p>
        <p className="mt-1">ブラウザ上で自動圧縮&リサイズとオフライン永続化処理を完結するため、アップロードした画像が外部サーバーに送信されることはありません。</p>
      </footer>

      {cropperSrc && (
        <ImageCropperModal 
          imageSrc={cropperSrc} 
          onClose={() => setCropperSrc(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}

      {exportedImageUrl && (
        <ExportModal
          imageSrc={exportedImageUrl}
          onClose={() => setExportedImageUrl(null)}
          filename={`oshinaki${data.circleName ? `_${data.circleName}` : ''}${data.eventTitle ? `_${data.eventTitle}` : ''}.png`}
        />
      )}
    </div>
  );
}
