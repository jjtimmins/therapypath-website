import { Link } from 'react-router-dom'
import { homeEn } from '../content/homeEn'
import { site } from '../content/site'
import { usePageTitle } from '../hooks/usePageTitle'
import './HomePage.css'

export function HomePage() {
  usePageTitle(homeEn.meta.title)

  return (
    <div className="home-page">
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${homeEn.hero.image})` }}
      >
        <div className="home-hero__overlay ttp-container">
          <h1 className="ttp-heading-hero">{homeEn.hero.headline}</h1>
          <p className="home-hero__subheadline">{homeEn.hero.subheadline}</p>
          <p className="home-hero__body">{homeEn.hero.body}</p>
          <a
            className="ttp-button ttp-button--secondary"
            href={site.urls.booking}
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule an Appointment
          </a>
        </div>
      </section>

      <section className="home-split ttp-container">
        <div className="home-split__card">
          <img src={homeEn.assessments.image} alt={homeEn.assessments.imageAlt} />
          <div>
            <h2>{homeEn.assessments.title}</h2>
            <p>{homeEn.assessments.body}</p>
            <Link className="home-link" to={homeEn.assessments.link}>
              Learn about assessments
            </Link>
          </div>
        </div>

        <div className="home-split__card home-split__card--reverse">
          <img src={homeEn.therapy.image} alt={homeEn.therapy.imageAlt} />
          <div>
            <h2>{homeEn.therapy.title}</h2>
            <p>{homeEn.therapy.body}</p>
            <Link className="home-link" to={homeEn.therapy.link}>
              Explore therapy services
            </Link>
          </div>
        </div>
      </section>

      <section className="home-services ttp-container">
        <h2 className="home-services__title">Our Services</h2>
        <p className="home-services__intro">{homeEn.servicesIntro}</p>
        <div className="home-services__grid">
          {homeEn.serviceCards.map((service) => (
            <article key={service.title} className="home-service-card">
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              <Link className="home-link" to={service.link}>
                Learn more
              </Link>
            </article>
          ))}
        </div>
        <p className="home-services__invite">{homeEn.invite}</p>
      </section>

      <section className="home-booking">
        <div className="ttp-container home-booking__inner">
          <div>
            <h2>Book Online</h2>
            <p>
              Request an appointment through our secure TheraMatic booking
              portal.
            </p>
            <ul className="home-booking__list">
              {homeEn.bookingServices.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
            <a
              className="ttp-button"
              href={site.urls.booking}
              target="_blank"
              rel="noopener noreferrer"
            >
              Schedule an Appointment
            </a>
          </div>
          <img
            src={homeEn.footerBanner.image}
            alt={homeEn.footerBanner.imageAlt}
          />
        </div>
      </section>
    </div>
  )
}
