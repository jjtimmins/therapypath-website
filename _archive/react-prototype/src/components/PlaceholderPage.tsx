import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import type { PageInventoryItem } from '../content/pageInventory'
import './PlaceholderPage.css'

type PlaceholderPageProps = {
  page: PageInventoryItem
}

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  usePageTitle(page.title)

  return (
    <section className="placeholder ttp-container">
      <p className="placeholder__eyebrow">Page in progress</p>
      <h1>{page.title.split('|').pop()?.trim() ?? page.title}</h1>
      <p className="placeholder__body">
        This page is part of the site migration. Content from the original Wix
        site will be rebuilt here next.
      </p>
      <Link className="ttp-button" to={page.locale === 'fr' ? '/fr' : '/'}>
        Back to home
      </Link>
    </section>
  )
}
