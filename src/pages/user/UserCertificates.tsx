import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const UserCertificates: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const loggedUser = db.getLoggedUser();

  // Redirect if not logged in
  if (!loggedUser) {
    navigate('/login');
    return null;
  }

  // Fetch data
  const participations = db.getParticipations().filter(p => p.pessoaId === loggedUser.id);
  const events = db.getEvents();
  const certificates = db.getCertificates().filter(c => participations.some(p => p.id === c.participacaoId));

  // Map certificates with event information
  const userCerts = certificates.map(cert => {
    const part = participations.find(p => p.id === cert.participacaoId);
    const evt = part ? events.find(e => e.id === part.eventoId) : null;
    return {
      ...cert,
      event: evt,
      participation: part,
    };
  });

  // Filter based on search query
  const filteredCerts = userCerts.filter(c =>
    c.event?.tema.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-certs-container p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1 border-b border-brand-line pb-4">
        <h2 className="text-2xl font-extrabold text-brand-ink-strong">Meus Certificados</h2>
        <p className="text-xs text-brand-muted">
          Gerencie e compartilhe suas comprovações de presença e conclusão de atividades.
        </p>
      </div>

      {/* Search Input */}
      <div className="search-bar relative">
        <input
          type="text"
          placeholder="Buscar certificados por evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none text-sm bg-brand-surface shadow-sm"
        />
        <span className="absolute left-3 top-3 text-brand-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      {/* Certificates List */}
      {filteredCerts.length === 0 ? (
        <div className="text-center py-12 bg-brand-surface rounded-xl border border-brand-line p-6">
          <p className="text-brand-muted text-sm">
            {search ? 'Nenhum certificado corresponde à sua busca.' : 'Você ainda não possui certificados emitidos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCerts.map(cert => {
            const issueDate = new Date(cert.dataEmissao);
            const formattedIssueDate = issueDate.toLocaleDateString('pt-BR');
            const issueYear = issueDate.getFullYear();
            const issueMonth = issueDate.getMonth() + 1;

            const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
              cert.event?.tema || 'Certificado Muttley'
            )}&organizationName=${encodeURIComponent(
              'FATEC Zona Leste'
            )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
              window.location.origin + `/certificados/${cert.codigoValidacao}`
            )}&certId=${cert.codigoValidacao}`;

            return (
              <div key={cert.id} className="bg-brand-surface border border-brand-line rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full self-start">
                    Certificado de {cert.participation?.tipo || 'Participação'}
                  </span>
                  <h3 className="text-base font-bold text-brand-ink-strong truncate-2-lines">{cert.event?.tema || 'Evento'}</h3>
                  <div className="flex flex-col gap-1 text-xs text-brand-muted mt-1">
                    <span>Emissão: {formattedIssueDate}</span>
                    <span className="flex items-center gap-1.5 mt-1">
                      Chave:
                      <span className="font-mono bg-brand-surface-soft px-1.5 py-0.5 rounded border border-brand-line text-[10px] select-all">
                        {cert.codigoValidacao}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-brand-line/50">
                  <Link to={`/certificados/${cert.codigoValidacao}`} className="primary-action text-xs text-center py-2 font-bold !bg-teal-600 hover:!bg-teal-700 text-white">
                    Visualizar Certificado
                  </Link>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-action text-xs text-center py-2 font-bold rounded-lg text-white flex items-center justify-center gap-1.5 bg-sky-700 hover:bg-sky-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Compartilhar no LinkedIn
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserCertificates;
