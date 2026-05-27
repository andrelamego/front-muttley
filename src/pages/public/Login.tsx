import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../data/mockDb';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if redirect message exists
    const regMsg = sessionStorage.getItem('muttley_register_msg');
    if (regMsg) {
      setMessage(regMsg);
      sessionStorage.removeItem('muttley_register_msg');
    }
  }, []);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    try {
      let foundUser;

      if (cpf === '123.456.789-00' && senha === '123') {
        // Bypass backend login for default testing credentials since this user is not in MockDataInitializer
        foundUser = {
          id: '1',
          nome: 'Luciano de Souza',
          email: 'luciano.souza@fatec.sp.gov.br',
          telefone: '(11) 98765-4321',
          cpf: '123.456.789-00',
          senha: '123',
          role: 'ADMIN' as const
        };
        db.setLoggedUser(foundUser);
        navigate('/admin/inicio');
      } else {
        const { default: apiClient } = await import('../../services/apiClient');
        
        // 1. Validar credenciais no backend
        const loginRes = await apiClient.post('/auth/login', { cpf, senha });
        
        // 2. Buscar informações completas da pessoa pelo CPF
        const people = await db.getPeople();
        foundUser = people.find(p => p.cpf === cpf);
        
        if (foundUser) {
          db.setLoggedUser(foundUser);
          if (foundUser.role === 'ADMIN') {
            navigate('/admin/inicio');
          } else {
            navigate('/user/inicio');
          }
        } else {
          // Fallback caso seja um usuário cadastrado manualmente no banco
          const tempUser = {
            id: '999',
            nome: loginRes.data.usuario || 'Usuário',
            email: '',
            telefone: '',
            cpf: cpf,
            role: 'USER' as const
          };
          db.setLoggedUser(tempUser);
          navigate('/user/inicio');
        }
      }
    } catch (err: any) {
      setErro(err.message || 'CPF ou senha incorretos.');
    }
  };

  return (
    <div className="auth-body min-h-screen flex items-center justify-center">
      <main className="auth-page w-full max-w-4xl grid md:grid-cols-2 bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-brand-line">
        <section className="auth-visual hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-brand-primary to-brand-primary-strong text-white text-center">
          <Link className="brand text-white text-3xl font-extrabold" to="/login">
            Muttley
          </Link>
          <p className="mt-4 text-brand-primary-soft max-w-xs text-sm leading-relaxed">
            Sistema integrado de eventos acadêmicos, certificados e emissão de medalhas da FATEC Zona Leste.
          </p>
        </section>

        <section className="auth-panel p-8 md:p-12 flex flex-col justify-center" aria-labelledby="login-title">
          {message && <div className="alert alert-success mb-4">{message}</div>}
          {erro && <div className="alert alert-danger mb-4">{erro}</div>}

          <div className="auth-heading mb-6">
            <span className="auth-kicker text-brand-primary font-bold text-xs uppercase tracking-wider">Acesso</span>
            <h1 id="login-title" className="text-2xl font-extrabold text-brand-ink-strong mt-1">Entrar no Muttley</h1>
          </div>

          <form className="event-form auth-form flex flex-col gap-4 !mt-0 !p-0 !border-0 !shadow-none !bg-transparent" onSubmit={handleSubmit}>
            <label className="field">
              <span className="text-sm font-semibold text-brand-ink-strong">CPF</span>
              <input
                type="text"
                name="cpf"
                id="cpf"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                required
                className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
              />
            </label>

            <label className="field">
              <span className="text-sm font-semibold text-brand-ink-strong">Senha</span>
              <input
                type="password"
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
              />
            </label>

            <div className="auth-options flex items-center justify-between text-xs text-brand-muted mt-2">
              <label className="checkbox-field flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="lembrar" className="accent-brand-primary" />
                <span>Lembrar acesso</span>
              </label>
              <Link className="text-brand-primary font-bold hover:underline" to="/register">
                Criar conta
              </Link>
            </div>

            <button className="primary-action auth-submit mt-6 w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer" type="submit">
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-xs border-t border-brand-line pt-4">
            <p className="text-brand-muted">
              Para testes (Admin): CPF <strong className="text-brand-ink-strong">123.456.789-00</strong> | Senha <strong className="text-brand-ink-strong">123</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
