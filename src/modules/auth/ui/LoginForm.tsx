import React, { useState } from 'react'
import { Button, Input, Alert } from '../../../shared/ui'
import type { LoginCredentials } from '../domain/authTypes'

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  isLoading?: boolean
  errorMessage?: string | null
  onClearError?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage,
  onClearError,
}) => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    senha?: string
  }>({})

  const validate = (): boolean => {
    const errors: { email?: string; senha?: string } = {}
    if (!email.trim()) {
      errors.email = 'Informe o seu endereço de email.'
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Informe um email válido.'
    }

    if (!senha) {
      errors.senha = 'Informe a sua senha de acesso.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      email: email.trim(),
      senha,
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (errorMessage && onClearError) {
      onClearError()
    }
  }

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value)
    if (fieldErrors.senha) {
      setFieldErrors((prev) => ({ ...prev, senha: undefined }))
    }
    if (errorMessage && onClearError) {
      onClearError()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 w-full"
      aria-label="Formulário de login"
    >
      {errorMessage && (
        <Alert
          variant="error"
          title="Não foi possível entrar"
          onClose={onClearError}
        >
          {errorMessage}
        </Alert>
      )}

      <Input
        label="Email institucional ou pessoal"
        type="email"
        name="email"
        id="login-email"
        autoComplete="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="seu.email@fatec.sp.gov.br"
        required
        disabled={isLoading}
        error={fieldErrors.email}
      />

      <Input
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        name="senha"
        id="login-senha"
        autoComplete="current-password"
        value={senha}
        onChange={handleSenhaChange}
        placeholder="Digite sua senha"
        required
        disabled={isLoading}
        error={fieldErrors.senha}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? 'Ocultar senha' : 'Exibir senha em texto'
            }
            aria-pressed={showPassword}
            tabIndex={0}
            className="p-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={isLoading}
        loadingText="Autenticando..."
        className="mt-2"
      >
        Entrar na conta
      </Button>
    </form>
  )
}
