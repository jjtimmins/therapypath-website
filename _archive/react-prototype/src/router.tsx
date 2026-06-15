import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PlaceholderPage } from './components/PlaceholderPage'
import { pages } from './content/pageInventory'
import { HomePage } from './pages/HomePage'

const pageRoutes = pages.filter(
  (page) =>
    page.route !== '/' &&
    page.id !== 'home-en' &&
    page.id !== 'home-fr',
)

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="fr" element={<PlaceholderPage page={pages.find((p) => p.id === 'home-fr')!} />} />
        {pageRoutes.map((page) => {
          const path = page.route.replace(/^\//, '')
          return (
            <Route
              key={page.id}
              path={path}
              element={<PlaceholderPage page={page} />}
            />
          )
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
