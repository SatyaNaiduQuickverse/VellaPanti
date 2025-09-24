import type { Metadata } from 'next';

export function createMetadata({
  title,
  description,
  keywords,
  path = '',
}: {
  title: string;
  description?: string;
  keywords?: string;
  path?: string;
}): Metadata {
  const fullTitle = `${title} | VellaPanti`;
  const defaultDescription = 'VellaPanti - Premium streetwear and fashion. Discover authentic style with our curated collection of urban clothing and accessories.';
  const defaultKeywords = 'VellaPanti, streetwear, fashion, urban clothing, premium fashion, street culture, authentic style';

  return {
    title: fullTitle,
    description: description || defaultDescription,
    keywords: keywords || defaultKeywords,
    openGraph: {
      title: fullTitle,
      description: description || defaultDescription,
      siteName: 'VellaPanti',
      url: path ? `https://vellapanti.com${path}` : 'https://vellapanti.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || defaultDescription,
    },
  };
}