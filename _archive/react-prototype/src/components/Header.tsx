import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { featuredImages } from '../content/images'
import { navigationEn, navigationFr, type NavItem } from '../content/navigation'
import { site } from '../content/site'
import { getLocaleFromPath, localePath, type Locale } from '../i18n/locale'
import './Header.css'

function NavItemLink({
  item,
  locale,
  onNavigate,
}: {
  item: NavItem
  locale: Locale
  onNavigate?: () => void
}) {
  const location = useLocation()

  if (!item.route && !item.href && item.children) {
    return <span className="site-nav__link site-nav__link--parent">{item.label}</span>
  }

  if (item.external && item.href) {
    return (
      <a
        className="site-nav__link"
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        {item.label}
      </a>
    )
  }

  const route = item.route ? localePath(locale, item.route) : '/'
  const isActive =
    route === location.pathname ||
    (route !== '/' && route !== '/fr' && location.pathname.startsWith(route))

  return (
    <Link
      className={`site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
      to={route}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  )
}

export function Header() {
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname)
  const navItems = locale === 'fr' ? navigationFr : navigationEn
  const [menuOpen, setMenuOpen] = useState(false)
  const switchLocale: Locale = locale === 'fr' ? 'en' : 'fr'
  const switchPath =
    locale === 'fr'
      ? location.pathname.replace(/^\/fr/, '') || '/'
      : localePath('fr', location.pathname)

  return (
    <header className="site-header">
      <div className="site-header__top">
        <div className="ttp-container site-header__top-inner">
          <a className="site-header__phone" href={site.contact.phoneHref}>
            {site.contact.phone}
          </a>
          <a
            className="ttp-button site-header__cta"
            href={site.urls.booking}
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule an Appointment
          </a>
        </div>
      </div>

      <div className="site-header__main">
        <div className="ttp-container site-header__main-inner">
          <Link
            className="site-header__brand"
            to={localePath(locale, '/')}
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={featuredImages.logo.path}
              alt={site.name}
              width={143}
              height={135}
            />
          </Link>

          <button
            type="button"
            className="site-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>

          <nav
            id="site-navigation"
            className={`site-nav${menuOpen ? ' site-nav--open' : ''}`}
            aria-label="Main"
          >
            <ul className="site-nav__list">
              {navItems.map((item) => (
                <li
                  key={item.label}
                  className={`site-nav__item${item.children ? ' site-nav__item--has-children' : ''}`}
                >
                  <NavItemLink
                    item={item}
                    locale={locale}
                    onNavigate={() => setMenuOpen(false)}
                  />
                  {item.children ? (
                    <ul className="site-nav__submenu">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          {child.external && child.href ? (
                            <a
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {child.label}
                            </a>
                          ) : (
                            <Link
                              to={localePath(locale, child.route ?? '/')}
                              onClick={() => setMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>

            <Link
              className="site-nav__locale"
              to={switchPath}
              onClick={() => setMenuOpen(false)}
            >
              {switchLocale === 'fr' ? 'Français' : 'English'}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
