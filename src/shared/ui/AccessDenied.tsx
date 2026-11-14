import React from 'react'
import { AlertCircleIcon } from './icons'
import { Button } from './Button'
import { ButtonLink } from './ButtonLink'
import { Card, CardContent } from './Card'

export interface AccessDeniedProps {
  onLogout?: () => void
  returnUrl?: string
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onLogout,
  returnUrl = '/user/inicio',
}) => {
  return (
    <div className="min-h-dvh bg-[var(--color-bg-page)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="max-w-md w-full border-[var(--color-border)] shadow-sm bg-[var(--color-bg-surface)]">
        <CardContent className="p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-warning-text)] flex items-center justify-center mb-4">
            <AlertCircleIcon size={28} />
          </div>

          <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight font-display">
            Acesso restrito
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Esta área é de uso exclusivo de administradores. Sua conta atual
            está autenticada como participante e não possui autorização para
            visualizar este conteúdo.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <ButtonLink
              to={returnUrl}
              variant="primary"
              size="md"
              fullWidth
              className="w-full sm:w-auto"
            >
              Ir para o meu painel
            </ButtonLink>

            {onLogout && (
              <Button
                variant="outline"
                size="md"
                onClick={onLogout}
                className="w-full sm:w-auto"
              >
                Trocar de conta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
