import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import './Layout.css'

export function Layout() {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
