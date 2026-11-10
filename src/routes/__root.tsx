import SidebarWrapper from '@/components/sidebar-wrapper'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { NotFoundComponent } from '@/components/not-found'
import { ServerErrorComponent } from '@/components/server-error'
import { Navbar } from '@/components/navbar'

const RootLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarWrapper />
      <main className="flex-1 overflow-auto relative">
        <Navbar />
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundComponent,
  errorComponent: ServerErrorComponent,
})