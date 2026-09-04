import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type AuthRole } from '../../modules/auth'
import { AccessDenied } from '../../shared/ui'

export interface ProtectedRouteProps {
  requiredRole?: AuthRole
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  children,
}) => {
  const { isAuthenticated, role, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Verificando autenticação...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && role !== requiredRole) {
    // Usuário autenticado tentando acessar rota além de seu perfil (ex: USER tentando ADMIN)
    return (
      <AccessDenied
        onLogout={logout}
        returnUrl={role === 'ADMIN' ? '/admin/inicio' : '/user/inicio'}
      />
    )
  }

  return children ? <>{children}</> : null
}
