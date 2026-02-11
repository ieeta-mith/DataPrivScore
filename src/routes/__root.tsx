import SidebarWrapper from '@/components/sidebar-wrapper'
import { Outlet, createRootRoute } from '@tanstack/react-router'

const RootLayout = () => {
  return (
    <div className="flex min-h-screen">
      <SidebarWrapper />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({ component: RootLayout })