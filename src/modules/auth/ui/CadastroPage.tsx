import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Input,
  toast,
} from '../../../shared/ui'
import {
  concluirCadastroApi,
  consultarConviteApi,
  solicitarCadastroApi,
  type ConviteCadastro,
} from '../api/authApi'
import { useAuth } from '../application/useAuth'
import {
  formatarCpf,
  formatarTelefone,
  tokenDoConvite,
  validarConclusao,
  validarSolicitacao,
  type DadosConclusao,
  type ErrosCampos,
} from '../domain/cadastro'
import { getDefaultRouteForRole } from '../domain/loginDestinationPolicy'
import { AuthLayout } from './AuthLayout'

const mensagemDe = (err: unknown, padrao: string) =>
  err instanceof Error && err.message ? err.message : padrao

// Depois de validar, leva o foco ao primeiro campo com erro (teclado e leitor de tela).
const focarPrimeiroErro = () =>
  document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()

const linkClasse =
  'font-semibold text-[var(--color-primary-text)] hover:underline underline-offset-2'

/* ---------- Pedir conta (sem convite) ---------- */

const PedirConta: React.FC<{ aviso?: React.ReactNode }> = ({ aviso }) => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erros, setErros] = useState<ErrosCampos<'nome' | 'email'>>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const encontrados = validarSolicitacao({ nome, email })
    // flushSync aplica os erros já, para o foco achar o campo marcado
    flushSync(() => setErros(encontrados))
    if (Object.keys(encontrados).length) {
      focarPrimeiroErro()
      return
    }
    setEnviando(true)
    setErroApi(null)
    try {
      await solicitarCadastroApi({ nome, email })
      setEnviadoPara(email.trim().toLowerCase())
    } catch (err) {
      setErroApi(
        mensagemDe(err, 'Não foi possível enviar agora. Tente de novo.')
      )
    } finally {
      setEnviando(false)
    }
  }

  if (enviadoPara) {
    return (
      <AuthLayout
        titulo="Confira seu email"
        subtitulo="O convite para criar a senha está a caminho"
      >
        <Card className="bg-[var(--color-bg-surface)]">
          <CardContent className="p-6 sm:p-8 space-y-4 text-sm text-[var(--color-text-secondary)]">
            <p>
              Se{' '}
              <strong className="text-[var(--color-text-primary)]">
                {enviadoPara}
              </strong>{' '}
              puder receber uma conta, enviamos um link para completar o
              cadastro. Ele vale por 24 horas.
            </p>
            <p>
              Não chegou? Veja a caixa de spam ou{' '}
              <button
                type="button"
                className={linkClasse}
                onClick={() => setEnviadoPara(null)}
              >
                peça de novo
              </button>
              .
            </p>
            <Link to="/login" className={`inline-block ${linkClasse}`}>
              Voltar para o login
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titulo="Criar conta"
      subtitulo="Acompanhe inscrições, presença e certificados"
    >
      {aviso}
      <Card className="bg-[var(--color-bg-surface)]">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
            {erroApi && <Alert variant="error">{erroApi}</Alert>}
            <Input
              label="Nome completo"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              error={erros.nome}
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={erros.email}
              helperText="Enviaremos um link para você criar a senha."
              required
            />
            <Button
              type="submit"
              fullWidth
              isLoading={enviando}
              loadingText="Enviando convite"
            >
              Receber convite por email
            </Button>
          </form>
          <p className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-secondary)]">
            Já tem conta?{' '}
            <Link to="/login" className={linkClasse}>
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

/* ---------- Completar cadastro (com convite) ---------- */

