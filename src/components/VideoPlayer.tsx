import { Play, Loader2, Lock, X, Clock, Eye } from 'lucide-react'
import { useState } from 'react'
import type { Video } from '../types'

interface Props {
  video: Video
  isLoading: boolean
  isError: boolean
  isLoggedIn: boolean
  isPreloading: boolean
  onPlay: () => void
  onCancelPreloading: () => void
}

export function VideoPlayer({
  video,
  isLoading,
  isError,
  isLoggedIn,
  isPreloading,
  onPlay,
  onCancelPreloading,
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="relative aspect-video bg-black cursor-pointer"
      onClick={onPlay}
    >
      {/* Skeleton */}
      {(isLoading || !imageLoaded) && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <Loader2 className="animate-spin" size={36} />
        </div>
      )}

      <img
        src={video.image}
        alt={video.title}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Play / Loading */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isPreloading || isLoading ? (
          <Loader2
            className="animate-spin text-white"
            size={48}
          />
        ) : (
          <Play
            size={56}
            className="text-white"
            fill="white"
          />
        )}
      </div>

      {/* Badges */}
      <div className="absolute bottom-4 right-4 text-xs bg-black/80 text-white px-2 py-1 rounded">
        <Clock size={12} className="inline mr-1" />
        {video.duration}
      </div>

      <div className="absolute bottom-4 left-4 text-xs bg-black/80 text-white px-2 py-1 rounded">
        <Eye size={12} className="inline mr-1" />
        {video.views}
      </div>

      {!isLoggedIn && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
          <Lock size={12} className="inline mr-1" />
          Connexion requise
        </div>
      )}

      {isPreloading && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCancelPreloading()
          }}
          className="absolute top-4 right-4 bg-white px-3 py-1 rounded text-xs"
        >
          <X size={12} className="inline mr-1" />
          Annuler
        </button>
      )}
    </div>
  )
}
