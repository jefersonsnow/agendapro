import React from 'react'

export default function SEOStructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AgendarPro",
    "operatingSystem": "Web, iOS, Android",
    "applicationCategory": "BusinessApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "128"
    },
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "EUR"
    },
    "description": "Sistema para salão de elite. Software de agendamento online e gestão completa para cabeleireiros, barbearias e centros de estética.",
    "keywords": "sistema para salão, software agendamento, agenda online, gestão salão beleza"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
