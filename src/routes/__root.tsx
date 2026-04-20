import { Outlet, createRootRoute } from '@tanstack/react-router'
import { NotFoundComponent } from './not-found'
import { ServerErrorComponent } from './server-error'

const RootLayout = () => {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-auto">
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