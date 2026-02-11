import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'

const RootLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({ component: RootLayout })
