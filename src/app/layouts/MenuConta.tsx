import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react'
import { AvatarPessoa, useAuth } from '../../modules/auth'
import { useTheme } from '../../shared/theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/ui/shadcn/dropdown-menu'

/**
 * Menu da conta aberto pela foto: perfil, configurações, painéis, tema e sair.
 * O mesmo no cabeçalho do participante e no da página pública.
 */
export const MenuConta: React.FC<{
  /** Link para o painel do participante: útil fora dele, como na página pública. */
  comPainel?: boolean
}> = ({ comPainel = false }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const sair = () => {
    logout()
    navigate('/login', { replace: true, state: {} })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu da conta"
        className="flex items-center gap-2.5 rounded-full p-0.5 sm:pr-3 transition-colors hover:bg-[var(--color-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] data-[state=open]:bg-[var(--color-bg-hover)]"
      >
        <AvatarPessoa className="size-9 text-xs" />
        <span className="hidden sm:block text-sm font-semibold max-w-40 truncate">
          {user?.nome?.split(' ')[0] || 'Participante'}
        </span>
        <ChevronDown
          className="hidden sm:block size-4 text-[var(--color-text-muted)]"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 font-normal">
          <AvatarPessoa className="size-10 text-sm" />
          <span className="min-w-0">
            <span className="block truncate font-semibold">
              {user?.nome || 'Participante'}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {comPainel && (
          <DropdownMenuItem asChild>
            <Link to="/user/inicio">
              <LayoutDashboard />
              Meu painel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/user/perfil">
            <UserRound />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/user/perfil/editar">
            <Settings />
            Configurações
          </Link>
        </DropdownMenuItem>
        {user?.role === 'ADMIN' && (
          <DropdownMenuItem asChild>
            <Link to="/admin/inicio">
              <ShieldCheck />
              Painel da coordenação
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={toggleTheme}>
          {theme === 'light' ? <Moon /> : <Sun />}
          {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={sair}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
