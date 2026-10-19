import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'antifraud-portal-components-react/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social Sandbox · Antifraud demo',
  description: 'Synthetic social relying-party publication-signing demonstration.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
