export interface BreadcrumbEntry {
  label: string
  /** Presente quando o item leva de volta a uma página anterior do caminho. */
  to?: string
}

const TOPO: Record<string, string> = {
  inicio: 'Painel',
  eventos: 'Eventos',
  certificados: 'Certificados',
  pessoas: 'Pessoas',
  cadastros: 'Cadastros',
}

const ACAO_EVENTO: Record<string, string> = {
  novo: 'Criar evento',
  editar: 'Editar evento',
  concluir: 'Concluir evento',
}

/** Caminho exibido no topo da área da coordenação, a partir da rota atual. */
export const getAdminBreadcrumb = (pathname: string): BreadcrumbEntry[] => {
  const [secao = '', id, acao] = pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean)

  if (secao === 'eventos' && id) {
    const label =
      ACAO_EVENTO[id === 'novo' ? 'novo' : (acao ?? '')] ??
      (acao ? undefined : 'Detalhe do evento')
    if (label) return [{ label: 'Eventos', to: '/admin/eventos' }, { label }]
  }

  return [{ label: TOPO[secao] ?? 'Coordenação' }]
}
