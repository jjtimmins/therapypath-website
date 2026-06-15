export type PageStatus = 'pending' | 'in-progress' | 'done'
export type PageSection =
  | 'home'
  | 'services'
  | 'about'
  | 'booking'
  | 'contact'
  | 'utility'

export type PageInventoryItem = {
  id: string
  route: string
  locale: 'en' | 'fr'
  section: PageSection
  title: string
  backupPath: string
  legacyUrl: string
  status: PageStatus
  notes?: string
}

/** HTTrack backup root: C:\\WebsiteBackup\\TherapyPath backup\\www.therapypath.com */
export const backupRoot =
  'C:\\WebsiteBackup\\TherapyPath backup\\www.therapypath.com'

export const bookingUrl = 'https://theramatic.ca/request-appointment/the-therapy-path'

export const navigation = {
  en: [
    { label: 'Home', route: '/' },
    { label: 'Services', route: '/services' },
    { label: 'About Us', route: '/about-us/geographical-coverage' },
    { label: 'Book Online', route: '/book-online', externalBooking: true },
    { label: 'Contact Us', route: '/contact-us' },
  ],
  fr: [
    { label: 'Accueil', route: '/fr' },
    { label: 'Services', route: '/fr/services' },
    { label: 'À propos', route: '/fr/about-us/geographical-coverage' },
    { label: 'Réserver', route: '/fr/book-online', externalBooking: true },
    { label: 'Contact', route: '/fr/contact-us' },
  ],
} as const

