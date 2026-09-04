import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type AuthRole } from '../../modules/auth'

export interface ProtectedRouteProps {
  requiredRole?: AuthRole
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  children,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth()
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
    // Se um USER tentar acessar rota restrita de ADMIN
    if (requiredRole === 'ADMIN' && role === 'USER') {
      return (
        <Navigate
          to="/login"
          state={{ accessDenied: true, from: location }}
          replace
        />
      )
    }
  }

  return children ? <>{children}</> : null
}
