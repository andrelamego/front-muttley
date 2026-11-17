import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import apiClient from '../../services/apiClient'
import { toast } from '../../components/ui/Toast'

export const ConfirmarPresenca: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const codigo = useSearchParams()[0].get('codigo')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!id || !codigo) {
      toast.error(
        'Evento não identificado. Verifique o QR Code e tente novamente.'
      )
      return
    }
    if (!cpf.trim()) {
      toast.warning('Informe seu CPF.')
      return
    }
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf.trim())) {
      toast.warning('CPF inválido. Use o formato 000.000.000-00.')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.post(
        `/eventos/${id}/confirmar-presenca/${cpf}`,
        null,
        { params: { codigo } }
      )
      toast.success(
        response.data?.message ??
          response.data ??
          'Presença confirmada com sucesso!'
      )
      setCpf('')
    } catch (err: any) {
      toast.error(
        err.message ||
          'Não foi possível confirmar sua presença. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-certificate-page">
      <div className="public-certificate-panel">
        <div className="public-event-signup-panel">
          <span>Confirmação de presença</span>
          <h2>Registre sua presença</h2>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span>CPF:*</span>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                disabled={loading}
                inputMode="numeric"
                maxLength={14}
                required
              />
            </label>

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar presença'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConfirmarPresenca
