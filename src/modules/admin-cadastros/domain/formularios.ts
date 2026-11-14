// Formulários da coordenação descritos como dados: a mesma tela lateral edita pessoas e cadastros.
// Os campos e obrigatoriedades espelham os DTOs da API (AtualizacaoPessoa, AtualizacaoLocal etc.).
import {
  cpfValido,
  formatarCpf,
  formatarTelefone,
} from '../../auth/domain/cadastro.ts'

export interface OpcaoCampo {
  valor: string
  rotulo: string
}

export interface CampoFormulario {
  nome: string
  rotulo: string
  tipo: 'texto' | 'email' | 'numero' | 'textarea' | 'select'
  obrigatorio: boolean
  placeholder?: string
  /** Opções fixas; selects que dependem da API recebem as opções na tela. */
  opcoes?: OpcaoCampo[]
  /** Formata enquanto a pessoa digita (CPF, telefone). */
  mascara?: (valor: string) => string
  validar?: (valor: string) => string | null
}

export type Valores = Record<string, string>

export type TipoCadastro =
  | 'disciplinas'
  | 'locais'
  | 'patrocinadores'
  | 'enderecos'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validarEmail = (v: string) =>
  EMAIL.test(v.trim()) ? null : 'Informe um email válido.'
const validarCpf = (v: string) =>
  cpfValido(v) ? null : 'Informe um CPF válido.'
const validarPositivo = (v: string) =>
  Number.isInteger(Number(v)) && Number(v) > 0
    ? null
    : 'Informe um número inteiro maior que zero.'
const validarValor = (v: string) =>
  Number.isFinite(Number(v.replace(',', '.'))) &&
  Number(v.replace(',', '.')) >= 0
    ? null
    : 'Informe um valor numérico.'

export const CAMPOS_PESSOA: CampoFormulario[] = [
  { nome: 'nome', rotulo: 'Nome completo', tipo: 'texto', obrigatorio: true },
  {
    nome: 'email',
    rotulo: 'Email',
    tipo: 'email',
    obrigatorio: true,
    validar: validarEmail,
  },
  {
    nome: 'telefone',
    rotulo: 'Telefone',
    tipo: 'texto',
    obrigatorio: true,
    placeholder: '(11) 91234-5678',
    mascara: formatarTelefone,
  },
  {
    nome: 'cpf',
    rotulo: 'CPF',
    tipo: 'texto',
    obrigatorio: true,
    placeholder: '000.000.000-00',
    mascara: formatarCpf,
    validar: validarCpf,
  },
]

export const CAMPOS_CONVITE: CampoFormulario[] = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
  {
    nome: 'email',
    rotulo: 'Email',
    tipo: 'email',
    obrigatorio: true,
    validar: validarEmail,
  },
]

