import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const CertificateView: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (codigo) {
      setLoading(true);
      db.getCertificateByCode(codigo)
        .then(setData)
        .catch(err => {
          console.error(err);
          setErro('Certificado não encontrado ou código inválido.');
        })
        .finally(() => setLoading(false));
    }
  }, [codigo]);

  const handleCopyKey = async () => {
    if (!data?.certificado) return;
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
    if (navigator.share && data?.certificado) {
      const event = data.certificado.event;
      try {
        await navigator.share({
          title: `Certificado - ${event?.tema || 'Muttley'}`,
          text: `Confira meu certificado de participação no evento ${event?.tema || 'Muttley'}! Código de validação: ${data.certificado.codigoValidacao}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (erro || !data?.certificado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 bg-brand-surface rounded-xl border border-brand-line shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-brand-danger">Certificado não encontrado</h2>
          <p className="text-brand-muted mt-2">{erro || 'O código de validação fornecido é inválido.'}</p>
          <Link to="/certificados/publico" className="primary-action mt-6 inline-flex items-center">
            Voltar para Validação
          </Link>
        </div>
      </div>
    );
  }

  const { certificado, linkedinUrl } = data;
  // Wait, let's see. In db.getCertificateByCode:
  // we mapped 'certificado' using normalizeCertificate, but in normalizeCertificate we only returned flat structure.
  // Wait! In mockDb.ts, getCertificateByCode was defined as:
  //   async getCertificateByCode(code: string) {
  //     const res = await apiClient.get(`/certificados/${code}`);
  //     return {
  //       certificado: normalizeCertificate(res.data.certificado), ...
  //     }
  //   }
  // Wait! If normalizeCertificate flattens it, do we lose the nested details?
  // Let's check normalizeCertificate in mockDb.ts:
  // export const normalizeCertificate = (c: any): Certificate => ({
  //   id: String(c.id),
  //   participacaoId: c.participacao ? String(c.participacao.id) : '',
  //   dataEmissao: c.dataEmissao,
  //   assinatura: c.assinatura || 'Coordenação FATEC ZL',
  //   codigoValidacao: c.codigoValidacao,
  //   urlPublica: `/certificados/${c.codigoValidacao}`
  // });
  // Ah! It flattens it and returns Certificate interface!
  // But wait, if it flattens it, does the rest of the raw nested properties still exist? No, because we create a new object.
  // Wait, we can add a raw field or return the nested objects inside `getCertificateByCode`!
  // Let's modify `getCertificateByCode` in `mockDb.ts` or read it:
  // Let's check `getCertificateByCode` in `mockDb.ts`:
  //   async getCertificateByCode(code: string): Promise<{ certificado: Certificate, linkedinUrl: string }> { ... }
  // We can return the nested objects alongside it, or we can add optional properties like `participation`, `event`, `person` to the returned certificate object!
  // Let's check: in `CertificateView.tsx`, we can access:
  // - `person`: `certificado.participation?.pessoa` or similar.
  // Let's see: yes! In `mockDb.ts`, let's extend the returned object or mapping to include nested objects if they are present!
  // Wait, let's inspect the `normalizeCertificate` inside `mockDb.ts`:
  // export const normalizeCertificate = (c: any): Certificate & { participation?: any } => ({ ... })
  // In `mockDb.ts` we wrote:
  // export const normalizeCertificate = (c: any): Certificate => ({
  //   id: String(c.id),
  //   participacaoId: c.participacao ? String(c.participacao.id) : '', ...
  //
  // Let's check: if we fetch the certificate by code, can we just get the nested objects directly from `res.data.certificado`?
  // Yes! The raw `res.data.certificado` has `participacao` with `pessoa` and `evento` nested!
  // So:
  // - `part` = res.data.certificado.participacao
  // - `event` = res.data.certificado.participacao.evento
  // - `person` = res.data.certificado.participacao.pessoa
  // We can just keep the raw response in `data.rawCert` or add these fields inside `db.getCertificateByCode`!
  // Let's write `getCertificateByCode` return value in `mockDb.ts` to include:
  // `certificado`: normalized certificate
  // `raw`: raw response with nested objects.
  // Let's look at `CertificateView.tsx` where we can define:
  // `const part = certificado.participation || data.raw?.participacao;`
  // Wait! Let's check how we can write `db.getCertificateByCode` in `mockDb.ts`.
  // Currently, `mockDb.ts` is:
  //   async getCertificateByCode(code: string): Promise<{ certificado: Certificate, linkedinUrl: string }> {
  //     const res = await apiClient.get(`/certificados/${code}`);
  //     return {
  //       certificado: normalizeCertificate(res.data.certificado),
  //       linkedinUrl: res.data.linkedinUrl
  //     };
  //   }
  // Let's check: if we normalize the certificate, can we also attach `participation`, `event`, and `person` as properties if we want?
  // Let's check if the raw response details are available.
  // Yes! In `CertificateView.tsx`:

  const rawCert = data.raw;
  const rawPart = rawCert?.participacao;
  const rawEvent = rawPart?.evento;
  const rawPerson = rawPart?.pessoa;

  // Calculate preambulo and details based on role
  const roleName = rawPart?.tipo === 'Aluno' ? 'Aluno' : rawPart?.tipo === 'Professor' ? 'Professor' : 'Participante';
  const preambulo = rawPart?.tipo === 'Palestrante'
    ? 'por ministrar a palestra '
    : rawPart?.tipo === 'Organizador'
    ? 'por organizar o evento '
    : 'por participar e concluir as atividades do evento ';

  // Date parsing
  const eventDate = rawEvent ? new Date(rawEvent.data) : new Date();
  const formattedDateString = rawEvent ? eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : '';
  const issueDate = new Date(certificado.dataEmissao);
  const formattedIssueDate = issueDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <main className="admin-page public-certificate-view mx-auto p-4 md:p-8 flex flex-col gap-8 max-w-5xl">
      <div className="page-title-row flex items-center justify-between border-b border-brand-line pb-4">
        <div>
          <span className="public-certificate-status">
            <svg className="w-4 h-4 mr-1 text-emerald-500 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Certificado Válido
          </span>
          <h1 className="text-3xl font-extrabold text-brand-ink-strong mt-1">Validação de Certificado</h1>
        </div>
        <Link className="link-action" to="/certificados/publico">Voltar</Link>
      </div>

      <div className="flex flex-col gap-8">
        {/* Certificate Mock Visual Display */}
        <section className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-ink-strong">Visualização do Certificado</h2>
            <div className="public-certificate-actions flex gap-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="primary-action px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                style={{
                  backgroundColor: copiedKey ? 'var(--primary-strong)' : 'var(--surface-soft)',
                  color: copiedKey ? '#fff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'none',
                }}
                onClick={handleCopyKey}
              >
                {copiedKey ? 'Chave Copiada! ✔' : 'Copiar Chave'}
              </button>
              <button
                type="button"
                className="primary-action px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                style={{
                  backgroundColor: copiedLink ? 'var(--primary-strong)' : 'var(--surface-soft)',
                  color: copiedLink ? '#fff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'none',
                }}
                onClick={handleCopyLink}
              >
                {copiedLink ? 'Link Copiado! ✔' : 'Copiar Link'}
              </button>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  className="primary-action px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--surface-soft)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'none',
                  }}
                  onClick={handleShare}
                >
                  Compartilhar
                </button>
              )}
              <a className="primary-action linkedin-action flex items-center px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                 href={linkedinUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 style={{ boxShadow: 'none' }}>
                <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Adicionar no LinkedIn
              </a>
              <button
                className="primary-action px-4 py-2 bg-brand-primary hover:bg-brand-primary-strong text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                onClick={() => window.print()}
                style={{ boxShadow: 'none' }}
              >
                Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Elegant Certificate HTML Visual matching the modelo.css layout */}
          <div className="certificate-preview-shell border border-brand-line rounded-xl overflow-hidden shadow-md bg-white relative w-full aspect-[1.414/1] print:border-0 print:shadow-none print:w-screen print:h-screen print:absolute print:inset-0">
            <div className="certificado w-full h-full p-8 md:p-12 flex flex-col justify-between items-center text-center bg-white bg-no-repeat bg-contain bg-center relative" style={{ backgroundImage: "url('/Fundo.jpg')" }}>
              
              <div className="section-titulo w-full mt-6">
                <h2 className="text-titulo text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-amber-500 tracking-wider">
                  CERTIFICADO
                </h2>
              </div>

              <div className="section-conteudo w-full flex flex-col items-center justify-center my-4">
                <p className="text-destinatario text-sm md:text-lg text-slate-800">
                  Este certificado é concedido ao <span className="font-semibold text-slate-900 lowercase">{roleName}</span>
                </p>
                <h3 className="text-nome-destinatario text-lg md:text-2xl font-bold text-slate-900 border-b-2 border-brand-primary/20 pb-1 px-4 my-2">
                  {rawPerson?.nome || 'Nome Completo'}
                </h3>
                <p className="text-descricao text-xs md:text-sm text-slate-700 max-w-xl leading-relaxed text-justify mx-auto">
                  {preambulo} <strong>{rawEvent?.tema || 'Evento'}</strong> realizado no dia {formattedDateString}, promovido pelo Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas da FATEC Zona Leste.
                </p>
                <p className="text-descricao text-xs md:text-sm text-slate-700 mt-2">
                  O evento foi realizado com carga horária de 2 (duas) horas.
                </p>
                <p className="text-data text-xs md:text-sm text-slate-600 mt-4 italic">
                  São Paulo, {formattedIssueDate}
                </p>
              </div>

              <div className="section-assinatura w-full flex flex-col items-center mb-6">
                <div className="w-48 border-t border-slate-900 my-1"></div>
                <p className="text-assinatura text-[10px] md:text-xs text-slate-500 font-medium">
                  Coordenador do curso de Análise e Desenvolvimento de Sistemas da FATEC Zona Leste
                </p>
                <span className="text-[8px] font-mono text-slate-400 mt-2 block">
                  Autenticidade garantida sob o código {certificado.codigoValidacao}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Certificate Metadata */}
        <section className="w-full flex flex-col gap-6">
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
              <div>
                <dt className="text-xs text-brand-muted font-bold uppercase">CPF</dt>
                <dd className="text-sm font-semibold text-brand-ink-strong">{rawPerson?.cpf ? rawPerson.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.***-**') : 'N/A'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-brand-muted font-bold uppercase">Evento</dt>
                <dd className="text-sm font-semibold text-brand-ink-strong">{rawEvent?.tema || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted font-bold uppercase">Carga Horária</dt>
                <dd className="text-sm font-semibold text-brand-ink-strong">2 horas</dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted font-bold uppercase">Emissão</dt>
                <dd className="text-sm font-semibold text-brand-ink-strong">{formattedIssueDate}</dd>
              </div>
              <div>
                <dt className="text-xs text-brand-muted font-bold uppercase">Cód. Validação</dt>
                <dd className="text-sm font-mono font-bold text-brand-primary">{certificado.codigoValidacao}</dd>
              </div>
              <div className="col-span-full">
                <dt className="text-xs text-brand-muted font-bold uppercase">Assinatura Digital</dt>
                <dd className="text-xs font-mono break-all bg-brand-surface-soft p-2.5 rounded border border-brand-line mt-1">{certificado.assinatura}</dd>
              </div>
            </dl>
          </article>
        </section>
      </div>
    </main>
  );
};

export default CertificateView;
