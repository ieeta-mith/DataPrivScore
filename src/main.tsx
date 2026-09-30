import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { registerPlugin } from '@/core/plugin-registry'
import { registerUIExtension } from '@/core/ui-registry'

import { kAnonymityPlugin, kAnonymityUI } from '@/plugins/k-anonymity'
import { lDiversityPlugin, lDiversityUI } from '@/plugins/l-diversity'
import { tClosenessPlugin, tClosenessUI } from '@/plugins/t-closeness'

// Register plugins logic
registerPlugin(kAnonymityPlugin)
registerPlugin(lDiversityPlugin)
registerPlugin(tClosenessPlugin)

// Register plugins UI
registerUIExtension(kAnonymityUI)
registerUIExtension(lDiversityUI)
registerUIExtension(tClosenessUI)

const router = createRouter({ 
  routeTree,
  basepath: '/privacy', 
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
