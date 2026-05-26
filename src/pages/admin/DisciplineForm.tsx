import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const DisciplineForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [turno, setTurno] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  // Load existing discipline if in edit mode
  useEffect(() => {
    if (id) {
      const disciplines = db.getDisciplines();
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
  }, [id]);

  // Load professors for selection
  const professors = db.getProfessors();
  const people = db.getPeople();
  
  const professorList = professors.map(prof => {
    const person = people.find(p => p.id === prof.pessoaId);
    return {
      id: prof.id,
      name: person ? person.nome : prof.titulacao,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome || !turno || !professorId) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const disciplines = db.getDisciplines();
    
    if (id) {
      // Edit
      const updated = disciplines.map(d => 
        d.id === id ? { ...d, nome, turno, professorId, descricao } : d
      );
      db.saveDisciplines(updated);
    } else {
      // New
      const newDisc = {
        id: `disc-${Date.now()}`,
        nome,
        turno,
        professorId,
        descricao,
      };
      db.saveDisciplines([...disciplines, newDisc]);
    }

    navigate('/admin/disciplinas');
  };

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