export const pages: PageInventoryItem[] = [
  {
    id: 'home-en',
    route: '/',
    locale: 'en',
    section: 'home',
    title: 'Speech-Language Therapy in Northern Ontario | Home | The Therapy Path',
    backupPath: `${backupRoot}\\index.html`,
    legacyUrl: 'https://www.therapypath.com/',
    status: 'done',
  },
  {
    id: 'home-fr',
    route: '/fr',
    locale: 'fr',
    section: 'home',
    title: 'Speech-Language Therapy in Northern Ontario | Home | The Therapy Path',
    backupPath: `${backupRoot}\\fr.html`,
    legacyUrl: 'https://www.therapypath.com/fr',
    status: 'pending',
  },
  {
    id: 'services-hub-en',
    route: '/services',
    locale: 'en',
    section: 'services',
    title: 'Services | The Therapy Path',
    backupPath: `${backupRoot}\\services.html`,
    legacyUrl: 'https://www.therapypath.com/services',
    status: 'pending',
  },
  {
    id: 'services-hub-fr',
    route: '/fr/services',
    locale: 'fr',
    section: 'services',
    title: 'Services | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\services.html`,
    legacyUrl: 'https://www.therapypath.com/fr/services',
    status: 'pending',
  },
  {
    id: 'services-assessments-en',
    route: '/services/assessments',
    locale: 'en',
    section: 'services',
    title: 'Speech-Language Assessments in Northern Ontario | Assessments | The Therapy Path',
    backupPath: `${backupRoot}\\services\\assessments.html`,
    legacyUrl: 'https://www.therapypath.com/services/assessments',
    status: 'pending',
  },
  {
    id: 'services-assessments-fr',
    route: '/fr/services/assessments',
    locale: 'fr',
    section: 'services',
    title: 'Speech-Language Assessments in Northern Ontario | Assessments | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\services\\assessments.html`,
    legacyUrl: 'https://www.therapypath.com/fr/services/assessments',
    status: 'pending',
  },
  {
    id: 'services-therapy-en',
    route: '/services/therapy',
    locale: 'en',
    section: 'services',
    title: 'Speech and Language Therapy in Northern Ontario | Therapy | The Therapy Path',
    backupPath: `${backupRoot}\\services\\therapy.html`,
    legacyUrl: 'https://www.therapypath.com/services/therapy',
    status: 'pending',
  },
  {
    id: 'services-therapy-fr',
    route: '/fr/services/therapy',
    locale: 'fr',
    section: 'services',
    title: 'Speech and Language Therapy in Northern Ontario | Therapy | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\services\\therapy.html`,
    legacyUrl: 'https://www.therapypath.com/fr/services/therapy',
    status: 'pending',
  },
  {
    id: 'services-consultations-en',
    route: '/services/consultations-workshops-reading-groups',
    locale: 'en',
    section: 'services',
    title: 'Consultations and Reading Programs in Northern Ontario | Workshops | The Therapy Path',
    backupPath: `${backupRoot}\\services\\consultations-workshops-reading-groups.html`,
    legacyUrl:
      'https://www.therapypath.com/services/consultations-workshops-reading-groups',
    status: 'pending',
  },
  {
    id: 'services-consultations-fr',
    route: '/fr/services/consultations-workshops-reading-groups',
    locale: 'fr',
    section: 'services',
    title: 'Consultations and Reading Programs in Northern Ontario | Workshops | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\services\\consultations-workshops-reading-groups.html`,
    legacyUrl:
      'https://www.therapypath.com/fr/services/consultations-workshops-reading-groups',
    status: 'pending',
  },
  {
    id: 'services-software-en',
    route: '/services/clinical-management-software',
    locale: 'en',
    section: 'services',
    title: 'Assistive Reading Software to Boost Skills & Access Knowledge | The Therapy Path',
    backupPath: `${backupRoot}\\services\\clinical-management-software.html`,
    legacyUrl: 'https://www.therapypath.com/services/clinical-management-software',
    status: 'pending',
  },
  {
    id: 'services-software-fr',
    route: '/fr/services/clinical-management-software',
    locale: 'fr',
    section: 'services',
    title: 'Assistive Reading Software to Boost Skills & Access Knowledge | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\services\\clinical-management-software.html`,
    legacyUrl:
      'https://www.therapypath.com/fr/services/clinical-management-software',
    status: 'pending',
  },
  {
    id: 'about-coverage-en',
    route: '/about-us/geographical-coverage',
    locale: 'en',
    section: 'about',
    title: 'Speech-Language Services in Northern Ontario | Geographical Coverage | The Therapy Path',
    backupPath: `${backupRoot}\\about-us\\geographical-coverage.html`,
    legacyUrl: 'https://www.therapypath.com/about-us/geographical-coverage',
    status: 'pending',
  },
  {
    id: 'about-coverage-fr',
    route: '/fr/about-us/geographical-coverage',
    locale: 'fr',
    section: 'about',
    title: 'Speech-Language Services in Northern Ontario | Geographical Coverage | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\about-us\\geographical-coverage.html`,
    legacyUrl: 'https://www.therapypath.com/fr/about-us/geographical-coverage',
    status: 'pending',
  },
  {
    id: 'about-team-en',
    route: '/about-us/our-team',
    locale: 'en',
    section: 'about',
    title: 'Therapist Employment Opportunities in Northern Ontario | Employment | The Therapy Path',
    backupPath: `${backupRoot}\\about-us\\our-team.html`,
    legacyUrl: 'https://www.therapypath.com/about-us/our-team',
    status: 'pending',
  },
  {
    id: 'about-team-fr',
    route: '/fr/about-us/our-team',
    locale: 'fr',
    section: 'about',
    title: 'Therapist Employment Opportunities in Northern Ontario | Employment | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\about-us\\our-team.html`,
    legacyUrl: 'https://www.therapypath.com/fr/about-us/our-team',
    status: 'pending',
  },
  {
    id: 'about-specializations-en',
    route: '/about-us/our-specializations',
    locale: 'en',
    section: 'about',
    title:
      'Brain Injury, Learning Disabilities, and Stroke Services in Northern Ontario | Our Specializations | The Therapy Path',
    backupPath: `${backupRoot}\\about-us\\our-specializations.html`,
    legacyUrl: 'https://www.therapypath.com/about-us/our-specializations',
    status: 'pending',
  },
  {
    id: 'about-specializations-fr',
    route: '/fr/about-us/our-specializations',
    locale: 'fr',
    section: 'about',
    title:
      'Brain Injury, Learning Disabilities, and Stroke Services in Northern Ontario | Our Specializations | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\about-us\\our-specializations.html`,
    legacyUrl: 'https://www.therapypath.com/fr/about-us/our-specializations',
    status: 'pending',
  },
  {
    id: 'about-accomplishments-en',
    route: '/about-us/our-accomplishments',
    locale: 'en',
    section: 'about',
    title:
      'Communication and Literacy Accomplishments in Northern Ontario | Accomplishments | The Therapy Path',
    backupPath: `${backupRoot}\\about-us\\our-accomplishments.html`,
    legacyUrl: 'https://www.therapypath.com/about-us/our-accomplishments',
    status: 'pending',
  },
  {
    id: 'about-accomplishments-fr',
    route: '/fr/about-us/our-accomplishments',
    locale: 'fr',
    section: 'about',
    title:
      'Communication and Literacy Accomplishments in Northern Ontario | Accomplishments | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\about-us\\our-accomplishments.html`,
    legacyUrl: 'https://www.therapypath.com/fr/about-us/our-accomplishments',
    status: 'pending',
  },
  {
    id: 'book-online-en',
    route: '/book-online',
    locale: 'en',
    section: 'booking',
    title: 'Book Online | The Therapy Path',
    backupPath: `${backupRoot}\\book-online.html`,
    legacyUrl: 'https://www.therapypath.com/book-online',
    status: 'pending',
    notes: `Replace Wix Bookings with TheraMatic: ${bookingUrl}`,
  },
  {
    id: 'book-online-fr',
    route: '/fr/book-online',
    locale: 'fr',
    section: 'booking',
    title: 'Reservez en ligne | The Therapy Path',
    backupPath: `${backupRoot}\\fr\\book-online.html`,
    legacyUrl: 'https://www.therapypath.com/fr/book-online',
    status: 'pending',
    notes: `Replace Wix Bookings with TheraMatic: ${bookingUrl}`,
  },
  {
    id: 'contact-en',
    route: '/contact-us',
    locale: 'en',
    section: 'contact',
    title: 'The Therapy Path | Timmins, Ontario | Contact Us',
    backupPath: `${backupRoot}\\contact-us.html`,
    legacyUrl: 'https://www.therapypath.com/contact-us',
    status: 'pending',
    notes: 'Wix contact form will need replacement (mailto or form service).',
  },
  {
    id: 'contact-fr',
    route: '/fr/contact-us',
    locale: 'fr',
    section: 'contact',
    title: 'The Therapy Path | Timmins, Ontario | Contact Us',
    backupPath: `${backupRoot}\\fr\\contact-us.html`,
    legacyUrl: 'https://www.therapypath.com/fr/contact-us',
    status: 'pending',
    notes: 'Wix contact form will need replacement (mailto or form service).',
  },
]

