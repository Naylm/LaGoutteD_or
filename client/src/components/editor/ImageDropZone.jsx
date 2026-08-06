import { useState, useRef } from 'react';
import { uploadImage } from '../../api';

export default function ImageDropZone({ imageUrl, onImageUrl, auth, label = 'Glissez une image ici' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    setUploading(true);
    try {
      const data = await uploadImage(file, auth);
      onImageUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => inputRef.current?.click();

  return (
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
  );
}
