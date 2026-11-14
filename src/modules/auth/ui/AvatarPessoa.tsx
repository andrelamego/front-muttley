import React from 'react'
import { useAuth } from '../application/useAuth'
import { useFotoPerfil } from '../application/fotoPerfil'
import { getInitials } from '../../../shared/lib/iniciais'

/** Avatar da pessoa logada: a foto, ou as iniciais sobre o amarelo de sinalização. */
export const AvatarPessoa: React.FC<{ className?: string; texto?: string }> = ({
  className = 'size-8 text-xs',
  texto,
}) => {
  const { user } = useAuth()
  const foto = useFotoPerfil()
  return foto ? (
    <img
      src={foto}
      alt=""
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  ) : (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-[var(--color-signal)] font-bold text-[var(--color-signal-ink)] ${className}`}
    >
      {texto ?? getInitials(user?.nome)}
    </span>
  )
}
