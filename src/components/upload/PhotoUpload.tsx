import { useRef } from 'react';
import { Paperclip } from 'lucide-react';

interface Props { onImageSelected: (base64: string, mediaType: string) => void; }

export default function PhotoUpload({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mediaType = header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
      onImageSelected(data, mediaType);
    };
    reader.readAsDataURL(file);
  };
  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" capture="environment" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''; }} />
      <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors" title="Upload photo">
        <Paperclip size={18} />
      </button>
    </>
  );
}
