import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [isFromEmail, setIsFromEmail] = useState(false);

  useEffect(() => {
    if (!id) return;

    apiClient
      .get(`/pessoa/dados-cadastro/${id}`)
      .then((res) => {
        const { nome, email, cpf} = res.data;

        setNome(nome || '');
        setEmail(email || '');
        setCpf(cpf || '');

        setIsFromEmail(true);
      })
      .catch((err) => {
        setErro('Link de cadastro inválido.');
        console.error(err);
      });
  }, [id]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)$/, '($1');
    }
    
    setTelefone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    

    try {
      if(isFromEmail){
        await apiClient.put('/auth/register', {
          nome,
          email,
          telefone,
          cpf,
          senha
        });
      }
      else{
        await apiClient.post('/auth/register', {
          nome,
          email,
          telefone,
          cpf,
          senha
        });
      }
      
      // Salva mensagem de sucesso e redireciona
      sessionStorage.setItem('muttley_register_msg', 'Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="auth-body min-h-screen flex items-center justify-center">
      <main className="auth-page register-page w-full max-w-4xl grid md:grid-cols-2 bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-brand-line">
        <section className="auth-visual register-visual hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-brand-primary to-brand-primary-strong text-white text-center">
          <Link className="brand text-white text-3xl font-extrabold" to="/login">
            Muttley
          </Link>
          <p className="mt-4 text-brand-primary-soft max-w-xs text-sm leading-relaxed">
            Cadastre-se para participar de palestras, workshops e simpósios promovidos pela FATEC Zona Leste e emitir seus certificados de participação.
          </p>
        </section>

        <section className="auth-panel register-panel p-8 md:p-12 flex flex-col justify-center" aria-labelledby="register-title">
          {erro && <div className="alert alert-danger mb-4">{erro}</div>}

          <div className="auth-heading mb-6">
            <span className="auth-kicker text-brand-primary font-bold text-xs uppercase tracking-wider">Cadastro</span>
            <h1 id="register-title" className="text-2xl font-extrabold text-brand-ink-strong mt-1">Criar cadastro</h1>
          </div>

          <form className="event-form auth-form register-form flex flex-col gap-4 !mt-0 !p-0 !border-0 !shadow-none !bg-transparent" onSubmit={handleSubmit}>
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="field col-span-1 sm:col-span-2">
                <span className="text-sm font-semibold text-brand-ink-strong">Nome completo</span>
                <input
                  type="text"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>

              <label className="field">
                <span className="text-sm font-semibold text-brand-ink-strong">Email</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  disabled={isFromEmail}
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>

              <label className="field">
                <span className="text-sm font-semibold text-brand-ink-strong">Telefone</span>
                <input
                  type="tel"
                  name="telefone"
                  value={telefone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>

              <label className="field">
                <span className="text-sm font-semibold text-brand-ink-strong">CPF</span>
                <input
                  type="text"
                  name="cpf"
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  disabled={isFromEmail}
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>

              <div className="hidden sm:block"></div> {/* Spacer */}

              <label className="field">
                <span className="text-sm font-semibold text-brand-ink-strong">Senha</span>
                <input
                  type="password"
                  name="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Crie uma senha"
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>

              <label className="field">
                <span className="text-sm font-semibold text-brand-ink-strong">Confirmar senha</span>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="form-actions auth-actions flex items-center justify-between mt-6">
              <Link className="text-xs text-brand-primary font-bold hover:underline" to="/login">
                Já tenho conta
              </Link>
              <button className="primary-action px-6 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer" type="submit">
                Criar cadastro
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Register;
