import React, { useRef, useEffect, useState } from 'react'
import { X, AlertCircle, User, Lock, Eye, EyeOff, Facebook, Loader2 } from 'lucide-react'
import { UserCredentials } from '../types'

interface AuthModalProps {
  isOpen: boolean
  isLoading: boolean
  error: string
  onClose: () => void
  onSubmit: (credentials: UserCredentials) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isLoading,
  error,
  onClose,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLoading, onClose])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    onSubmit({ username, password })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0866FF] to-[#0550CC]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Facebook size={20} className="text-white" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-white">
                Connexion requise
              </h2>
              <p id="modal-description" className="text-blue-100 text-sm">
                Accédez à vos contenus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fermer la fenêtre"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-in shake duration-300"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-medium">Erreur de connexion</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Identifiant
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={firstInputRef}
                required
                id="username"
                name="username"
                type="text"
                placeholder="Téléphone ou email"
                autoComplete="username"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Mot de passe
              <span className="text-gray-400 font-normal ml-1">(plus de 6 caractères)</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                minLength={7}
                disabled={isLoading}
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0866FF] focus:border-transparent focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed p-1"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#0866FF] focus:ring-[#0866FF] cursor-pointer"
              />
              <span className="text-gray-600">Se souvenir de moi</span>
            </label>
            <a
              href="#"
              className="text-[#0866FF] hover:underline font-medium"
              onClick={(e) => e.preventDefault()}
            >
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit Button */}
          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-4 bg-[#0866FF] hover:bg-[#0550CC] active:bg-[#0444AA] text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Connexion en cours...
              </>
            ) : (
              <>
                <Lock size={18} />
                Se connecter
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Create Account Link */}
          <p className="text-center text-gray-600">
            Pas encore de compte ?{' '}
            <a
              href="#"
              className="text-[#0866FF] hover:underline font-semibold"
              onClick={(e) => e.preventDefault()}
            >
              Créer un compte
            </a>
          </p>
        </form>

        {/* Demo Credentials */}
      </div>
    </div>
  )
}
