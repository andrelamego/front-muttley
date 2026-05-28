import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import { FormSkeleton } from '../../components/ui';

export const AddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [numero, setNumero] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Load existing address
  useEffect(() => {
    if (id) {
      const loadAddress = async () => {
        setLoading(true);
        try {
          const addresses = await db.getAddresses();
          const found = addresses.find(a => a.id === id);
          if (found) {
            setEstado(found.estado);
            setCidade(found.cidade);
            setBairro(found.bairro);
            setNumero(found.numero);
            setLogradouro(found.logradouro);
            setComplemento(found.complemento || '');
          } else {
            setErro('Endereço não encontrado.');
          }
        } catch (err: any) {
          setErro(err.message || 'Erro ao carregar endereço.');
        } finally {
          setLoading(false);
        }
      };
      loadAddress();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!estado || !cidade || !bairro || !numero || !logradouro) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        id: id || undefined,
        estado: estado.toUpperCase().substring(0, 2),
        cidade,
        bairro,
        numero: String(Number(numero)),
        logradouro,
        complemento: complemento.trim() || '—', // Ensure non-blank complemento to satisfy @NotBlank backend validation
      };

      await db.saveAddress(payload);
      navigate('/admin/locais');
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar endereço.');
    }
  };

  if (loading) {
    return <div className="admin-page"><FormSkeleton fields={6} /></div>;
  }

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar endereço' : 'Novo endereço'}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Estado (UF):*</span>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              maxLength={2}
              placeholder="Ex: SP"
              required
            />
          </label>

          <label className="field">
            <span>Cidade:*</span>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Nome da cidade"
              required
            />
          </label>

          <label className="field">
            <span>Bairro:*</span>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Nome do bairro"
              required
            />
          </label>

          <label className="field">
            <span>Número:*</span>
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 100"
              required
            />
          </label>

          <label className="field description-field">
            <span>Logradouro:*</span>
            <input
              type="text"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              placeholder="Rua, avenida ou travessa"
              required
            />
          </label>

          <label className="field description-field">
            <span>Complemento:</span>
            <input
              type="text"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Bloco, sala, andar ou referência"
            />
          </label>
        </div>

        <div className="form-actions">
          <Link to="/admin/locais">Cancelar</Link>
          <button className="primary-action" type="submit">
            {id ? 'Salvar alterações' : 'Criar endereço'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
