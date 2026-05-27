import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../data/mockDb';

export const UserMedals: React.FC = () => {
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
  const medals = db.getMedals().filter(m => participations.some(p => p.id === m.participacaoId));

  // Map medals with event info
  const userMedals = medals.map(medal => {
    const part = participations.find(p => p.id === medal.participacaoId);
    const evt = part ? events.find(e => e.id === part.eventoId) : null;
    return {
      ...medal,
      event: evt,
    };
  });

  // Filter based on search query
  const filteredMedals = userMedals.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.event?.tema.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-medals-container p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1 border-b border-brand-line pb-4">
        <h2 className="text-2xl font-extrabold text-brand-ink-strong">Minhas Medalhas</h2>
        <p className="text-xs text-brand-muted">
          Suas conquistas de destaque técnico e acadêmico em eventos da FATEC Zona Leste.
        </p>
      </div>

      {/* Search Input */}
      <div className="search-bar relative">
        <input
          type="text"
          placeholder="Buscar por nome da medalha ou evento..."
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

      {/* Medals Grid */}
      {filteredMedals.length === 0 ? (
        <div className="text-center py-12 bg-brand-surface rounded-xl border border-brand-line p-6">
          <p className="text-brand-muted text-sm">
            {search ? 'Nenhuma medalha corresponde à sua busca.' : 'Você ainda não possui medalhas emitidas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedals.map(medal => {
            return (
              <div
                key={medal.id}
                className="bg-brand-surface border border-brand-line rounded-xl p-5 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md hover:border-brand-primary/50 transition-all"
              >
                {/* Large Medal Badge Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-4 border-amber-200 animate-pulse-slow">
                  🏅
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <h3 className="text-base font-extrabold text-brand-ink-strong">{medal.nome}</h3>
                  <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider block mt-0.5 truncate" title={medal.event?.tema}>
                    {medal.event?.tema || 'Evento'}
                  </span>
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed p-2 bg-brand-surface-soft rounded border border-brand-line/50 min-h-[64px] flex items-center justify-center">
                    {medal.descricao}
                  </p>
                </div>

                {/* Share Action */}
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(
                        `Conquistei a medalha "${medal.nome}" no evento ${medal.event?.tema || 'Muttley'}!`
                      );
                      alert('Descrição copiada para a área de transferência!');
                    }
                  }}
                  className="secondary-action text-xs py-2 w-full mt-2 font-bold cursor-pointer"
                  type="button"
                >
                  Copiar Conquista
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserMedals;
