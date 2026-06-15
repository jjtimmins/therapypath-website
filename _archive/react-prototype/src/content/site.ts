export const site = {
  name: 'The Therapy Path',
  tagline: 'Speech pathology clinic serving Northern Ontario',
  locale: 'en-CA',
  urls: {
    production: 'https://www.therapypath.com',
    booking: 'https://theramatic.ca/request-appointment/the-therapy-path',
  },
  contact: {
    phone: '705-363-8871',
    phoneHref: 'tel:705-363-8871',
    email: 'services@therapypath.com',
    emailHref: 'mailto:services@therapypath.com',
    address: {
      street: '117 Kay Crescent',
      city: 'Timmins',
      region: 'ON',
      postalCode: 'P4N 8A9',
      country: 'CA',
    },
  },
} as const

export const brand = {
  colors: {
    navy: '#192A88',
    blue: '#285DA1',
    blueLight: '#3D86E4',
    blueBright: '#3D9BE9',
    cream: '#F5F6F0',
    grayLight: '#D7D8D3',
    text: '#000000',
    textMuted: '#757575',
    white: '#FFFFFF',
  },
  fonts: {
    heading: '"Libre Baskerville", Georgia, "Times New Roman", serif',
    body: '"Nunito Sans", "Segoe UI", system-ui, sans-serif',
    ui: '"Nunito Sans", "Segoe UI", system-ui, sans-serif',
  },
  layout: {
    maxWidth: '980px',
  },
} as const
