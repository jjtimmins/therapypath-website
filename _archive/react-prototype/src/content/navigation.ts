import { bookingUrl } from './pageInventory'

export type NavLink = {
  label: string
  route?: string
  href?: string
  external?: boolean
}

export type NavItem = {
  label: string
  route?: string
  href?: string
  external?: boolean
  children?: NavLink[]
}

export const navigationEn: NavItem[] = [
  { label: 'Home', route: '/' },
  {
    label: 'Services',
    children: [
      {
        label: 'Assessments',
        route: '/services/assessments',
      },
      {
        label: 'Consultations/Workshops',
        route: '/services/consultations-workshops-reading-groups',
      },
      { label: 'Therapy', route: '/services/therapy' },
      { label: 'Speech', route: '/services/therapy' },
      { label: 'Language', route: '/services/therapy' },
      { label: 'Assistive devices', route: '/services/therapy' },
      {
        label: 'Reading Groups',
        route: '/services/consultations-workshops-reading-groups',
      },
    ],
  },
  {
    label: 'Products',
    children: [
      {
        label: 'Clinical Management Software',
        route: '/services/clinical-management-software',
      },
      {
        label: 'Click Reader',
        route: '/services/clinical-management-software',
      },
    ],
  },
  {
    label: 'About Us',
    children: [
      {
        label: 'Geographical Coverage',
        route: '/about-us/geographical-coverage',
      },
      {
        label: 'Our Accomplishments',
        route: '/about-us/our-accomplishments',
      },
      { label: 'Our Team', route: '/about-us/our-team' },
      {
        label: 'Our Specializations',
        route: '/about-us/our-specializations',
      },
    ],
  },
  {
    label: 'Contact Us',
    children: [
      { label: 'Contact Us', route: '/contact-us' },
      { label: 'Fees', route: '/contact-us' },
    ],
  },
  {
    label: 'Book Online',
    href: bookingUrl,
    external: true,
  },
]

export const navigationFr: NavItem[] = [
  { label: 'Accueil', route: '/fr' },
  { label: 'Services', route: '/fr/services' },
  { label: 'À propos', route: '/fr/about-us/geographical-coverage' },
  { label: 'Contact', route: '/fr/contact-us' },
  { label: 'Réserver', href: bookingUrl, external: true },
]
