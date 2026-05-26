import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const LocalForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState(10);
  const [enderecoId, setEnderecoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  // Load existing local
  useEffect(() => {
    if (id) {
      const locais = db.getLocais();
      const found = locais.find(l => l.id === id);
      if (found) {
        setNome(found.nome);
        setCapacidade(found.capacidade);
        setEnderecoId(found.enderecoId);
        setDescricao(found.descricao);
      } else {
        setErro('Local não encontrado.');
      }
    }
  }, [id]);

  // Load addresses for selection
  const addresses = db.getAddresses();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome || !capacidade || !enderecoId) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const locais = db.getLocais();

    if (id) {
      // Edit
      const updated = locais.map(l => 
        l.id === id ? { ...l, nome, capacidade: Number(capacidade), enderecoId, descricao } : l
      );
      db.saveLocais(updated);
    } else {
      // New
      const newLocal = {
        id: `loc-${Date.now()}`,
        nome,
        capacidade: Number(capacidade),
        enderecoId,
        descricao,
      };
      db.saveLocais([...locais, newLocal]);
    }

    navigate('/admin/locais');
  };

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar local' : 'Novo local'}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Nome:*</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do local"
              required
            />
          </label>

          <label className="field">
            <span>Capacidade:*</span>
            <input
              type="number"
              value={capacidade}
              onChange={(e) => setCapacidade(Number(e.target.value))}
              min={1}
              placeholder="Ex: 120"
              required
            />
          </label>

          <label className="field">
            <span>Endereço:*</span>
            <select
              value={enderecoId}
              onChange={(e) => setEnderecoId(e.target.value)}
              required
            >
              <option value="">Selecione um endereço</option>
              {addresses.map(addr => (
                <option key={addr.id} value={addr.id}>
                  {addr.logradouro}, {addr.numero} - {addr.cidade}
                </option>
              ))}
            </select>
          </label>

          <label className="field description-field">
            <span>Descrição:</span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo do local"
              rows={4}
            />
          </label>
        </div>

        <div className="form-actions">
          <Link to="/admin/locais">Cancelar</Link>
          <button className="primary-action" type="submit">
            {id ? 'Salvar alterações' : 'Criar local'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocalForm;
