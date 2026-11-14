import React, { useEffect, useRef, useState } from 'react'
import { Camera, Settings } from 'lucide-react'
import {
  AvatarPessoa,
  enviarFotoPerfilApi,
  prepararFotoPerfil,
  recarregarFotoPerfil,
  removerFotoPerfilApi,
  useAuth,
  useFotoPerfil,
} from '../../auth'
import {
  getMinhasConquistasApi,
  MedalhaEspecial,
  MoedaTrilha,
  NOME_NIVEL,
  totalMedalhas,
  unidade,
  type Conquistas,
} from '../../medalhas'
import { PARTICIPANT_EVENTS_PATH } from '../../eventos'
import { ButtonLink, SkeletonBlock, toast } from '../../../shared/ui'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/ui/shadcn/popover'

/**
 * Medalha da vitrine: o nome fica escondido e aparece ao passar o mouse, focar ou tocar.
 * O botão leva o nome como rótulo acessível, então o leitor de tela não depende do balão.
 */
const ItemVitrine: React.FC<{
  nome: string
  detalhe: string
  children: React.ReactNode
}> = ({ nome, detalhe, children }) => {
  const [aberto, setAberto] = useState(false)
  return (
    <li>
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          aria-label={`${nome}, ${detalhe}`}
          onMouseEnter={() => setAberto(true)}
          onMouseLeave={() => setAberto(false)}
          // Foco por teclado mostra o nome; foco de clique não, para não deixar dois balões abertos.
          onFocus={(e) => setAberto(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setAberto(false)}
          className="grid place-items-center rounded-full transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-4"
        >
          {children}
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={6}
          className="w-auto max-w-60 px-3 py-2 text-center"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="font-display font-bold leading-tight">{nome}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{detalhe}</p>
        </PopoverContent>
      </Popover>
    </li>
  )
}

export const PerfilPage: React.FC = () => {
  const { user, atualizarUsuario } = useAuth()
  const foto = useFotoPerfil()
  const arquivoRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [conquistas, setConquistas] = useState<Conquistas | null>(null)
  const [erroMedalhas, setErroMedalhas] = useState(false)

  useEffect(() => {
    let ativo = true
    getMinhasConquistasApi()
      .then((c) => ativo && setConquistas(c))
      .catch(() => ativo && setErroMedalhas(true))
    return () => {
      ativo = false
    }
  }, [])

  if (!user) return null

  const trocarFoto = async (arquivo: File | undefined) => {
    if (!arquivo) return
    setEnviando(true)
    try {
      await enviarFotoPerfilApi(await prepararFotoPerfil(arquivo))
      atualizarUsuario({ ...user, temFoto: true })
      await recarregarFotoPerfil(user.id)
      toast.success('Foto atualizada')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível trocar a foto.'
      )
    } finally {
      setEnviando(false)
    }
  }

  const removerFoto = async () => {
    setEnviando(true)
    try {
      await removerFotoPerfilApi()
      // temFoto: false já faz os avatares voltarem às iniciais, sem buscar de novo.
      atualizarUsuario({ ...user, temFoto: false })
      toast.success('Foto removida')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível remover a foto.'
      )
    } finally {
      setEnviando(false)
    }
  }

  const geral = conquistas?.trilhas.find((t) => t.chave === 'geral')
  const horas = conquistas?.trilhas.find((t) => t.chave === 'horas')
  const ganhas = conquistas?.trilhas.filter((t) => t.nivel !== null) ?? []
  const especiais = conquistas?.especiais ?? []
  const numeros = [
    {
      valor: geral?.valor ?? 0,
      rotulo: geral?.valor === 1 ? 'presença' : 'presenças',
    },
    { valor: horas?.valor ?? 0, rotulo: 'horas em eventos' },
    {
      valor: conquistas ? totalMedalhas(conquistas) : 0,
      rotulo:
        conquistas && totalMedalhas(conquistas) === 1 ? 'medalha' : 'medalhas',
    },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      <section className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]">
        {/* Capa: faixa cobalto com o picote do ingresso */}
        <div className="perfil-capa h-32 sm:h-40" aria-hidden />

        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="relative">
              <AvatarPessoa className="size-28 sm:size-32 text-3xl ring-4 ring-[var(--color-bg-surface)]" />
              <input
                ref={arquivoRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  void trocarFoto(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => arquivoRef.current?.click()}
                disabled={enviando}
                aria-label={
                  foto ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'
                }
                title={foto ? 'Trocar foto' : 'Adicionar foto'}
                className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-bg-surface)] transition-transform hover:scale-105 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-[var(--focus-ring-color)]"
              >
                <Camera className="size-4" aria-hidden />
              </button>
            </div>
            <ButtonLink
              to="/user/perfil/editar"
              variant="outline"
              size="sm"
              leftIcon={<Settings className="size-4" />}
            >
              Configurações
            </ButtonLink>
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight mt-4 break-words">
            {user.nome}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {user.role === 'ADMIN' ? 'Coordenação' : 'Participante'} na Fatec
            Zona Leste
          </p>
          {foto && (
            <button
              type="button"
              onClick={removerFoto}
              disabled={enviando}
              className="mt-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:underline"
            >
              Remover foto
            </button>
          )}

          <dl className="grid grid-cols-3 gap-3 mt-6">
            {numeros.map((n) => (
              <div
                key={n.rotulo}
                className="flex flex-col-reverse rounded-md bg-[var(--color-bg-subtle)] px-3 py-3 text-center"
              >
                <dt className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {n.rotulo}
                </dt>
                <dd className="font-display text-2xl sm:text-3xl font-bold tabular-nums">
                  {conquistas ? n.valor : '–'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="vitrine"
        className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-5 sm:px-8 py-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="vitrine" className="font-display text-xl font-bold">
            Vitrine de medalhas
          </h2>
          <ButtonLink to="/user/medalhas" variant="ghost" size="sm">
            Ver progresso
          </ButtonLink>
        </div>

        {!conquistas && !erroMedalhas && (
          <div className="flex gap-4 mt-5">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBlock key={i} circular className="size-16" />
            ))}
          </div>
        )}
        {erroMedalhas && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-3">
            Não foi possível carregar as medalhas agora.
          </p>
        )}
        {conquistas && ganhas.length + especiais.length === 0 && (
          <div className="mt-3 flex flex-col items-start gap-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              A vitrine começa com a primeira presença em um evento concluído.
            </p>
            <ButtonLink to={PARTICIPANT_EVENTS_PATH} size="sm">
              Ver eventos abertos
            </ButtonLink>
          </div>
        )}
        {conquistas && ganhas.length + especiais.length > 0 && (
          <>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Passe o mouse ou toque numa medalha para ver o nome.
            </p>
            <ul className="flex flex-wrap items-end gap-x-4 gap-y-5 mt-5">
              {especiais.map((e) => {
                const nome = e.semestre
                  ? e.titulo.replace(` ${e.semestre}`, '')
                  : e.titulo
                const [ano, periodo] = e.semestre?.split('/') ?? []
                return (
                  <ItemVitrine
                    key={e.titulo}
                    nome={nome}
                    detalhe={
                      ano
                        ? `${periodo}º semestre de ${ano}`
                        : 'Medalha especial'
                    }
                  >
                    <MedalhaEspecial especial={e} tamanho={76} />
                  </ItemVitrine>
                )
              })}
              {ganhas.map((t) => (
                <ItemVitrine
                  key={t.chave}
                  nome={`${t.titulo} ${t.nivel ? NOME_NIVEL[t.nivel].toLowerCase() : ''}`}
                  detalhe={unidade(t, t.valor)}
                >
                  <MoedaTrilha trilha={t} tamanho={64} semAnel />
                </ItemVitrine>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