export const CAMPOS_CADASTRO: Record<TipoCadastro, CampoFormulario[]> = {
  disciplinas: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
    {
      nome: 'descricao',
      rotulo: 'Descrição',
      tipo: 'textarea',
      obrigatorio: true,
    },
    {
      nome: 'turno',
      rotulo: 'Turno',
      tipo: 'select',
      obrigatorio: true,
      // NORTUNO é a grafia do enum na API.
      opcoes: [
        { valor: 'MATUTINO', rotulo: 'Matutino' },
        { valor: 'VESPERTINO', rotulo: 'Vespertino' },
        { valor: 'NORTUNO', rotulo: 'Noturno' },
      ],
    },
    {
      nome: 'id_professor',
      rotulo: 'Professor responsável',
      tipo: 'select',
      obrigatorio: false,
    },
  ],
  locais: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
    {
      nome: 'descricao',
      rotulo: 'Descrição',
      tipo: 'textarea',
      obrigatorio: true,
    },
    {
      nome: 'capacidade',
      rotulo: 'Capacidade (pessoas)',
      tipo: 'numero',
      obrigatorio: true,
      validar: validarPositivo,
    },
    {
      nome: 'enderecoId',
      rotulo: 'Endereço',
      tipo: 'select',
      obrigatorio: true,
    },
  ],
  patrocinadores: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
    {
      nome: 'cnpj',
      rotulo: 'CNPJ',
      tipo: 'texto',
      obrigatorio: true,
      placeholder: '00.000.000/0000-00',
    },
    {
      nome: 'valorPatrocinio',
      rotulo: 'Valor do patrocínio (R$)',
      tipo: 'numero',
      obrigatorio: true,
      validar: validarValor,
    },
    {
      nome: 'email',
      rotulo: 'Email',
      tipo: 'email',
      obrigatorio: true,
      validar: validarEmail,
    },
    {
      nome: 'telefone',
      rotulo: 'Telefone',
      tipo: 'texto',
      obrigatorio: true,
      mascara: formatarTelefone,
    },
    {
      nome: 'site',
      rotulo: 'Site',
      tipo: 'texto',
      obrigatorio: true,
      placeholder: 'https://',
    },
  ],
  enderecos: [
    {
      nome: 'logradouro',
      rotulo: 'Logradouro',
      tipo: 'texto',
      obrigatorio: true,
    },
    {
      nome: 'numero',
      rotulo: 'Número',
      tipo: 'numero',
      obrigatorio: true,
      validar: validarPositivo,
    },
    {
      nome: 'complemento',
      rotulo: 'Complemento',
      tipo: 'texto',
      obrigatorio: true,
    },
    { nome: 'bairro', rotulo: 'Bairro', tipo: 'texto', obrigatorio: true },
    { nome: 'cidade', rotulo: 'Cidade', tipo: 'texto', obrigatorio: true },
    {
      nome: 'estado',
      rotulo: 'Estado (UF)',
      tipo: 'texto',
      obrigatorio: true,
      placeholder: 'SP',
    },
  ],
}

/** Rótulos no singular, para títulos como "Nova disciplina" e "Editar local". */
export const NOME_CADASTRO: Record<
  TipoCadastro,
  { singular: string; novo: string }
> = {
  disciplinas: { singular: 'disciplina', novo: 'Nova disciplina' },
  locais: { singular: 'local', novo: 'Novo local' },
  patrocinadores: { singular: 'patrocinador', novo: 'Novo patrocinador' },
  enderecos: { singular: 'endereço', novo: 'Novo endereço' },
}

/** Mensagem por campo; vazio quando tudo está certo. */
export const validarValores = (
  campos: CampoFormulario[],
  valores: Valores
): Record<string, string> => {
  const erros: Record<string, string> = {}
  for (const campo of campos) {
    const valor = (valores[campo.nome] ?? '').trim()
    if (!valor) {
      if (campo.obrigatorio)
        erros[campo.nome] = `Preencha ${campo.rotulo.toLowerCase()}.`
      continue
    }
    const erro = campo.validar?.(valor)
    if (erro) erros[campo.nome] = erro
  }
  return erros
}

/** Converte o formulário no corpo esperado pela API: números como número e vazio como null. */
export const paraPayload = (
  campos: CampoFormulario[],
  valores: Valores
): Record<string, string | number | null> =>
  Object.fromEntries(
    campos.map((campo) => {
      const valor = (valores[campo.nome] ?? '').trim()
      if (!valor) return [campo.nome, null]
      if (campo.tipo === 'numero')
        return [campo.nome, Number(valor.replace(',', '.'))]
      if (campo.tipo === 'select' && /^(id_|.*Id$)/.test(campo.nome))
        return [campo.nome, Number(valor)]
      return [campo.nome, valor]
    })
  )

/** Preenche o formulário a partir de um registro da API (null/objetos viram texto ou id). */
export const valoresDe = (
  campos: CampoFormulario[],
  registro: Record<string, unknown> | null
): Valores => {
  const ids: Record<string, string> = {
    id_professor: 'professor',
    enderecoId: 'endereco',
  }
  return Object.fromEntries(
    campos.map((campo) => {
      if (!registro) return [campo.nome, '']
      const relacionado = ids[campo.nome]
      const bruto = relacionado
        ? (registro[relacionado] as { id?: unknown } | null | undefined)?.id
        : registro[campo.nome]
      const texto = bruto === null || bruto === undefined ? '' : String(bruto)
      return [campo.nome, campo.mascara ? campo.mascara(texto) : texto]
    })
  )
}
