import { Link, useLocation } from 'react-router-dom'
import { featuredImages } from '../content/images'
import { site } from '../content/site'
import { getLocaleFromPath } from '../i18n/locale'
import './Footer.css'

const hours = 'Monday – Friday: 8:30 AM – 4:30 PM'

export function Footer() {
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname)
  const homeRoute = locale === 'fr' ? '/fr' : '/'

  return (
    <footer className="site-footer">
      <div className="site-footer__banner ttp-container">
        <div className="site-footer__contact-grid">
          <div>
            <img
              className="site-footer__mark"
              src={featuredImages.assessmentService.path}
              alt=""
              width={120}
              height={120}
            />
            <p className="site-footer__brand">{site.name}</p>
            <p>
              {site.contact.address.street}
              <br />
              {site.contact.address.city}, {site.contact.address.region}{' '}
              {site.contact.address.postalCode}
            </p>
            <p>
              <a href={site.contact.phoneHref}>{site.contact.phone}</a>
            </p>
          </div>

          <div>
            <h2>Contact</h2>
            <p>
              <a href="mailto:jstark@therapypath.com">jstark@therapypath.com</a>
            </p>
            <p>
              <a href={site.contact.emailHref}>{site.contact.email}</a>
            </p>
            <p>{hours}</p>
          </div>

          <div>
            <h2>Quick links</h2>
            <ul className="site-footer__links">
              <li>
                <Link to={homeRoute}>Home</Link>
              </li>
              <li>
                <Link to={locale === 'fr' ? '/fr/services' : '/services'}>
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to={
                    locale === 'fr'
                      ? '/fr/about-us/geographical-coverage'
                      : '/about-us/geographical-coverage'
                  }
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href={site.urls.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Online
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="ttp-container site-footer__bar-inner">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="site-footer__note">Northern Ontario speech-language pathology</p>
        </div>
      </div>
    </footer>
  )
}
