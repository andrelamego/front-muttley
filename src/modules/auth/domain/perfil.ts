// Validações de apoio do Meu perfil; a API confere de novo (inclusive a senha atual).
const digitos = (valor: string) => valor.replace(/\D/g, '')

export const validarDadosPerfil = (dados: {
  nome: string
  telefone: string
}): Record<string, string> => {
  const erros: Record<string, string> = {}
  if (!dados.nome.trim()) erros.nome = 'Informe seu nome.'
  const tel = digitos(dados.telefone).length
  if (tel !== 10 && tel !== 11) erros.telefone = 'Informe o telefone com DDD.'
  return erros
}

export const validarTrocaSenha = (dados: {
  senhaAtual: string
  novaSenha: string
  confirmacao: string
}): Record<string, string> => {
  const erros: Record<string, string> = {}
  if (!dados.senhaAtual) erros.senhaAtual = 'Informe a senha atual.'
  if (!dados.novaSenha) erros.novaSenha = 'Crie uma nova senha.'
  else if (dados.novaSenha === dados.senhaAtual)
    erros.novaSenha = 'A nova senha precisa ser diferente da atual.'
  if (dados.confirmacao !== dados.novaSenha)
    erros.confirmacao = 'As senhas não conferem.'
  return erros
}