/** Legacy Wix booking service pages — content reference only; route to TheraMatic instead. */
export const legacyBookingServices = [
  {
    slug: 'speech-language-assessment-with-report',
    titleEn: 'Speech & Language Assessment with report',
    titleFr: 'Évaluation de la parole et du langage avec rapport',
    backupPathEn: `${backupRoot}\\booking-calendar\\speech-language-assessment-with-report.html`,
    backupPathFr: `${backupRoot}\\fr\\booking-calendar\\speech-language-assessment-with-report.html`,
  },
  {
    slug: '45-minute-virtual-slp-therapy',
    titleEn: '45 minute Virtual SLP Therapy',
    titleFr: 'Thérapie orthophonique virtuelle de 45 minutes',
    backupPathEn: `${backupRoot}\\booking-calendar\\45-minute-virtual-slp-therapy.html`,
    backupPathFr: `${backupRoot}\\fr\\booking-calendar\\45-minute-virtual-slp-therapy.html`,
  },
  {
    slug: '1-hour-virtual-slp-therapy',
    titleEn: '1 hour Virtual SLP Therapy',
    titleFr: "Thérapie orthophonique virtuelle d'une heure",
    backupPathEn: `${backupRoot}\\booking-calendar\\1-hour-virtual-slp-therapy.html`,
    backupPathFr: `${backupRoot}\\fr\\booking-calendar\\1-hour-virtual-slp-therapy.html`,
  },
  {
    slug: '45-min-virtual-therapy-with-an-assistant',
    titleEn: '45 min Virtual Therapy with an Assistant',
    titleFr: 'Thérapie virtuelle de 45 minutes avec un assistant',
    backupPathEn: `${backupRoot}\\booking-calendar\\45-min-virtual-therapy-with-an-assistant.html`,
    backupPathFr: `${backupRoot}\\fr\\booking-calendar\\45-min-virtual-therapy-with-an-assistant.html`,
  },
  {
    slug: '1-hour-virtual-therapy-with-an-assistant',
    titleEn: '1 hour Virtual Therapy with an Assistant',
    titleFr: '1 heure de thérapie virtuelle avec un assistant',
    backupPathEn: `${backupRoot}\\booking-calendar\\1-hour-virtual-therapy-with-an-assistant.html`,
    backupPathFr: `${backupRoot}\\fr\\booking-calendar\\1-hour-virtual-therapy-with-an-assistant.html`,
  },
] as const

export const migrationSummary = {
  totalContentPages: pages.length,
  pendingPages: pages.filter((page) => page.status === 'pending').length,
  imageCount: 64,
  imagePublicPath: '/images',
  backupNote:
    'HTTrack HTML is reference-only. Ignore junk files (t.html, o.html, ${s.html, etc.).',
  wixFeaturesToReplace: [
    'Online booking calendar → TheraMatic appointment request',
    'Contact form → mailto or form backend',
    'Wix CDN images → public/images/',
  ],
} as const
