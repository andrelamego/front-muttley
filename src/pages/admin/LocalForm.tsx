import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Address } from '../../data/types';
import { FormSkeleton } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

export const LocalForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState(10);
  const [enderecoId, setEnderecoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing local and addresses
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const addrs = await db.getAddresses();
        setAddresses(addrs);

        if (id) {
          const locais = await db.getLocais();
          const found = locais.find(l => l.id === id);
          if (found) {
            setNome(found.nome);
            setCapacidade(found.capacidade);
            setEnderecoId(found.enderecoId);
            setDescricao(found.descricao);
          } else {
            toast.error('Local não encontrado.');
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !capacidade || !enderecoId) {
      toast.warning('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        id: id || undefined,
        nome,
        capacidade: Number(capacidade),
        enderecoId,
        descricao,
      };
      
      await db.saveLocal(payload);
      toast.success(id ? 'Local atualizado com sucesso.' : 'Local criado com sucesso.');
      navigate('/admin/locais');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar local.');
    }
  };

  if (loading) {
    return <div className="admin-page"><FormSkeleton fields={4} /></div>;
  }

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar local' : 'Novo local'}</h1>

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
