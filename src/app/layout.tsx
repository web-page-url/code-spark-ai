import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: {
    template: '%s | CodeSpark - AI Web Development Platform',
    default: 'CodeSpark - Revolutionary AI-Powered Web Development Platform',
  },
  description: 'Create professional HTML, CSS, and JavaScript code with CodeSpark\'s AI assistant. Revolutionary web development platform by Anubhav Chaudhary, IIT Mandi. Generate, edit, and optimize code instantly.',
  keywords: [
    'AI coding assistant',
    'web development',
    'HTML generator',
    'CSS generator', 
    'JavaScript generator',
    'CodeSpark',
    'AI web development',
    'code generation',
    'Anubhav Chaudhary',
    'IIT Mandi',
    'programming assistant',
    'automated coding',
    'responsive design',
    'modern web development'
  ],
  authors: [{ name: 'Anubhav Chaudhary', url: 'https://code-spark-ai.vercel.app/' }],
  creator: 'Anubhav Chaudhary',
  publisher: 'CodeSpark',
  applicationName: 'CodeSpark',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://code-spark-ai.vercel.app/',
    siteName: 'CodeSpark',
    title: 'CodeSpark - Revolutionary AI Web Development Platform',
    description: 'Transform ideas into professional web code instantly. AI-powered HTML, CSS & JavaScript generation with real-time preview and professional workflows.',
    images: [
      {
        url: 'https://code-spark-ai.vercel.app/code-spark-1.png',
        width: 1200,
        height: 630,
        alt: 'CodeSpark - AI Web Development Platform',
        type: 'image/png',
      },
      {
        url: 'https://code-spark-ai.vercel.app/code-spark-1.png',
        width: 1080,
        height: 1080,
        alt: 'CodeSpark - AI Coding Assistant',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CodeSparkAI',
    creator: '@AnubhavCodes',
    title: 'CodeSpark - AI Web Development Made Easy',
    description: 'Revolutionary AI platform for generating professional HTML, CSS & JavaScript. Built by Anubhav Chaudhary, IIT Mandi.',
    images: ['https://code-spark-ai.vercel.app/code-spark-1.png'],
  },
  verification: {
    google: 'google-site-verification-token',
    yandex: 'yandex-verification-token',
    yahoo: 'yahoo-site-verification-token',
    other: {
      'msvalidate.01': 'bing-verification-token',
    },
  },
  category: 'technology',
  classification: 'Business',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'CodeSpark',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CodeSpark',
    description: 'Revolutionary AI-powered web development platform that generates professional HTML, CSS, and JavaScript code',
    url: 'https://code-spark-ai.vercel.app/',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    permissions: 'no special permissions required',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Anubhav Chaudhary',
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
        url: 'https://code-spark-ai.vercel.app/code-spark-1.png'
      }
    },
    datePublished: '2025-01-02',
    dateModified: new Date().toISOString(),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    featureList: [
      'AI-powered HTML generation',
      'CSS styling automation',
      'JavaScript code generation', 
      'Real-time code preview',
      'Accept/Reject workflow',
      'Keyboard shortcuts',
      'Responsive design support'
    ]
  };

  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CodeSpark" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/code-spark-1.png" />
        
        {/* Prefetch next pages */}
        <link rel="prefetch" href="/docs" />
        
        {/* Favicons - Multiple formats for compatibility */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional favicon fallbacks */}
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Enhanced Social Media Meta Tags */}
        <meta property="og:image:secure_url" content="https://code-spark-ai.vercel.app/code-spark-1.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:video" content="" />
        <meta property="og:audio" content="" />
        <meta property="og:determiner" content="the" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="es_ES" />
        
        {/* Twitter Enhanced */}
        <meta name="twitter:image" content="https://code-spark-ai.vercel.app/code-spark-1.png" />
        <meta name="twitter:image:alt" content="CodeSpark - AI Web Development Platform" />
        <meta name="twitter:player" content="" />
        <meta name="twitter:player:width" content="1200" />
        <meta name="twitter:player:height" content="630" />
        
        {/* Instagram/Facebook App Links */}
        <meta property="al:web:url" content="https://code-spark-ai.vercel.app/" />
        <meta property="al:ios:url" content="https://code-spark-ai.vercel.app/" />
        <meta property="al:android:url" content="https://code-spark-ai.vercel.app/" />
        <meta property="al:ios:app_store_id" content="" />
        <meta property="al:android:package" content="" />
        <meta property="al:android:app_name" content="CodeSpark" />
        <meta property="al:ios:app_name" content="CodeSpark" />
        
        {/* WhatsApp Rich Preview */}
        <meta property="og:rich_attachment" content="true" />
        <meta property="og:see_also" content="https://code-spark-ai.vercel.app/docs" />
        
        {/* LinkedIn Article Tags */}
        <meta property="article:author" content="https://linkedin.com/in/anubhav-chaudhary" />
        <meta property="article:publisher" content="https://code-spark-ai.vercel.app/" />
        <meta property="article:tag" content="AI" />
        <meta property="article:tag" content="Web Development" />
        <meta property="article:tag" content="Coding Assistant" />
        <meta property="article:tag" content="HTML" />
        <meta property="article:tag" content="CSS" />
        <meta property="article:tag" content="JavaScript" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <noscript>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#1f2937', 
            color: '#f9fafb' 
          }}>
            CodeSpark requires JavaScript to function properly. Please enable JavaScript in your browser.
          </div>
        </noscript>
          {children}
      </body>
    </html>
  );
} 