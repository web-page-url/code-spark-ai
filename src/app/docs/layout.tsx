import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CodeSpark Documentation - AI-Powered Web Development Guide | HTML CSS JavaScript',
  description: 'Complete guide to CodeSpark, the revolutionary AI coding assistant. Learn HTML, CSS, and JavaScript generation, Accept/Reject workflow, keyboard shortcuts, and pro tips for web development.',
  keywords: [
    'CodeSpark documentation',
    'AI coding assistant',
    'web development',
    'HTML generator',
    'CSS generator', 
    'JavaScript generator',
    'AI web development',
    'code generation',
    'programming tutorial',
    'web development guide',
    'AI programming tool',
    'automated coding',
    'responsive design',
    'modern web development',
    'frontend development'
  ],
  authors: [{ name: 'Anubhav Chaudhary' }],
  creator: 'Anubhav Chaudhary',
  publisher: 'CodeSpark',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://code-spark-ai.vercel.app/'),
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'CodeSpark Documentation - Master AI-Powered Web Development',
    description: 'Learn to create professional HTML, CSS, and JavaScript code with CodeSpark\'s AI assistant. Complete guide with examples, shortcuts, and best practices.',
    url: '/docs',
    siteName: 'CodeSpark',
    images: [
      {
        url: '/og-docs.png',
        width: 1200,
        height: 630,
        alt: 'CodeSpark Documentation - AI Web Development Guide',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeSpark Docs - AI Web Development Made Easy',
    description: 'Master HTML, CSS & JavaScript generation with CodeSpark AI. Complete documentation with examples, shortcuts & pro tips.',
    images: ['/twitter-docs.png'],
    creator: '@CodeSparkAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
    yandex: 'yandex-verification-token',
    yahoo: 'yahoo-site-verification-token',
  },
  category: 'technology',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'CodeSpark Documentation - Complete AI Web Development Guide',
    description: 'Comprehensive documentation for CodeSpark, the AI-powered web development platform that generates professional HTML, CSS, and JavaScript code.',
    image: 'https://code-spark-ai.vercel.app//og-docs.png',
    author: {
      '@type': 'Person',
      name: 'Anubhav Chaudhary',
      url: 'https://code-spark-ai.vercel.app/',
      jobTitle: 'Software Engineer',
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Indian Institute of Technology, Mandi'
      }
    },
    publisher: {
      '@type': 'Organization',
      name: 'CodeSpark',
      logo: {
        '@type': 'ImageObject',
        url: 'https://code-spark-ai.vercel.app//logo.png'
      }
    },
    datePublished: '2025-01-02',
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://code-spark-ai.vercel.app//docs'
    },
    articleSection: 'Technology',
    keywords: 'AI coding, web development, HTML generator, CSS generator, JavaScript generator, programming tutorial',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: 'web developers, programmers, students'
    },
    educationalLevel: 'beginner to advanced',
    learningResourceType: 'documentation',
    teaches: [
      'AI-powered code generation',
      'HTML development with AI',
      'CSS styling automation', 
      'JavaScript programming assistance',
      'Web development best practices',
      'Code review workflows'
    ]
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://code-spark-ai.vercel.app/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Documentation',
        item: 'https://code-spark-ai.vercel.app//docs'
      }
    ]
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is CodeSpark?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CodeSpark is an AI-powered web development platform that generates professional HTML, CSS, and JavaScript code from natural language descriptions.'
        }
      },
      {
        '@type': 'Question', 
        name: 'How do I use the Accept/Reject workflow?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After AI generates code, review the changes in the diff viewer and press Enter to accept, Esc to reject, or use the Append button to add code instead of replacing.'
        }
      },
      {
        '@type': 'Question',
        name: 'What programming languages does CodeSpark support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CodeSpark specializes in web technologies: HTML5, CSS3, and modern JavaScript (ES6+). It generates semantic, accessible, and responsive code.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are there keyboard shortcuts available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Key shortcuts include Enter (accept changes), Esc (reject), Ctrl+R (force replace), Ctrl+A (force append), Ctrl+B (toggle sidebar), and Ctrl+S (save).'
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Performance & Security */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self';" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/css/critical.css" as="style" />
        
        {/* Prefetch Resources */}
        <link rel="prefetch" href="/" />
        <link rel="prefetch" href="/api/chat" />
        
        {/* Icons & Manifest */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Canonical & Hreflang */}
        <link rel="canonical" href="https://code-spark-ai.vercel.app//docs" />
        <link rel="alternate" hrefLang="en" href="https://code-spark-ai.vercel.app//docs" />
        <link rel="alternate" hrefLang="x-default" href="https://code-spark-ai.vercel.app//docs" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
} 