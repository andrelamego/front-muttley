import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import {
  getModeloCertificadoApi,
  previaModeloCertificadoApi,
  salvarModeloCertificadoApi,
} from '../api/adminCatalogApi'
import {
  LIMITES,
  LOGO_MAX_BYTES,
  MARCADORES,
  inserirMarcador,
  marcadoresDesconhecidos,
  validarModelo,
  type LeiauteCertificado,
  type ModeloCertificado,
} from '../domain/modeloCertificado'
import {
  Alert,
  Badge,
  Button,
  FiltroSegmentado,
  Input,
  SkeletonBlock,
  toast,
} from '../../../shared/ui'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import { AdminLoadError, AdminSectionHeader } from './AdminPageParts'

// A4 paisagem a 96 dpi: a prévia é desenhada nesse tamanho e reduzida para caber.
const FOLHA_LARGURA = 1123
const FOLHA_ALTURA = 794

const PADRAO: ModeloCertificado = {
  instituicao: 'Fatec Zona Leste',
  titulo: 'Certificado de participação',
  texto:
    'Participou como {tipo} do evento {evento}, realizado em {data}, com carga horária de {carga}.',
  cargoAssinatura:
    'Coordenação do curso de Análise e Desenvolvimento de Sistemas da Fatec Zona Leste',
  corPrincipal: '#2236e0',
  corDestaque: '#ffd93b',
  leiaute: 'INGRESSO',
  logoBase64: null,
  logoMime: null,
}

const ORDEM_CAMPOS = [
  'instituicao',
  'titulo',
  'texto',
  'cargoAssinatura',
  'corPrincipal',
  'corDestaque',
]

const rotuloClasse =
  'block text-sm font-medium text-[var(--color-text-primary)] mb-1.5'

/** Prévia em escala: o iframe tem o tamanho real da folha e é reduzido para a largura disponível. */
const Previa: React.FC<{ html: string | null; atualizando: boolean }> = ({
  html,
  atualizando,
}) => {
  const caixaRef = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(0.5)

  useEffect(() => {
    const caixa = caixaRef.current
    if (!caixa) return
    const medir = () => setEscala(caixa.clientWidth / FOLHA_LARGURA)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(caixa)
    return () => observador.disconnect()
  }, [])

  return (
    <div
      ref={caixaRef}
      className="relative w-full overflow-hidden rounded-[var(--radius-md)] bg-white shadow-[0_8px_30px_rgb(14_19_48/0.12)] ring-1 ring-[var(--color-border)]"
      style={{ height: FOLHA_ALTURA * escala }}
    >
      {html ? (
        <iframe
          title="Prévia do certificado"
          srcDoc={html}
          // Sem scripts nem acesso à página: só desenha o HTML.
          sandbox=""
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{
            width: FOLHA_LARGURA,
            height: FOLHA_ALTURA,
            transform: `scale(${escala})`,
          }}
        />
      ) : (
        <SkeletonBlock
          className="absolute inset-0"
          aria-label="Gerando prévia"
        />
      )}
      {atualizando && html && (
        <span className="absolute right-3 top-3 rounded-full bg-[var(--color-bg-surface)]/90 px-2.5 py-1 text-xs text-[var(--color-text-secondary)] shadow-sm">
          Atualizando…
        </span>
      )}
    </div>
  )
}

