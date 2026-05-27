import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const loggedUser = db.getLoggedUser();

  // If not logged in, redirect to login
  if (!loggedUser) {
    navigate('/login');
    return null;
  }

  // Fetch user data
  const participations = db.getParticipations().filter(p => p.pessoaId === loggedUser.id);
  const events = db.getEvents();
  const locations = db.getLocais();
  const certificates = db.getCertificates().filter(c => participations.some(p => p.id === c.participacaoId));
  const medals = db.getMedals().filter(m => participations.some(p => p.id === m.participacaoId));

  // Events the user is registered in
  const userEvents = events
    .filter(e => participations.some(p => p.eventoId === e.id))
    .map(e => {
      const part = participations.find(p => p.eventoId === e.id);
      const loc = locations.find(l => l.id === e.localId);
      const cert = part ? db.getCertificates().find(c => c.participacaoId === part.id) : null;
      return {
        ...e,
        participation: part,
        location: loc,
        certificate: cert,
      };
    });

  // Available upcoming events (not registered in)
  const availableEvents = events
    .filter(e => e.status === 'EM_ANDAMENTO' && !participations.some(p => p.eventoId === e.id))
    .map(e => ({
      ...e,
      location: locations.find(l => l.id === e.localId),
    }));

  const handleRegisterEvent = (eventId: string) => {
    try {
      const allParts = db.getParticipations();
      const inscricaoNum = String(1000 + allParts.length + 1);
      const newPart = {
        id: `part-${Date.now()}`,
        eventoId: eventId,
        pessoaId: loggedUser.id,
        inscricao: inscricaoNum,
        tipo: 'Aluno' as const,
        presente: false,
      };
      db.saveParticipations([...allParts, newPart]);
      // Force reload to update UI
      window.location.reload();
    } catch (err) {
      console.error('Erro ao inscrever-se no evento:', err);
    }
  };

  return (
    <div className="user-dashboard-container p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Welcome Banner */}
      <section className="welcome-banner bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-center min-h-[140px]">
        <div className="z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200">Área do Aluno</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-1">Olá, {loggedUser.nome}!</h2>
          <p className="text-sm text-teal-100 mt-2">Bem-vindo de volta ao seu painel acadêmico Muttley.</p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none" style={{ transform: 'translateX(20px)' }}>
          <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z"/>
          </svg>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-3 gap-3 md:gap-4" aria-label="Indicadores Rápidos">
        <Link to="/user/inicio" className="stat-card bg-brand-surface border border-brand-line rounded-xl p-3 md:p-4 text-center shadow-sm flex flex-col items-center justify-center gap-1 hover:border-brand-primary transition-all">
          <span className="text-2xl font-extrabold text-brand-primary">{participations.length}</span>
          <span className="text-[10px] md:text-xs text-brand-muted font-bold uppercase tracking-wide">Inscrições</span>
        </Link>
        <Link to="/user/certificados" className="stat-card bg-brand-surface border border-brand-line rounded-xl p-3 md:p-4 text-center shadow-sm flex flex-col items-center justify-center gap-1 hover:border-brand-primary transition-all">
          <span className="text-2xl font-extrabold text-teal-600">{certificates.length}</span>
          <span className="text-[10px] md:text-xs text-brand-muted font-bold uppercase tracking-wide">Certificados</span>
        </Link>
        <Link to="/user/medalhas" className="stat-card bg-brand-surface border border-brand-line rounded-xl p-3 md:p-4 text-center shadow-sm flex flex-col items-center justify-center gap-1 hover:border-brand-primary transition-all">
          <span className="text-2xl font-extrabold text-amber-500">{medals.length}</span>
          <span className="text-[10px] md:text-xs text-brand-muted font-bold uppercase tracking-wide">Medalhas</span>
        </Link>
      </section>

      {/* Main Section: Registered Events */}
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-brand-ink-strong">Meus Eventos</h3>
        
        {userEvents.length === 0 ? (
          <div className="text-center py-8 bg-brand-surface rounded-xl border border-brand-line p-6">
            <p className="text-brand-muted text-sm">Você não está inscrito em nenhum evento.</p>
            <p className="text-xs text-brand-muted mt-1">Explore os eventos disponíveis abaixo para participar!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {userEvents.map(evt => {
              const date = new Date(evt.data);
              const formattedDate = date.toLocaleDateString('pt-BR');
              const isClosed = evt.status === 'FINALIZADO';
              const isPresent = evt.participation?.presente;

              return (
                <div key={evt.id} className="bg-brand-surface border border-brand-line rounded-xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        isClosed 
                          ? isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isClosed 
                          ? isPresent ? 'Presença Confirmada' : 'Faltou'
                          : 'Inscrito (Aguardando)'}
                      </span>
                      <h4 className="text-base font-bold text-brand-ink-strong mt-1.5 truncate-2-lines">{evt.tema}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-brand-muted border-t border-brand-line/50 pt-3">
                    <div>
                      <span className="block font-semibold">Data e Hora</span>
                      <span>{formattedDate} às {evt.horarioInicio}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">Local</span>
                      <span className="truncate block">{evt.location?.nome || 'Online'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 w-full pt-1">
                    <Link to={`/user/evento/${evt.id}`} className="secondary-action text-xs text-center flex-1 py-2 font-semibold">
                      Detalhes
                    </Link>
                    {isClosed && isPresent && evt.certificate && (
                      <Link to={`/certificados/${evt.certificate.codigoValidacao}`} className="primary-action text-xs text-center flex-1 py-2 font-bold !bg-teal-600 hover:!bg-teal-700 text-white">
                        Certificado
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Available Events */}
      {availableEvents.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-brand-ink-strong">Eventos Disponíveis</h3>
          <div className="flex flex-col gap-3">
            {availableEvents.map(evt => {
              const date = new Date(evt.data);
              const formattedDate = date.toLocaleDateString('pt-BR');

              return (
                <div key={evt.id} className="bg-brand-surface border border-brand-line rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Inscrições Abertas
                    </span>
                    <h4 className="text-base font-bold text-brand-ink-strong mt-1.5">{evt.tema}</h4>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2">{evt.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-brand-muted border-t border-brand-line/50 pt-3">
                    <div>
                      <span className="block font-semibold">Data e Hora</span>
                      <span>{formattedDate} às {evt.horarioInicio}</span>
                    </div>
                    <div>
                      <span className="block font-semibold">Local</span>
                      <span className="truncate block">{evt.location?.nome || 'Online'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <Link to={`/user/evento/${evt.id}`} className="secondary-action text-xs text-center flex-1 py-2 font-semibold">
                      Saiba Mais
                    </Link>
                    <button
                      onClick={() => handleRegisterEvent(evt.id)}
                      className="primary-action text-xs text-center flex-1 py-2 font-bold cursor-pointer"
                      type="button"
                    >
                      Inscrever-se
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Achievements */}
      {(certificates.length > 0 || medals.length > 0) && (
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-brand-ink-strong">Conquistas Recentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Certificados Recentes */}
            {certificates.length > 0 && (
              <div className="bg-brand-surface border border-brand-line rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-brand-line/50">
                  <h4 className="text-sm font-bold text-brand-ink-strong">Último Certificado</h4>
                  <Link to="/user/certificados" className="text-[11px] text-brand-primary font-bold hover:underline">
                    Ver Todos
                  </Link>
                </div>
                {(() => {
                  const cert = certificates[certificates.length - 1];
                  const part = participations.find(p => p.id === cert.participacaoId);
                  const evt = events.find(e => e.id === part?.eventoId);

                  return (
                    <div className="flex flex-col gap-2">
                      <strong className="text-xs text-brand-ink-strong truncate block">{evt?.tema}</strong>
                      <span className="text-[11px] text-brand-muted">Emissão: {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[11px] font-mono bg-brand-surface-soft p-1.5 rounded border border-brand-line max-w-max select-all">
                        {cert.codigoValidacao}
                      </span>
                      <Link to={`/certificados/${cert.codigoValidacao}`} className="primary-action text-xs text-center py-1.5 mt-2 font-bold !bg-teal-600 text-white">
                        Visualizar Certificado
                      </Link>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Medalhas Recentes */}
            {medals.length > 0 && (
              <div className="bg-brand-surface border border-brand-line rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-brand-line/50">
                  <h4 className="text-sm font-bold text-brand-ink-strong">Última Medalha</h4>
                  <Link to="/user/medalhas" className="text-[11px] text-brand-primary font-bold hover:underline">
                    Ver Todas
                  </Link>
                </div>
                {(() => {
                  const medal = medals[medals.length - 1];
                  const part = participations.find(p => p.id === medal.participacaoId);
                  const evt = events.find(e => e.id === part?.eventoId);

                  return (
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                        🏅
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs text-brand-ink-strong block truncate">{medal.nome}</strong>
                        <span className="text-[10px] text-brand-primary font-bold block truncate">{evt?.tema}</span>
                        <p className="text-[11px] text-brand-muted mt-1 leading-relaxed line-clamp-2">{medal.descricao}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default UserDashboard;
