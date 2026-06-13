import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Check, X, RefreshCw } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string; // Original loaded image source (URL or Base64)
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export default function ImageCropperModal({ imageSrc, onClose, onCropComplete }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1.0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Crop configuration - Target header output is 800px x 180px
  const cropAspectRatio = 800 / 180; // ~4.44
  const viewportWidth = 500; // Visual viewport width in UI
  const viewportHeight = Math.round(viewportWidth / cropAspectRatio); // ~112px in UI

  useEffect(() => {
    // Reset positions on new image loaded
    setZoom(1.0);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc]);

  // Touch and Mouse handles for dragging (panning) the image
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    // Calculate new position
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Canvas processing for the high-res cropped output
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    
    // Create offscreen canvas with target output high-res sizes
    const canvas = document.createElement('canvas');
    const targetWidth = 800;
    const targetHeight = 180;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // We need to calculate what portion of the original image corresponds to the visual crop area.
    // Let's analyze the visual scaling in the viewport wrapper:
    // Viewport dimensions in CSS are: viewportWidth x viewportHeight
    // Image scale in viewport after zoom: scale = zoom * (fitting scale)
    
    // Let's calculate the natural scaling factor:
    // How the image is scaled to fit the visual editor area initially
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;

    // Viewport relative to target ratio
    // To make calculations robust and easy:
    // 1. We know the exact position {x, y} and zoom in the UI viewport.
    // 2. Let's map this back to original image space.
    
    // First, let's find the current size of the image container in the editor UI
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const vWidth = viewportWidth;
    const vHeight = viewportHeight;

    // Initially, let's assume the image is rendered with object-fit-like rules, or we just draw it relative to center:
    // Here we have standard centered layout: Left/Top are absolute, centered on container.
    // Let's compute based on the visual width of the image.
    // In our render, the image is styled with: width = visualWidth, height = visualHeight
    const visualWidth = vWidth * zoom;
    const visualHeight = (imgNaturalHeight * (vWidth / imgNaturalWidth)) * zoom;

    // Position {position.x, position.y} is the offset from the centered initial state.
    // Visual center of viewport is (vWidth / 2, vHeight / 2)
    // The image's top-left corner in viewport coordinates is:
    const imgLeft = (vWidth - visualWidth) / 2 + position.x;
    const imgTop = (vHeight - visualHeight) / 2 + position.y;

    // Now let's calculate the Source crop rectangle from original image
    // Map viewports top-left (0,0) and bottom-right (vWidth, vHeight) into image coordinates
    // Image coordinate mapping: 1px of visual = (imgNaturalWidth / visualWidth) original pixels.
    const pixelRatio = imgNaturalWidth / visualWidth;

    let sx = -imgLeft * pixelRatio;
    let sy = -imgTop * pixelRatio;
    let sWidth = vWidth * pixelRatio;
    let sHeight = vHeight * pixelRatio;

    // Strict boundary clamping to prevent out-of-bounds context drawing anomalies
    if (sx < 0) {
      sWidth += sx;
      sx = 0;
    }
    if (sy < 0) {
      sHeight += sy;
      sy = 0;
    }
    if (sx + sWidth > imgNaturalWidth) {
      sWidth = imgNaturalWidth - sx;
    }
    if (sy + sHeight > imgNaturalHeight) {
      sHeight = imgNaturalHeight - sy;
    }

    // Draw to canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    
    try {
      if (sWidth > 0 && sHeight > 0) {
        ctx.drawImage(
          img,
          Math.floor(sx), Math.floor(sy), Math.floor(sWidth), Math.floor(sHeight),     // Source rect
          0, 0, targetWidth, targetHeight // Destination rect
        );
      }
      
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(croppedBase64);
    } catch (e) {
      console.error('Failed to crop image on canvas:', e);
      // Fallback: use raw resized image
      onCropComplete(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
        id="image-cropper-dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-sm font-bold text-slate-800">ヘッダー画像トリミング</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">ドラッグで移動、スライダーで拡大縮小してお品書きに最適化します</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Editor Viewport */}
        <div className="p-6 flex flex-col items-center">
          
          <div 
            ref={containerRef}
            className="relative border border-slate-200 bg-slate-900 rounded-2xl overflow-hidden cursor-move touch-none select-none flex items-center justify-center"
            style={{ 
              width: `${viewportWidth}px`, 
              height: `${viewportHeight}px`,
              maxWidth: '100%'
            }}
            onMouseDown={(e) => {
              if (e.button === 0) handleStart(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => {
              if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handleEnd}
          >
            {/* Dark semi-transparent mask outer of viewport border */}
            <div className="absolute inset-0 border-[2px] border-amber-400/80 rounded-2xl pointer-events-none z-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]" />
            
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source to crop"
              className="absolute pointer-events-none max-w-none transition-transform duration-0 origin-center"
              style={{
                width: `${viewportWidth * zoom}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                left: 'auto',
                top: 'auto',
              }}
              draggable={false}
            />

            {/* Guide Grid Overlays */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-1 pointer-events-none z-10 opacity-30">
              <div className="border-r border-dashed border-white" />
              <div className="border-r border-dashed border-white" />
              <div />
            </div>
            
            <div className="absolute bottom-2.5 left-2.5 z-20 bg-slate-950/80 text-[9px] font-bold text-white px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 opacity-75">
              <Move className="w-3 h-3" />
              <span>ドラッグして位置調整</span>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full mt-6 space-y-4">
            
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>ズーム倍率</span>
                <span className="font-mono text-slate-700 font-bold">{zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setZoom(prev => Math.max(1.0, prev - 0.15))}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <button 
                  onClick={() => setZoom(prev => Math.min(4.0, prev + 0.15))}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setZoom(1.0);
                  setPosition({ x: 0, y: 0 });
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 py-1 px-3 border border-slate-200 hover:bg-slate-50 rounded-full transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>位置とズームを初期化</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/15 flex items-center gap-1.5 transition"
          >
            <Check className="w-4 h-4" />
            <span>トリミングを決定</span>
          </button>
        </div>
      </div>
    </div>
  );
}
