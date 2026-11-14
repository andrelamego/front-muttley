import React, { useState } from 'react'
import { flushSync } from 'react-dom'
import { alterarSenhaApi, atualizarPerfilApi } from '../api/authApi'
import { useAuth } from '../application/useAuth'
import { formatarCpf, formatarTelefone } from '../domain/cadastro'
import { validarDadosPerfil, validarTrocaSenha } from '../domain/perfil'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  toast,
} from '../../../shared/ui'

const mensagemDe = (err: unknown, padrao: string) =>
  err instanceof Error && err.message ? err.message : padrao

/** Foca o primeiro campo com erro, na ordem do formulário. */
const focarErro = (ordem: string[], erros: Record<string, string>) => {
  const primeiro = ordem.find((campo) => erros[campo])
  if (primeiro) document.getElementById(`perfil-${primeiro}`)?.focus()
}

/** Dados da própria conta: nome e telefone editáveis, email e CPF só para consulta, e troca de senha. */
export const MeuPerfilPage: React.FC = () => {
  const { user, atualizarUsuario } = useAuth()

  const [dados, setDados] = useState({
    nome: user?.nome ?? '',
    telefone: formatarTelefone(user?.telefone ?? ''),
  })
  const [errosDados, setErrosDados] = useState<Record<string, string>>({})
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [erroDadosApi, setErroDadosApi] = useState<string | null>(null)

  const senhaVazia = { senhaAtual: '', novaSenha: '', confirmacao: '' }
  const [senha, setSenha] = useState(senhaVazia)
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({})
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [erroSenhaApi, setErroSenhaApi] = useState<string | null>(null)
  const [verSenha, setVerSenha] = useState(false)

  if (!user) return null

  const alterado =
    dados.nome.trim() !== user.nome ||
    dados.telefone !== formatarTelefone(user.telefone ?? '')

  const salvarDados = async (e: React.FormEvent) => {
    e.preventDefault()
    const erros = validarDadosPerfil(dados)
    flushSync(() => setErrosDados(erros))
    if (Object.keys(erros).length) return focarErro(['nome', 'telefone'], erros)
    setSalvandoDados(true)
    setErroDadosApi(null)
    try {
      atualizarUsuario(await atualizarPerfilApi(dados))
      toast.success('Dados atualizados')
    } catch (err) {
      setErroDadosApi(mensagemDe(err, 'Não foi possível salvar seus dados.'))
    } finally {
      setSalvandoDados(false)
    }
  }

  const salvarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    const erros = validarTrocaSenha(senha)
    flushSync(() => setErrosSenha(erros))
    if (Object.keys(erros).length)
      return focarErro(['senhaAtual', 'novaSenha', 'confirmacao'], erros)
    setSalvandoSenha(true)
    setErroSenhaApi(null)
    try {
      await alterarSenhaApi({
        senhaAtual: senha.senhaAtual,
        novaSenha: senha.novaSenha,
      })
      setSenha(senhaVazia)
      setVerSenha(false)
      toast.success('Senha alterada')
    } catch (err) {
      setErroSenhaApi(mensagemDe(err, 'Não foi possível alterar a senha.'))
    } finally {
      setSalvandoSenha(false)
    }
  }

  const campoSenha = (nome: keyof typeof senhaVazia) => ({
    id: `perfil-${nome}`,
    type: verSenha ? 'text' : 'password',
    value: senha[nome],
    error: errosSenha[nome],
    disabled: salvandoSenha,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setSenha((s) => ({ ...s, [nome]: e.target.value }))
      if (errosSenha[nome]) setErrosSenha((er) => ({ ...er, [nome]: '' }))
    },
  })

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Configurações</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          Seus dados aparecem nas inscrições e nos certificados.
        </p>
      </div>

      <Card className="bg-[var(--color-bg-surface)]">
        <CardHeader>
          <CardTitle as="h2">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={salvarDados}
            noValidate
            className="flex flex-col gap-4"
          >
            {erroDadosApi && (
              <Alert variant="error" onClose={() => setErroDadosApi(null)}>
                {erroDadosApi}
              </Alert>
            )}
            <Input
              id="perfil-nome"
              label="Nome completo"
              autoComplete="name"
              value={dados.nome}
              error={errosDados.nome}
              disabled={salvandoDados}
              onChange={(e) =>
                setDados((d) => ({ ...d, nome: e.target.value }))
              }
            />
            <Input
              id="perfil-telefone"
              label="Telefone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="(11) 91234-5678"
              value={dados.telefone}
              error={errosDados.telefone}
              disabled={salvandoDados}
              onChange={(e) =>
                setDados((d) => ({
                  ...d,
                  telefone: formatarTelefone(e.target.value),
                }))
              }
            />

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-md bg-[var(--color-bg-subtle)] p-4 text-sm">
              <div className="min-w-0">
                <dt className="text-[var(--color-text-muted)]">Email</dt>
                <dd className="font-medium mt-0.5 break-all">{user.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">CPF</dt>
                <dd className="font-medium mt-0.5 tabular-nums">
                  {user.cpf ? formatarCpf(user.cpf) : 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Perfil</dt>
                <dd className="mt-1">
                  <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Participante'}
                  </Badge>
                </dd>
              </div>
            </dl>
            <p className="text-xs text-[var(--color-text-muted)] -mt-1">
              O email é o seu login e o CPF identifica suas inscrições. Para
              corrigir algum deles, fale com a coordenação.
            </p>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!alterado}
                isLoading={salvandoDados}
                loadingText="Salvando…"
              >
                Salvar dados
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[var(--color-bg-surface)]">
        <CardHeader>
          <CardTitle as="h2">Senha</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={salvarSenha}
            noValidate
            className="flex flex-col gap-4"
          >
            {erroSenhaApi && (
              <Alert variant="error" onClose={() => setErroSenhaApi(null)}>
                {erroSenhaApi}
              </Alert>
            )}
            <Input
              label="Senha atual"
              autoComplete="current-password"
              {...campoSenha('senhaAtual')}
            />
            <Input
              label="Nova senha"
              autoComplete="new-password"
              {...campoSenha('novaSenha')}
            />
            <Input
              label="Confirme a nova senha"
              autoComplete="new-password"
              {...campoSenha('confirmacao')}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                aria-pressed={verSenha}
                className="text-sm font-semibold text-[var(--color-primary-text)] min-h-[44px]"
              >
                {verSenha ? 'Ocultar senhas' : 'Mostrar senhas'}
              </button>
              <Button
                type="submit"
                variant="outline"
                isLoading={salvandoSenha}
                loadingText="Alterando…"
              >
                Alterar senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