const CompletarCadastro: React.FC<{
  token: string
  convite: ConviteCadastro
}> = ({ token, convite }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const cpfDoConvite = convite.cpf ? formatarCpf(convite.cpf) : ''
  const [dados, setDados] = useState<DadosConclusao>({
    nome: convite.nome ?? '',
    email: convite.email,
    telefone: '',
    cpf: cpfDoConvite,
    senha: '',
    confirmacao: '',
  })
  const [verSenha, setVerSenha] = useState(false)
  const [erros, setErros] = useState<ErrosCampos<keyof DadosConclusao>>({})
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const campo =
    (chave: keyof DadosConclusao, mascara?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDados((d) => ({
        ...d,
        [chave]: mascara ? mascara(e.target.value) : e.target.value,
      }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const encontrados = validarConclusao(dados)
    // flushSync aplica os erros já, para o foco achar o campo marcado
    flushSync(() => setErros(encontrados))
    if (Object.keys(encontrados).length) {
      focarPrimeiroErro()
      return
    }
    setEnviando(true)
    setErroApi(null)
    try {
      await concluirCadastroApi(token, dados)
      // A conta já tem senha: entra direto, sem pedir os dados de novo.
      const sessao = await login({ email: dados.email, senha: dados.senha })
      toast.success('Conta criada. Boas-vindas ao Muttley!')
      navigate(getDefaultRouteForRole(sessao.user.role), { replace: true })
    } catch (err) {
      setErroApi(
        mensagemDe(err, 'Não foi possível concluir o cadastro. Tente de novo.')
      )
    } finally {
      setEnviando(false)
    }
  }

  const botaoVerSenha = (
    <button
      type="button"
      onClick={() => setVerSenha((v) => !v)}
      aria-pressed={verSenha}
      className="px-2 text-xs font-semibold text-[var(--color-primary-text)]"
    >
      {verSenha ? 'Ocultar' : 'Mostrar'}
    </button>
  )

  return (
    <AuthLayout
      titulo="Complete seu cadastro"
      subtitulo="Falta pouco para acompanhar seus eventos"
    >
      <Card className="bg-[var(--color-bg-surface)]">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
            {erroApi && <Alert variant="error">{erroApi}</Alert>}
            <Input
              label="Nome completo"
              autoComplete="name"
              value={dados.nome}
              onChange={campo('nome')}
              error={erros.nome}
              required
            />
            <Input
              label="Email"
              type="email"
              value={dados.email}
              readOnly
              helperText="O email do convite não pode ser trocado."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="CPF"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={dados.cpf}
                onChange={campo('cpf', formatarCpf)}
                readOnly={Boolean(cpfDoConvite)}
                error={erros.cpf}
                required
              />
              <Input
                label="Telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 98765-4321"
                value={dados.telefone}
                onChange={campo('telefone', formatarTelefone)}
                error={erros.telefone}
                required
              />
            </div>
            <Input
              label="Senha"
              type={verSenha ? 'text' : 'password'}
              autoComplete="new-password"
              value={dados.senha}
              onChange={campo('senha')}
              error={erros.senha}
              rightElement={botaoVerSenha}
              required
            />
            <Input
              label="Confirme a senha"
              type={verSenha ? 'text' : 'password'}
              autoComplete="new-password"
              value={dados.confirmacao}
              onChange={campo('confirmacao')}
              error={erros.confirmacao}
              required
            />
            <Button
              type="submit"
              fullWidth
              isLoading={enviando}
              loadingText="Criando conta"
            >
              Criar conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

/* ---------- Rota: /cadastro (pedir conta) e /register?id= (link do email) ---------- */

type EstadoConvite =
  | { tipo: 'carregando' }
  | { tipo: 'valido'; convite: ConviteCadastro }
  | { tipo: 'invalido' }

const ConviteRecebido: React.FC<{ token: string }> = ({ token }) => {
  const [estado, setEstado] = useState<EstadoConvite>({ tipo: 'carregando' })

  useEffect(() => {
    let ativo = true
    consultarConviteApi(token)
      .then((convite) => ativo && setEstado({ tipo: 'valido', convite }))
      .catch(() => ativo && setEstado({ tipo: 'invalido' }))
    return () => {
      ativo = false
    }
  }, [token])

  if (estado.tipo === 'carregando') {
    return (
      <AuthLayout titulo="Abrindo convite" subtitulo="Conferindo o link">
        <Card className="bg-[var(--color-bg-surface)]">
          <CardContent className="p-6 sm:p-8 space-y-3" aria-busy="true">
            <div className="skeleton-shape h-10 rounded-sm" />
            <div className="skeleton-shape h-10 rounded-sm" />
            <div className="skeleton-shape h-10 rounded-sm" />
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (estado.tipo === 'invalido') {
    return (
      <PedirConta
        aviso={
          <Alert
            variant="warning"
            title="Este convite não vale mais"
            className="mb-4"
          >
            O link expirou, já foi usado ou foi substituído por um mais recente.
            Peça um novo convite abaixo.
          </Alert>
        }
      />
    )
  }

  return <CompletarCadastro token={token} convite={estado.convite} />
}

export const CadastroPage: React.FC = () => {
  const { search } = useLocation()
  const token = tokenDoConvite(search)
  // key: um novo link de convite reinicia a tela do zero
  return token ? <ConviteRecebido key={token} token={token} /> : <PedirConta />
}
