import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const LocalList: React.FC = () => {
  const [locais, setLocais] = useState(db.getLocais());
  const [addresses, setAddresses] = useState(db.getAddresses());
  const [message, setMessage] = useState('');
  const [erro, setErro] = useState('');

  const handleDeleteLocal = (id: string) => {
    if (window.confirm('Excluir este local?')) {
      const updated = locais.filter(l => l.id !== id);
      db.saveLocais(updated);
      setLocais(updated);
      setMessage('Local excluído com sucesso.');
    }
  };

  const handleDeleteAddress = (id: string) => {
    // Check if address is in use
    const isUsed = locais.some(l => l.enderecoId === id);
    if (isUsed) {
      setErro('Não é possível excluir este endereço pois ele está vinculado a um local.');
      return;
    }

    if (window.confirm('Excluir este endereço?')) {
      const updated = addresses.filter(a => a.id !== id);
      db.saveAddresses(updated);
      setAddresses(updated);
      setMessage('Endereço excluído com sucesso.');
    }
  };

  const getAddressString = (addrId: string) => {
    const addr = addresses.find(a => a.id === addrId);
    return addr ? `${addr.logradouro}, ${addr.numero} - ${addr.cidade}` : '-';
  };

  return (
    <div className="admin-page">
      <div className="page-title-row">
        <h1>Locais</h1>
        <Link className="new-event-button" to="/admin/locais/novo">
          Novo local
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {erro && <div className="alert alert-danger">{erro}</div>}

      <section className="people-panel mb-8">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Capacidade</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locais.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">Nenhum local cadastrado.</td>
              </tr>
            ) : (
              locais.map(l => (
                <tr key={l.id}>
                  <td>{l.nome}</td>
                  <td>{l.descricao}</td>
                  <td>{l.capacidade}</td>
                  <td>{getAddressString(l.enderecoId)}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="table-action" to={`/admin/locais/editar/${l.id}`}>
                        Editar
                      </Link>
                      <button
                        className="table-action danger"
                        onClick={() => handleDeleteLocal(l.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="participants-section mt-12" aria-labelledby="enderecos-title">
        <div className="participants-heading flex items-center justify-between mb-4">
          <h2 id="enderecos-title" className="text-lg font-bold text-brand-ink-strong">Endereços</h2>
          <Link className="new-event-button" to="/admin/locais/enderecos/novo">
            Novo endereço
          </Link>
        </div>

        <div className="people-panel">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Logradouro</th>
                <th>Número</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Complemento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">Nenhum endereço cadastrado.</td>
                </tr>
              ) : (
                addresses.map(a => (
                  <tr key={a.id}>
                    <td>{a.logradouro}</td>
                    <td>{a.numero}</td>
                    <td>{a.bairro}</td>
                    <td>{a.cidade}</td>
                    <td>{a.estado}</td>
                    <td>{a.complemento || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <Link
                          className="table-action"
                          to={`/admin/locais/enderecos/editar/${a.id}`}
                        >
                          Editar
                        </Link>
                        <button
                          className="table-action danger"
                          onClick={() => handleDeleteAddress(a.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LocalList;
