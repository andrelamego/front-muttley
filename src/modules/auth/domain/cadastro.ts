// Validações de apoio à interface; o backend continua sendo a fonte das regras (RN-PES-01).

const apenasDigitos = (valor: string) => valor.replace(/\D/g, '')

export const formatarCpf = (valor: string): string => {
  const d = apenasDigitos(valor).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export const cpfValido = (valor: string): boolean => {
  const d = apenasDigitos(valor)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const digito = (base: string) => {
    const soma = [...base].reduce(
      (acc, n, i) => acc + Number(n) * (base.length + 1 - i),
      0
    )
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return (
    digito(d.slice(0, 9)) === Number(d[9]) &&
    digito(d.slice(0, 10)) === Number(d[10])
  )
}

export const formatarTelefone = (valor: string): string => {
  const d = apenasDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  const ddd = `(${d.slice(0, 2)}) `
  const resto = d.slice(2)
  // Celular tem 9 dígitos depois do DDD; fixo, 8.
  const corte = resto.length > 8 ? 5 : 4
  return resto.length > corte
    ? `${ddd}${resto.slice(0, corte)}-${resto.slice(corte)}`
    : `${ddd}${resto}`
}

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export type ErrosCampos<K extends string> = Partial<Record<K, string>>

export const validarSolicitacao = (dados: {
  nome: string
  email: string
}): ErrosCampos<'nome' | 'email'> => {
  const erros: ErrosCampos<'nome' | 'email'> = {}
  if (!dados.nome.trim()) erros.nome = 'Informe seu nome.'
  if (!emailValido(dados.email.trim())) erros.email = 'Informe um email válido.'
  return erros
}

export interface DadosConclusao {
  nome: string
  email: string
  telefone: string
  cpf: string
  senha: string
  confirmacao: string
}

export const validarConclusao = (
  dados: DadosConclusao
): ErrosCampos<keyof DadosConclusao> => {
  const erros: ErrosCampos<keyof DadosConclusao> = {
    ...validarSolicitacao(dados),
  }
  if (apenasDigitos(dados.telefone).length < 10)
    erros.telefone = 'Informe o telefone com DDD.'
  if (!cpfValido(dados.cpf)) erros.cpf = 'CPF inválido.'
  if (!dados.senha) erros.senha = 'Crie uma senha.'
  if (dados.confirmacao !== dados.senha)
    erros.confirmacao = 'As senhas não conferem.'
  return erros
}

/** O email do convite usa /register?id={token}; aceita também ?token=. */
export const tokenDoConvite = (search: string): string | null => {
  const params = new URLSearchParams(search)
  const token = (params.get('id') ?? params.get('token') ?? '').trim()
  return token || null
}
