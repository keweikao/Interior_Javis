import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
  createRouter,
  createHashHistory,
  createRootRoute,
  createRoute,
  Link,
  Outlet,
  Navigate,
} from '@tanstack/react-router'
import './index.css'

// -- Root layout --
const rootRoute = createRootRoute({
  component: function RootLayout() {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="relative">
              <h1
                className="text-xl tracking-tight"
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}
              >
                Q-Check
              </h1>
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full" />
            </div>
            <nav className="flex gap-6 text-sm font-medium">
              <Link
                to="/projects/$projectId"
                params={{ projectId: 'demo' }}
                className="text-muted-foreground hover:text-foreground transition-colors py-1 border-b-2 border-transparent [&.active]:text-primary [&.active]:border-primary"
              >
                現場條件
              </Link>
              <Link
                to="/projects/$projectId/quotation"
                params={{ projectId: 'demo' }}
                className="text-muted-foreground hover:text-foreground transition-colors py-1 border-b-2 border-transparent [&.active]:text-primary [&.active]:border-primary"
              >
                報價編輯
              </Link>
              <Link
                to="/projects/$projectId/checklist"
                params={{ projectId: 'demo' }}
                className="text-muted-foreground hover:text-foreground transition-colors py-1 border-b-2 border-transparent [&.active]:text-primary [&.active]:border-primary"
              >
                完成確認
              </Link>
              <Link
                to="/projects/$projectId/export"
                params={{ projectId: 'demo' }}
                className="text-muted-foreground hover:text-foreground transition-colors py-1 border-b-2 border-transparent [&.active]:text-primary [&.active]:border-primary"
              >
                匯出
              </Link>
              <Link
                to="/upload"
                className="text-muted-foreground hover:text-foreground transition-colors py-1 border-b-2 border-transparent [&.active]:text-primary [&.active]:border-primary"
              >
                上傳檢查
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    )
  },
})

// -- Index route (redirect) --
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Navigate to="/projects/$projectId" params={{ projectId: 'demo' }} />
  ),
})

// -- Lazy-load page components --
import SiteConditionPage from './pages/SiteConditionPage'
import QuotationPage from './pages/QuotationPage'
import ChecklistPage from './pages/ChecklistPage'
import ExportPage from './pages/ExportPage'
import UploadCheckPage from './pages/UploadCheckPage'

// -- Project routes --
const projectIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: SiteConditionPage,
})

const projectQuotationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/quotation',
  component: QuotationPage,
})

const projectChecklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/checklist',
  component: ChecklistPage,
})

const projectExportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/export',
  component: ExportPage,
})

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadCheckPage,
})

// -- Route tree --
const routeTree = rootRoute.addChildren([
  indexRoute,
  projectIndexRoute,
  projectQuotationRoute,
  projectChecklistRoute,
  projectExportRoute,
  uploadRoute,
])

const hashHistory = createHashHistory()

const router = createRouter({
  routeTree,
  history: hashHistory,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
