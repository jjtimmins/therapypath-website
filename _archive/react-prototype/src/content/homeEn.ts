import { imagePath } from './images'

export const homeEn = {
  meta: {
    title:
      'Speech-Language Therapy in Northern Ontario | Home | The Therapy Path',
    description:
      'The Therapy Path provides speech and language assessments, therapy, and consultations across Northern Ontario.',
  },
  hero: {
    headline: 'Your Journey to Improved Communication Starts Here',
    subheadline:
      'Covering most areas from North Bay to Hearst.',
    body: 'Together, we can pave the way for a brighter future filled with clear communication.',
    image: imagePath('AdobeStock_315113823.jpeg'),
    imageAlt: 'Happy child smiling',
  },
  assessments: {
    title: 'Comprehensive Speech and Language Assessments',
    body: 'Discover how our assessments identify strengths and guide our therapy targets.',
    image: imagePath('Assessment speech service_edited.png'),
    imageAlt: 'Speech and language assessment',
    link: '/services/assessments',
  },
  therapy: {
    title: 'Comprehensive Therapy Services',
    body: 'Discover how our tailored therapy enhances communication.',
    image: imagePath('AdobeStock_256823010.jpeg'),
    imageAlt: 'Therapy session',
    link: '/services/therapy',
  },
  servicesIntro:
    'We offer a variety of specialized services designed to address diverse communication needs:',
  serviceCards: [
    {
      title: 'Speech Therapy',
      body: 'Tailored interventions to improve articulation, fluency, and overall speech clarity.',
      link: '/services/therapy',
    },
    {
      title: 'Consultation Services',
      body: 'Professional guidance for families and educators on best practices to support communication.',
      link: '/services/consultations-workshops-reading-groups',
    },
    {
      title: 'Language Therapy',
      body: 'Support for language comprehension and expression, helping individuals communicate effectively.',
      link: '/services/therapy',
    },
    {
      title: 'Presentations',
      body: 'Educational workshops for parents, teachers, and community members on speech and language development.',
      link: '/services/consultations-workshops-reading-groups',
    },
    {
      title: 'Reading Therapy',
      body: 'A research-supported approach focusing on teaching reading fundamentals to non-readers and at-risk children, fostering a love for literacy.',
      link: '/services/consultations-workshops-reading-groups',
    },
    {
      title: 'Assistive Devices',
      body: 'Recommendations and training on the use of assistive technology to enhance communication.',
      link: '/services/therapy',
    },
  ],
  invite:
    'Whether you are seeking help for yourself or a loved one, we invite you to explore our services and discover how we can make a difference in your life.',
  bookingServices: [
    'Speech & Language Assessment with report',
    '45 minute Virtual SLP Therapy',
    '1 hour Virtual SLP Therapy',
    '45 min Virtual Therapy with an Assistant',
    '1 hour Virtual Therapy with an Assistant',
  ],
  footerBanner: {
    image: imagePath('AdobeStock_301487846.jpeg'),
    imageAlt: 'Reading a book',
  },
} as const
