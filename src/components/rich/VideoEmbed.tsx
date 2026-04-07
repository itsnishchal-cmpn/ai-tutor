import { videoMap } from '../../data/videoMap';
import { Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Props {
  videoId: string;
}

export default function VideoEmbed({ videoId }: Props) {
  const [loaded, setLoaded] = useState(false);
  const video = videoMap[videoId];

  if (!video) {
    return (
      <div className="my-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-400">
        Video not available: {videoId}
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 bg-black">
      {!loaded ? (
        <button
          onClick={() => setLoaded(true)}
          className="relative w-full aspect-video group cursor-pointer"
        >
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </button>
      ) : (
        <iframe
          src={embedUrl}
          title={video.title}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      <div className="bg-gray-900 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-xs truncate">{video.title}</span>
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white shrink-0 ml-2"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
