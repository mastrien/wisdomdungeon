"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Loader2, X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function AvatarCropper({ image, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number, y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoomValue: number) => {
    setZoom(zoomValue);
  }, []);

  const onCropAreaComplete = useCallback((croppedArea: any, croppedAreaPixelsValue: any) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels || !image) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("No 2d context");

      canvas.width = 400; // Final size for avatar
      canvas.height = 400;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        400,
        400
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
        setIsProcessing(false);
      }, "image/jpeg", 0.9);
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-card border border-border-main rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-main flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Ajustar Avatar</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="relative flex-1 min-h-[300px] md:min-h-[400px] bg-slate-950">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
            cropShape="round"
            showGrid={false}
          />
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-muted" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="flex-1 accent-brand-primary"
            />
            <ZoomIn className="w-4 h-4 text-muted" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground font-bold py-3 rounded-xl transition-all border border-border-main"
            >
              Cancelar
            </button>
            <button
              onClick={createCroppedImage}
              disabled={isProcessing}
              className="flex-1 bg-brand-primary hover:bg-brand-hover text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Finalizar Recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