export const ModeloCertificadoPage: React.FC = () => {
  const [modelo, setModelo] = useState<ModeloCertificado | null>(null)
  const [salvo, setSalvo] = useState<ModeloCertificado | null>(null)
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [atualizandoPrevia, setAtualizandoPrevia] = useState(false)
  const [erroPrevia, setErroPrevia] = useState<string | null>(null)
  const textoRef = useRef<HTMLTextAreaElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ativo = true
    getModeloCertificadoApi()
      .then((m) => {
        if (!ativo) return
        setModelo(m)
        setSalvo(m)
      })
      .catch((e: unknown) => {
        if (ativo)
          setErroCarga(
            e instanceof Error ? e.message : 'Não foi possível abrir o modelo.'
          )
      })
    return () => {
      ativo = false
    }
  }, [tentativa])

  // Prévia ao vivo: espera a pessoa parar de digitar e cancela a requisição anterior.
  useEffect(() => {
    if (!modelo || Object.keys(validarModelo(modelo)).length) return
    const controle = new AbortController()
    const espera = window.setTimeout(() => {
      setAtualizandoPrevia(true)
      previaModeloCertificadoApi(modelo, controle.signal)
        .then((html) => {
          setPrevia(html)
          setErroPrevia(null)
        })
        .catch((e: unknown) => {
          if (controle.signal.aborted) return
          setErroPrevia(
            e instanceof Error ? e.message : 'Não foi possível gerar a prévia.'
          )
        })
        .finally(() => {
          if (!controle.signal.aborted) setAtualizandoPrevia(false)
        })
    }, 350)
    return () => {
      window.clearTimeout(espera)
      controle.abort()
    }
  }, [modelo])

  if (erroCarga) {
    return (
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminLoadError
          message={erroCarga}
          onRetry={() => {
            setErroCarga(null)
            setTentativa((n) => n + 1)
          }}
        />
      </div>
    )
  }

  const alterar = <K extends keyof ModeloCertificado>(
    campo: K,
    valor: ModeloCertificado[K]
  ) => {
    setModelo((m) => (m ? { ...m, [campo]: valor } : m))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: '' }))
  }

  const alterado =
    modelo !== null && JSON.stringify(modelo) !== JSON.stringify(salvo)

  const inserir = (marcador: string) => {
    const campo = textoRef.current
    if (!modelo || !campo) return
    const { texto, cursor } = inserirMarcador(
      modelo.texto,
      campo.selectionStart,
      campo.selectionEnd,
      marcador
    )
    flushSync(() => alterar('texto', texto))
    campo.focus()
    campo.setSelectionRange(cursor, cursor)
  }

  const escolherLogo = (arquivo: File | undefined) => {
    if (!arquivo) return
    if (!['image/png', 'image/jpeg'].includes(arquivo.type)) {
      toast.error('Envie a logo em PNG ou JPG.')
      return
    }
    if (arquivo.size > LOGO_MAX_BYTES) {
      toast.error('A logo deve ter até 512 KB.')
      return
    }
    const leitor = new FileReader()
    leitor.onload = () => {
      const dataUrl = String(leitor.result)
      setModelo((m) =>
        m
          ? {
              ...m,
              logoBase64: dataUrl.slice(dataUrl.indexOf(',') + 1),
              logoMime: arquivo.type,
            }
          : m
      )
    }
    leitor.readAsDataURL(arquivo)
  }

  const salvar = async () => {
    if (!modelo) return
    const encontrados = validarModelo(modelo)
    if (Object.keys(encontrados).length) {
      flushSync(() => setErros(encontrados))
      const primeiro = ORDEM_CAMPOS.find((c) => encontrados[c])
      if (primeiro) document.getElementById(`modelo-${primeiro}`)?.focus()
      return
    }
    setSalvando(true)
    setErroSalvar(null)
    try {
      const atualizado = await salvarModeloCertificadoApi(modelo)
      setModelo(atualizado)
      setSalvo(atualizado)
      toast.success('Modelo salvo. Os próximos certificados já saem assim.')
    } catch (e) {
      setErroSalvar(
        e instanceof Error ? e.message : 'Não foi possível salvar o modelo.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const desconhecidos = modelo ? marcadoresDesconhecidos(modelo.texto) : []

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
        title="Modelo do certificado"
        description="Ajuste a aparência dos certificados à identidade da instituição. A prévia usa dados de exemplo."
        action={
          <div className="flex items-center gap-2">
            {alterado && <Badge variant="warning">Alterações não salvas</Badge>}
            <Button
              size="sm"
              onClick={salvar}
              isLoading={salvando}
              loadingText="Salvando…"
              disabled={!alterado}
            >
              Salvar modelo
            </Button>
          </div>
        }
      />

      {!modelo ? (
        <div className="grid lg:grid-cols-[minmax(0,25rem)_1fr] gap-8">
          <SkeletonBlock className="h-[36rem]" />
          <SkeletonBlock className="h-80" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,25rem)_1fr] gap-8 items-start">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void salvar()
            }}
            className="flex flex-col gap-5"
          >
            {erroSalvar && (
              <Alert variant="error" onClose={() => setErroSalvar(null)}>
                {erroSalvar}
              </Alert>
            )}

            <div>
              <span className={rotuloClasse}>Leiaute</span>
              <FiltroSegmentado<LeiauteCertificado>
                rotulo="Leiaute do certificado"
                valor={modelo.leiaute}
                onChange={(v) => alterar('leiaute', v)}
                opcoes={[
                  { valor: 'INGRESSO', rotulo: 'Ingresso' },
                  { valor: 'CLASSICO', rotulo: 'Clássico' },
                ]}
              />
            </div>

            <Input
              id="modelo-instituicao"
              label="Instituição"
              value={modelo.instituicao}
              maxLength={LIMITES.instituicao}
              error={erros.instituicao}
              onChange={(e) => alterar('instituicao', e.target.value)}
            />

            <div>
              <span className={rotuloClasse}>Logo</span>
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-28 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-2">
                  {modelo.logoBase64 ? (
                    <img
                      src={`data:${modelo.logoMime};base64,${modelo.logoBase64}`}
                      alt="Logo atual"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Sem logo
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(e) => {
                      escolherLogo(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ImagePlus className="size-4" />}
                    onClick={() => logoRef.current?.click()}
                  >
                    {modelo.logoBase64 ? 'Trocar logo' : 'Enviar logo'}
                  </Button>
                  {modelo.logoBase64 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 className="size-4" />}
                      onClick={() =>
                        setModelo((m) =>
                          m ? { ...m, logoBase64: null, logoMime: null } : m
                        )
                      }
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                PNG ou JPG, até 512 KB. Fundo transparente fica melhor.
              </p>
            </div>

            <Input
              id="modelo-titulo"
              label="Título"
              value={modelo.titulo}
              maxLength={LIMITES.titulo}
              error={erros.titulo}
              onChange={(e) => alterar('titulo', e.target.value)}
            />

            <div>
              <label htmlFor="modelo-texto" className={rotuloClasse}>
                Texto
              </label>
              <Textarea
                id="modelo-texto"
                ref={textoRef}
                rows={5}
                value={modelo.texto}
                maxLength={LIMITES.texto}
                aria-invalid={Boolean(erros.texto)}
                aria-describedby="modelo-texto-ajuda"
                onChange={(e) => alterar('texto', e.target.value)}
              />
              <div id="modelo-texto-ajuda" className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {MARCADORES.map((m) => (
                    <button
                      key={m.marcador}
                      type="button"
                      onClick={() => inserir(m.marcador)}
                      title={`Inserir ${m.descricao}`}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--color-primary-text)] hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                    >
                      {m.marcador}
                    </button>
                  ))}
                </div>
                <p className="flex justify-between gap-3 text-xs text-[var(--color-text-muted)]">
                  <span>
                    Clique para inserir. O nome do participante já aparece em
                    destaque acima do texto.
                  </span>
                  <span className="tabular-nums shrink-0">
                    {modelo.texto.length}/{LIMITES.texto}
                  </span>
                </p>
                {erros.texto && (
                  <p className="text-xs text-[var(--color-danger-text)]">
                    {erros.texto}
                  </p>
                )}
                {desconhecidos.length > 0 && (
                  <p className="text-xs text-[var(--color-warning-text)]">
                    {desconhecidos.join(', ')}{' '}
                    {desconhecidos.length === 1
                      ? 'não é um marcador conhecido e vai aparecer como está.'
                      : 'não são marcadores conhecidos e vão aparecer como estão.'}
                  </p>
                )}
              </div>
            </div>

            <Input
              id="modelo-cargoAssinatura"
              label="Cargo de quem assina"
              value={modelo.cargoAssinatura}
              maxLength={LIMITES.cargoAssinatura}
              error={erros.cargoAssinatura}
              onChange={(e) => alterar('cargoAssinatura', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  ['corPrincipal', 'Cor principal'],
                  ['corDestaque', 'Cor de destaque'],
                ] as const
              ).map(([campo, rotulo]) => (
                <div key={campo}>
                  <label htmlFor={`modelo-${campo}`} className={rotuloClasse}>
                    {rotulo}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={`${rotulo}: seletor`}
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(modelo[campo])
                          ? modelo[campo]
                          : '#000000'
                      }
                      onChange={(e) => alterar(campo, e.target.value)}
                      className="h-11 w-11 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-transparent p-1"
                    />
                    <Input
                      id={`modelo-${campo}`}
                      value={modelo[campo]}
                      maxLength={7}
                      className="font-mono uppercase"
                      error={erros[campo]}
                      onChange={(e) => alterar(campo, e.target.value.trim())}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="size-4" />}
                disabled={!alterado}
                onClick={() => {
                  setModelo(salvo)
                  setErros({})
                }}
              >
                Desfazer alterações
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setModelo(PADRAO)
                  setErros({})
                }}
              >
                Restaurar padrão Muttley
              </Button>
            </div>
          </form>

          <section
            aria-labelledby="previa-titulo"
            className="lg:sticky lg:top-6 space-y-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="previa-titulo" className="font-display text-lg font-bold">
                Prévia
              </h2>
              <span className="text-xs text-[var(--color-text-muted)]">
                A4 paisagem · dados de exemplo
              </span>
            </div>
            <Previa html={previa} atualizando={atualizandoPrevia} />
            {erroPrevia && (
              <Alert variant="warning">
                A prévia não pôde ser atualizada: {erroPrevia}
              </Alert>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              O modelo vale para todo certificado gerado ou baixado depois de
              salvar, inclusive os já emitidos.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
