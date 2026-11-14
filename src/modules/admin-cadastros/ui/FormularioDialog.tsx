import React, { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { HttpError } from '../../../shared/http'
import { Alert, Button, Input } from '../../../shared/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/shadcn/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/shadcn/select'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import {
  validarValores,
  type CampoFormulario,
  type OpcaoCampo,
  type Valores,
} from '../domain/formularios'

// O Radix Select não aceita valor vazio; esta sentinela representa "nenhum".
const NENHUM = '__nenhum__'

const rotuloClasse =
  'block text-sm font-medium text-[var(--color-text-primary)] mb-1.5'
const erroClasse = 'text-xs text-[var(--color-danger-text)] mt-1.5'

export interface FormularioDialogProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  descricao?: string
  campos: CampoFormulario[]
  valoresIniciais: Valores
  /** Opções vindas da API para selects (professores, endereços). */
  opcoes?: Record<string, OpcaoCampo[]>
  rotuloSalvar: string
  /** Lança HttpError para a tela mostrar o motivo; resolve quando a API confirmou. */
  onSalvar: (valores: Valores) => Promise<void>
  /** Id do elemento que recebe o foco ao fechar. */
  idRetorno?: string
}

/** Formulário em popup; reabrir com outro registro exige mudar a key. */
export const FormularioDialog: React.FC<FormularioDialogProps> = ({
  aberto,
  onFechar,
  titulo,
  descricao,
  campos,
  valoresIniciais,
  opcoes = {},
  rotuloSalvar,
  onSalvar,
  idRetorno,
}) => {
  const prefixo = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [valores, setValores] = useState<Valores>(valoresIniciais)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const idDe = (campo: string) => `${prefixo}-${campo}`

  const focarPrimeiroErro = (comErro: Record<string, string>) => {
    const primeiro = campos.find((c) => comErro[c.nome])
    if (primeiro) document.getElementById(idDe(primeiro.nome))?.focus()
  }

  const alterar = (campo: CampoFormulario, valor: string) => {
    setValores((v) => ({
      ...v,
      [campo.nome]: campo.mascara ? campo.mascara(valor) : valor,
    }))
    if (erros[campo.nome])
      setErros((atuais) => {
        const resto = { ...atuais }
        delete resto[campo.nome]
        return resto
      })
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const encontrados = validarValores(campos, valores)
    if (Object.keys(encontrados).length) {
      // flushSync: o campo só recebe aria-invalid depois do render, e o foco precisa vir depois.
      flushSync(() => setErros(encontrados))
      focarPrimeiroErro(encontrados)
      return
    }
    setSalvando(true)
    setErroGeral(null)
    try {
      await onSalvar(valores)
    } catch (err) {
      // A API responde "campo: mensagem" nos erros de validação.
      const daApi: Record<string, string> = {}
      if (err instanceof HttpError) {
        for (const linha of err.validationErrors ?? []) {
          const [campo, ...msg] = linha.split(':')
          if (campos.some((c) => c.nome === campo.trim()))
            daApi[campo.trim()] = msg.join(':').trim()
        }
      }
      if (Object.keys(daApi).length) {
        flushSync(() => setErros(daApi))
        focarPrimeiroErro(daApi)
      } else {
        setErroGeral(
          err instanceof Error ? err.message : 'Não foi possível salvar.'
        )
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(abrir) => !abrir && !salvando && onFechar()}
    >
      <DialogContent
        className="sm:max-w-lg max-h-[90dvh] overflow-y-auto"
        onCloseAutoFocus={(e) => {
          // Aberto por estado, não por um Trigger: o Radix não sabe para onde devolver o foco.
          if (!idRetorno) return
          e.preventDefault()
          document.getElementById(idRetorno)?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{titulo}</DialogTitle>
          {descricao && <DialogDescription>{descricao}</DialogDescription>}
        </DialogHeader>

        <form
          ref={formRef}
          noValidate
          onSubmit={enviar}
          className="flex flex-col gap-4"
        >
          {erroGeral && (
            <Alert
              variant="error"
              title="Não foi possível salvar"
              onClose={() => setErroGeral(null)}
            >
              {erroGeral}
            </Alert>
          )}

          {campos.map((campo) => {
            const id = idDe(campo.nome)
            const erro = erros[campo.nome]
            const rotulo = (
              <label htmlFor={id} className={rotuloClasse}>
                {campo.rotulo}
                {campo.obrigatorio && (
                  <span
                    className="text-[var(--color-danger-text)] ml-1"
                    aria-hidden
                  >
                    *
                  </span>
                )}
              </label>
            )
            const mensagem = erro && (
              <p id={`${id}-erro`} className={erroClasse}>
                {erro}
              </p>
            )

            if (campo.tipo === 'textarea') {
              return (
                <div key={campo.nome}>
                  {rotulo}
                  <Textarea
                    id={id}
                    rows={3}
                    value={valores[campo.nome] ?? ''}
                    onChange={(e) => alterar(campo, e.target.value)}
                    aria-invalid={Boolean(erro)}
                    aria-describedby={erro ? `${id}-erro` : undefined}
                    aria-required={campo.obrigatorio}
                    disabled={salvando}
                  />
                  {mensagem}
                </div>
              )
            }

            if (campo.tipo === 'select') {
              const lista = campo.opcoes ?? opcoes[campo.nome] ?? []
              return (
                <div key={campo.nome}>
                  {rotulo}
                  <Select
                    value={valores[campo.nome] || NENHUM}
                    onValueChange={(v) => alterar(campo, v === NENHUM ? '' : v)}
                    disabled={salvando}
                  >
                    <SelectTrigger
                      id={id}
                      className="w-full min-h-[44px]"
                      aria-invalid={Boolean(erro)}
                      aria-describedby={erro ? `${id}-erro` : undefined}
                      aria-required={campo.obrigatorio}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NENHUM}>
                        {campo.obrigatorio ? 'Selecione…' : 'Nenhum'}
                      </SelectItem>
                      {lista.map((o) => (
                        <SelectItem key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mensagem}
                </div>
              )
            }

            return (
              <Input
                key={campo.nome}
                id={id}
                label={campo.rotulo}
                required={campo.obrigatorio}
                type={campo.tipo === 'email' ? 'email' : 'text'}
                inputMode={campo.tipo === 'numero' ? 'decimal' : undefined}
                placeholder={campo.placeholder}
                value={valores[campo.nome] ?? ''}
                onChange={(e) => alterar(campo, e.target.value)}
                error={erro}
                disabled={salvando}
              />
            )
          })}
        </form>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={() => formRef.current?.requestSubmit()}
            isLoading={salvando}
            loadingText="Salvando…"
          >
            {rotuloSalvar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
