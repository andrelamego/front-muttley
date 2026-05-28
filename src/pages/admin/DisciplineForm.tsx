import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';
import type { Professor, Person } from '../../data/types';
import { FormSkeleton } from '../../components/ui';

export const DisciplineForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [turno, setTurno] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Load existing discipline and professor options
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const profs = await db.getProfessors();
        const ppl = await db.getPeople();
        setProfessors(profs);
        setPeople(ppl);

        if (id) {
          const disciplines = await db.getDisciplines();
          const found = disciplines.find(d => d.id === id);
          if (found) {
            setNome(found.nome);
            setTurno(found.turno);
            setProfessorId(found.professorId);
            setDescricao(found.descricao);
          } else {
            setErro('Disciplina não encontrada.');
          }
        }
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const professorList = professors.map(prof => {
    const person = people.find(p => p.id === prof.pessoaId);
    return {
      id: prof.id,
      name: person ? person.nome : prof.titulacao,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome || !turno || !professorId) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        id: id || undefined,
        nome,
        turno,
        professorId,
        descricao,
      };
      
      await db.saveDiscipline(payload);
      navigate('/admin/disciplinas');
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar disciplina.');
    }
  };

  if (loading) {
    return <div className="admin-page"><FormSkeleton fields={4} /></div>;
  }

  return (
    <div className="admin-page">
      <h1>{id ? 'Editar disciplina' : 'Nova disciplina'}</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Nome:*</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da disciplina"
              required
            />
          </label>

          <label className="field">
            <span>Turno:*</span>
            <input
              type="text"
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              placeholder="Ex: Matutino, Vespertino, Noturno"
              required
            />
          </label>

          <label className="field">
            <span>Professor:*</span>
            <select
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              required
            >
              <option value="">Selecione um professor</option>
              {professorList.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field description-field">
            <span>Descrição:</span>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo da disciplina"
              rows={4}
            />
          </label>
        </div>

        <div className="form-actions">
          <Link to="/admin/disciplinas">Cancelar</Link>
          <button className="primary-action" type="submit">
            {id ? 'Salvar alterações' : 'Criar disciplina'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisciplineForm;
