import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const ConfirmarPresenca: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cpf, setCpf] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const isValidCpf = (value: string) =>
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setStatus('error');
      setMessage('Evento não identificado. Verifique o QR Code e tente novamente.');
      return;
    }

    if (!cpf.trim()) {
      setStatus('error');
      setMessage('Informe seu CPF.');
      return;
    }

    if (!isValidCpf(cpf)) {
      setStatus('error');
      setMessage('CPF inválido. Use o formato 000.000.000-00.');
      return;
    }

    setStatus('loading');
    setMessage('');

    apiClient
      .post(`/eventos/${id}/confirmar-presenca/${cpf}`)
      .then((res) => {
        setMessage(res.data?.message ?? res.data ?? 'Presença confirmada com sucesso!');
        setStatus('success');
      })
      .catch((err) => {
        setMessage(err.message || 'Não foi possível confirmar sua presença. Tente novamente.');
        setStatus('error');
      });
  };

  return (
    <div className="public-certificate-page">
      <div className="public-certificate-panel">
        <div className="public-event-signup-panel">
          <span>Confirmação de presença</span>
          <h2>Registre sua presença</h2>

          {status === 'error' && (
            <div className="alert alert-danger">{message}</div>
          )}

          {status !== 'success' ? (
            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>CPF:*</span>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  inputMode="numeric"
                  maxLength={14}
                  required
                />
              </label>

              <button
                className="primary-action"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Confirmando...' : 'Confirmar presença'}
              </button>
            </form>
          ) : (
            <div className="public-inscription-modal" style={{ position: 'static', width: '100%', boxShadow: 'none', border: 'none', padding: 0 }}>
              <div className="public-inscription-modal__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="public-inscription-modal__content">
                <span>Presença registrada</span>
                <h2>Tudo certo!</h2>
                <p>{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmarPresenca;