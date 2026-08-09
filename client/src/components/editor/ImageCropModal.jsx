import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImageBlob } from '../../utils/cropImage';

export default function ImageCropModal({ imageSrc, aspect = 3 / 2, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleValidate = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg my-auto bg-lgo-card border border-lgo-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-lgo-border/50">
          <h3 className="font-serif text-lg text-lgo-gold-light">Recadrer la photo</h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-lgo-gold-light/60 hover:text-lgo-gold-light hover:bg-lgo-bg transition-colors text-xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative w-full h-72 bg-lgo-bg rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-lgo-gold-light/60 shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-lgo-gold-dark"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-lgo-border/50">
            <button
              type="button"
              onClick={handleValidate}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-lgo-gold-dark text-lgo-bg font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Envoi...' : 'Valider'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-lgo-border text-lgo-gold-light text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
