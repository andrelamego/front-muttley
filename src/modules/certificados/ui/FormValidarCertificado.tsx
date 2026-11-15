import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../../../shared/ui'

/** Campo do código e o botão: leva à consulta pública do certificado. */
export const FormValidarCertificado: React.FC<{
  id?: string
  className?: string
}> = ({ id = 'codigo-certificado', className = '' }) => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')

  const consultar = (e: React.FormEvent) => {
    e.preventDefault()
    const limpo = codigo.trim()
    if (limpo) navigate(`/certificados/${encodeURIComponent(limpo)}`)
  }

  return (
    <form
      onSubmit={consultar}
      className={`flex flex-col gap-3 rounded-md bg-[var(--color-bg-surface)] p-4 sm:flex-row sm:items-center ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Código de validação do certificado
      </label>
      <input
        id={id}
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código de validação"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
        className="min-h-[44px] flex-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-2.5 font-mono text-sm text-[var(--color-text-primary)] placeholder:font-sans placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
      <Button type="submit" leftIcon={<ShieldCheck className="size-4" />}>
        Validar certificado
      </Button>
    </form>
  )
}
