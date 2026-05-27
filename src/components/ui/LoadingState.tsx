type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Carregando dados' }: LoadingStateProps) {
  return (
    <div className="ui-loading-state" role="status" aria-live="polite">
      <span />
      <p>{label}</p>
    </div>
  )
}
