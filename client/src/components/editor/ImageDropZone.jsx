import { useState, useRef } from 'react';
import { uploadImage } from '../../api';
import ImageCropModal from './ImageCropModal';

export default function ImageDropZone({ imageUrl, onImageUrl, auth, label = 'Glissez une image ici', aspect = 3 / 2 }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [cropSrc, setCropSrc] = useState(null);
  const inputRef = useRef(null);

  const upload = async (fileOrBlob) => {
    setError('');
    setUploading(true);
    try {
      const data = await uploadImage(fileOrBlob, auth);
      onImageUrl(data.url);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'image.');
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Format non supporté : veuillez choisir une image.');
      return;
    }
    setError('');
    setCropSrc(URL.createObjectURL(file));
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropConfirm = (blob) => {
    closeCrop();
    upload(new File([blob], 'cocktail.jpg', { type: blob.type }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-lgo-gold-dark bg-lgo-card/50' : 'border-lgo-border/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {uploading ? (
          <span className="text-sm text-lgo-gold-light/70">Envoi en cours...</span>
        ) : imageUrl ? (
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Aperçu"
              className="max-h-32 rounded-lg object-cover mx-auto"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageUrl('');
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
              title="Supprimer l'image"
            >
              ×
            </button>
            <p className="text-[10px] text-lgo-gold-light/50 mt-1">Cliquez pour remplacer</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-lgo-gold-light/70">{label}</p>
            <p className="text-[10px] text-lgo-gold-light/40">ou cliquez pour choisir un fichier</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={aspect}
          onCancel={closeCrop}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
