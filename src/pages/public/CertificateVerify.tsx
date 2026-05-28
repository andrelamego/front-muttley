import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const CertificateVerify: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const formattedCode = codigo.trim().toUpperCase();
    try {
      // Validar o certificado chamando a API diretamente
      await db.getCertificateByCode(formattedCode);
      navigate(`/certificados/${formattedCode}`);
    } catch (err: any) {
      setErro('Certificado não encontrado. Verifique o código e tente novamente.');
    }
  };

  return (
    <div className="auth-body min-h-screen flex items-center justify-center p-4">
      <main className="public-certificate-panel w-full max-w-lg bg-brand-surface rounded-xl shadow-lg border border-brand-line p-8">
        <div className="text-center mb-6">
          <Link className="brand text-brand-primary text-3xl font-extrabold" to="/login">
            Muttley
          </Link>
          <h1 className="text-2xl font-extrabold text-brand-ink-strong mt-4">Validar Certificado</h1>
          <p className="text-brand-muted text-sm mt-2">
            Insira o código de validação impresso no verso do certificado para confirmar sua autenticidade.
          </p>
        </div>

        {erro && <div className="alert alert-danger mb-4 text-sm">{erro}</div>}

        <form onSubmit={handleSubmit} className="event-form flex flex-col gap-4 !mt-0 !p-0 !border-0 !shadow-none !bg-transparent">
          <label className="field">
            <span className="text-sm font-semibold text-brand-ink-strong">Código de Validação</span>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: MUTE-928A-817B"
              required
              className="w-full px-4 py-3 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none text-center font-mono uppercase tracking-wider text-lg"
            />
          </label>

          <button
            type="submit"
            className="primary-action w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer text-base mt-2"
          >
            Verificar Autenticidade
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-brand-line text-xs text-brand-muted flex justify-between">
          <Link className="hover:underline text-brand-primary" to="/login">
            Acessar o Painel
          </Link>
          <span>
            Códigos de teste: <strong className="text-brand-ink-strong font-mono">MUTE-928A-817B</strong>
          </span>
        </div>
      </main>
    </div>
  );
};

export default CertificateVerify;
