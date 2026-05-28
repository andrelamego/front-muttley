import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import db from '../../data/mockDb';

export const CertificateView: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const previewUrl = useMemo(
    () => (codigo ? `/api/certificados/${encodeURIComponent(codigo)}/preview-html` : ''),
    [codigo],
  );

  const downloadUrl = useMemo(
    () => (codigo ? `/api/certificados/${encodeURIComponent(codigo)}/download` : ''),
    [codigo],
  );

  useEffect(() => {
    if (!codigo) return;

    setLoading(true);
    db.getCertificateByCode(codigo)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setErro('Certificado nao encontrado ou codigo invalido.');
      })
      .finally(() => setLoading(false));
  }, [codigo]);

  const handleCopyKey = async () => {
    if (!data?.certificado?.codigoValidacao) return;
    try {
      await navigator.clipboard.writeText(data.certificado.codigoValidacao);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar a chave', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar o link', err);
    }
  };

  const handleShare = async () => {
    if (!navigator.share || !data?.certificado) return;

    const rawEvent = data.raw?.participacao?.evento;
    try {
      await navigator.share({
        title: `Certificado - ${rawEvent?.tema || 'Muttley'}`,
        text: `Confira meu certificado de participacao no evento ${rawEvent?.tema || 'Muttley'}! Codigo de validacao: ${data.certificado.codigoValidacao}`,
        url: window.location.href,
      });
    } catch (err) {
      console.error('Erro ao compartilhar', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (erro || !data?.certificado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 bg-brand-surface rounded-xl border border-brand-line shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-brand-danger">Certificado nao encontrado</h2>
          <p className="text-brand-muted mt-2">{erro || 'O codigo de validacao fornecido e invalido.'}</p>
          <Link to="/certificados/publico" className="primary-action mt-6 inline-flex items-center">
            Voltar para Validacao
          </Link>
        </div>
      </div>
    );
  }

  const { certificado, linkedinUrl } = data;
  const rawPart = data.raw?.participacao;
  const rawEvent = rawPart?.evento;
  const rawPerson = rawPart?.pessoa;

  return (
    <main className="admin-page public-certificate-view mx-auto p-4 md:p-8 flex flex-col gap-8 max-w-6xl">
      <div className="page-title-row flex items-center justify-between border-b border-brand-line pb-4">
        <div>
          <span className="public-certificate-status">
            <svg className="w-4 h-4 mr-1 text-emerald-500 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Certificado valido
          </span>
          <h1 className="text-3xl font-extrabold text-brand-ink-strong mt-1">Validacao de Certificado</h1>
        </div>
        <Link className="link-action" to="/certificados/publico">Voltar</Link>
      </div>

      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-brand-ink-strong">Visualizacao do Certificado</h2>
          <div className="public-certificate-actions flex gap-2 flex-wrap justify-end">
            <button type="button" className="primary-action px-3 py-2 text-xs font-bold" onClick={handleCopyKey}>
              {copiedKey ? 'Chave copiada' : 'Copiar chave'}
            </button>
            <button type="button" className="primary-action px-3 py-2 text-xs font-bold" onClick={handleCopyLink}>
              {copiedLink ? 'Link copiado' : 'Copiar link'}
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button type="button" className="primary-action px-3 py-2 text-xs font-bold" onClick={handleShare}>
                Compartilhar
              </button>
            )}
            {linkedinUrl && (
              <a className="primary-action linkedin-action px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold"
                 href={linkedinUrl}
                 target="_blank"
                 rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            <a className="primary-action px-4 py-2 bg-brand-primary hover:bg-brand-primary-strong text-white rounded-lg text-xs font-bold"
               href={downloadUrl}
               target="_blank"
               rel="noopener noreferrer">
              Baixar PDF
            </a>
          </div>
        </div>

        <div className="certificate-preview-shell border border-brand-line rounded-xl overflow-hidden shadow-md bg-white w-full aspect-[1.414/1]">
          <iframe
            title="Preview do certificado"
            src={previewUrl}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </section>

      <section className="w-full">
        <article className="stat-panel bg-brand-surface border border-brand-line rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brand-ink-strong mb-4">Dados de Registro</h3>
          <dl className="certificate-data-list">
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">Participante</dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">{rawPerson?.nome || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">E-mail</dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">{rawPerson?.email || 'N/A'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-brand-muted font-bold uppercase">Evento</dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">{rawEvent?.tema || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">Emissao</dt>
              <dd className="text-sm font-semibold text-brand-ink-strong">{certificado.dataEmissao || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-muted font-bold uppercase">Codigo de validacao</dt>
              <dd className="text-sm font-mono font-bold text-brand-primary">{certificado.codigoValidacao}</dd>
            </div>
            <div className="col-span-full">
              <dt className="text-xs text-brand-muted font-bold uppercase">Assinatura</dt>
              <dd className="text-xs font-mono break-all bg-brand-surface-soft p-2.5 rounded border border-brand-line mt-1">
                {certificado.assinatura}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
};

export default CertificateView;
