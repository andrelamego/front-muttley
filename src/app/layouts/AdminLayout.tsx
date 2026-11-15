import React, { useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sun,
  Ticket as TicketIcone,
  UserRound,
} from 'lucide-react'
import { AvatarPessoa, useAuth } from '../../modules/auth'
import { PageTransition } from '../../shared/motion'
import { useTheme } from '../../shared/theme'
import {
  AwardIcon,
  BookOpenIcon,
  CalendarIcon,
  DashboardIcon,
  ExternalLinkIcon,
  Logo,
  UsersIcon,
} from '../../shared/ui'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../shared/ui/shadcn/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../shared/ui/shadcn/dropdown-menu'
import { Separator } from '../../shared/ui/shadcn/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '../../shared/ui/shadcn/sidebar'
import { getAdminBreadcrumb } from './adminBreadcrumb'

// O sidebar.tsx grava o estado aberto/recolhido neste cookie; aqui ele é lido na carga.
const sidebarAbertoNoCookie = () =>
  !document.cookie.split('; ').includes('sidebar_state=false')

const navItems = [
  { to: '/admin/inicio', label: 'Painel', icon: DashboardIcon },
  { to: '/admin/eventos', label: 'Eventos', icon: CalendarIcon },
  { to: '/admin/certificados', label: 'Certificados', icon: AwardIcon },
  { to: '/admin/pessoas', label: 'Pessoas', icon: UsersIcon },
  { to: '/admin/cadastros', label: 'Cadastros', icon: BookOpenIcon },
]

const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { setOpenMobile } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()

  // No celular a barra é uma gaveta: fecha ao escolher um destino.
  const fecharNoCelular = () => setOpenMobile(false)

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true, state: {} })
  }, [logout, navigate])

  const isActive = (to: string) =>
    to === '/admin/eventos'
      ? location.pathname.startsWith('/admin/eventos')
      : location.pathname === to

  return (
    <Sidebar collapsible="icon" aria-label="Navegação da coordenação">
      <SidebarHeader>
        <Link
          to="/admin/inicio"
          onClick={fecharNoCelular}
          className="flex h-10 items-center rounded-sm px-2 text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          aria-label="Muttley, ir para o painel"
        >
          {/* Recolhida, só o nome sai de cena: o canhoto fica com o mesmo tamanho e lugar */}
          <span className="block w-[90px] overflow-hidden transition-[width] duration-200 ease-linear group-data-[collapsible=icon]:w-4">
            <Logo className="h-7 w-[90px] max-w-none" />
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ to, label, icon: Icon }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(to)}
                  tooltip={label}
                  className="h-9 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                  <Link to={to} onClick={fecharNoCelular}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
                {to === '/admin/eventos' && (
                  <SidebarMenuAction
                    asChild
                    showOnHover
                    className="top-2 hover:bg-white/15"
                  >
                    <Link
                      to="/admin/eventos/novo"
                      onClick={fecharNoCelular}
                      aria-label="Criar evento"
                      title="Criar evento"
                    >
                      <Plus />
                    </Link>
                  </SidebarMenuAction>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Outras visões</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Meu painel de participante"
                className="h-9"
              >
                <Link to="/user/inicio" onClick={fecharNoCelular}>
                  <TicketIcone className="size-[18px]" />
                  <span>Meu painel de participante</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Ver página pública"
                className="h-9"
              >
                <Link to="/eventos" onClick={fecharNoCelular}>
                  <ExternalLinkIcon size={18} />
                  <span>Ver página pública</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.nome || 'Conta'}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <AvatarPessoa className="size-8 text-xs" />
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">
                      {user?.nome || 'Coordenação'}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
                // Abre para cima, sobre a barra, alinhado ao botão do usuário.
                side="top"
                align="start"
                sideOffset={6}
              >
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate font-semibold">
                    {user?.nome || 'Coordenação'}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user/perfil" onClick={fecharNoCelular}>
                    <UserRound />
                    Meu perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/perfil" onClick={fecharNoCelular}>
                    <Settings />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toggleTheme}>
                  {theme === 'light' ? <Moon /> : <Sun />}
                  {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const AdminLayout: React.FC = () => {
  const location = useLocation()
  const caminho = getAdminBreadcrumb(location.pathname)

  return (
    <SidebarProvider defaultOpen={sidebarAbertoNoCookie()}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-md focus:shadow-md focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-page)]/90 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger
            className="-ml-1 size-9"
            aria-label="Recolher ou abrir o menu (Ctrl+B)"
            title="Recolher ou abrir o menu (Ctrl+B)"
          />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {caminho.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.to ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.to}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <footer className="border-t border-[var(--color-border)]/60 py-4 px-6 text-center text-xs text-[var(--color-text-muted)]">
          Área de gestão Muttley &copy; {new Date().getFullYear()}
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
