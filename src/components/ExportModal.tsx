import React from 'react';
import { X, Download, HelpCircle, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  imageSrc: string; // Base64 data URL of the compiled oshinaki
  onClose: () => void;
  filename: string;
}

export default function ExportModal({ imageSrc, onClose, filename }: ExportModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageSrc;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="export-modal-container"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-md font-extrabold text-slate-900">お品書き画像の作成完了！</h3>
            <p className="text-xs text-slate-500">超高画質お品書きイメージが正常に書き出されました</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
            id="btn-close-export-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col items-center gap-5 text-left">
          {/* Preview Image */}
          <div className="relative group max-w-sm w-full border border-slate-200 rounded-xl overflow-hidden shadow-md bg-slate-100 flex items-center justify-center p-1">
            <img 
              src={imageSrc} 
              alt="Generated Oshinaki" 
              className="max-h-[45vh] object-contain rounded-lg w-auto select-all" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-white font-bold bg-slate-900/80 px-3 py-1.5 rounded-full backdrop-blur-xs">
                長押し・右クリックで画像保存可能
              </span>
            </div>
          </div>

          {/* Device helper warning block */}
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-extrabold text-amber-950 mb-0.5">スマートフォンやアプリ内ブラウザをご利用の方へ</p>
              <p className="opacity-90">
                LINE、X (Twitter)、Instagramなどのアプリ内ブラウザや、一部のモバイル端末では「画像をダウンロード」ボタンが反応しない場合があります。
              </p>
              <p className="font-bold opacity-100 mt-1.5">
                その場合、上の画像を「長押し」または「右クリック」して、「画像を保存」を選んでください。
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-600/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              id="btn-modal-trigger-download"
            >
              <Download className="w-4 h-4" />
              画像をダウンロード
            </button>
            
            <a
              href={imageSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              id="btn-modal-open-new-tab"
            >
              <ExternalLink className="w-4 h-4" />
              別タブで画像を開く
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
