import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../../services/apiClient'
import db from '../../data/mockDb'
import { toast } from '../../components/ui/Toast'
import { getRoleFromToken, normalizeAuthRole } from '../../utils/auth'

type LoginResponse = {
  token?: string
  accessToken?: string
  role?: 'ADMIN' | 'USER'
  id?: string | number
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  usuario?:
    | string
    | {
        id?: string | number
        nome?: string
        email?: string
        telefone?: string
        cpf?: string
        role?: 'ADMIN' | 'USER'
      }
}

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  useEffect(() => {
    const regMsg = sessionStorage.getItem('muttley_register_msg')
    if (regMsg) {
      toast.success(regMsg)
      sessionStorage.removeItem('muttley_register_msg')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    db.setLoggedUser(null)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: normalizedEmail,
        senha,
      })
      const token = response.data.accessToken || response.data.token

      if (!token) {
        throw new Error('Token de autenticacao nao retornado pela API.')
      }

      const role =
        normalizeAuthRole(
          getRoleFromToken(token),
          response.data.role,
          typeof response.data.usuario === 'object'
            ? response.data.usuario?.role
            : undefined
        ) || 'USER'
      const usuario =
        typeof response.data.usuario === 'object' && response.data.usuario
          ? {
              id: response.data.usuario.id ?? response.data.id,
              nome: response.data.usuario.nome ?? response.data.nome,
              email:
                response.data.usuario.email ??
                response.data.email ??
                normalizedEmail,
              telefone:
                response.data.usuario.telefone ?? response.data.telefone,
              cpf: response.data.usuario.cpf ?? response.data.cpf,
              role,
            }
          : {
              id: response.data.id,
              nome: response.data.nome,
              email: response.data.email ?? normalizedEmail,
              telefone: response.data.telefone,
              cpf: response.data.cpf,
              role,
            }

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('usuario', JSON.stringify(usuario))

      toast.success('Login realizado com sucesso.')
      navigate(role === 'ADMIN' ? '/admin/inicio' : '/user/inicio')
    } catch (err: any) {
      db.setLoggedUser(null)
      toast.error(err.message || 'Email ou senha incorretos.')
    }
  }

  return (
    <div className="auth-body min-h-screen flex items-center justify-center">
      <main className="auth-page w-full max-w-4xl grid md:grid-cols-2 bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-brand-line">
        <section className="auth-visual hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-brand-primary to-brand-primary-strong text-white text-center">
          <Link
            className="brand text-white text-3xl font-extrabold"
            to="/login"
          >
            Muttley
          </Link>
          <p className="mt-4 text-brand-primary-soft max-w-xs text-sm leading-relaxed">
            Sistema integrado de eventos academicos, certificados e emissao de
            medalhas da FATEC Zona Leste.
          </p>
        </section>

        <section
          className="auth-panel p-8 md:p-12 flex flex-col justify-center"
          aria-labelledby="login-title"
        >
          <div className="auth-heading mb-6">
            <span className="auth-kicker text-brand-primary font-bold text-xs uppercase tracking-wider">
              Acesso
            </span>
            <h1
              id="login-title"
              className="text-2xl font-extrabold text-brand-ink-strong mt-1"
            >
              Entrar no Muttley
            </h1>
          </div>

          <form
            className="event-form auth-form flex flex-col gap-4 !mt-0 !p-0 !border-0 !shadow-none !bg-transparent"
            onSubmit={handleSubmit}
          >
            <label className="field">
              <span className="text-sm font-semibold text-brand-ink-strong">
                Email
              </span>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
              />
            </label>

            <label className="field">
              <span className="text-sm font-semibold text-brand-ink-strong">
                Senha
              </span>
              <input
                type="password"
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2 border border-brand-line rounded-lg focus:border-brand-primary focus:outline-none"
              />
            </label>

            <div className="auth-options flex items-center justify-between text-xs text-brand-muted mt-2">
              <label className="checkbox-field flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="lembrar"
                  className="accent-brand-primary"
                />
                <span>Lembrar acesso</span>
              </label>
              <Link
                className="text-brand-primary font-bold hover:underline"
                to="/register"
              >
                Criar conta
              </Link>
            </div>

            <button
              className="primary-action auth-submit mt-6 w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-strong transition-colors cursor-pointer"
              type="submit"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-xs border-t border-brand-line pt-4">
            <p className="text-brand-muted">
              Para testes:{' '}
              <strong className="text-brand-ink-strong">
                ana.souza@email.com
              </strong>{' '}
              | Senha <strong className="text-brand-ink-strong">123456</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Login
