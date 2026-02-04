import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/classify')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/classify"!</div>
}
