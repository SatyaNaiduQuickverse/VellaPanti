'use client';

import { useState, useEffect } from 'react';

interface StoryPageData {
  heroTitle: string;
  heroSubtitle: string;
  section1Title: string;
  section1Content: string;
  section1Quote: string | null;
  section2Title: string;
  section2Content: string;
  section3Title: string;
  section3Content: string;
  section4Title: string;
  section4Content: string;
  manifestoTitle: string;
  manifestoContent: string;
}

export default function StoryPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<StoryPageData | null>(null);

  useEffect(() => {
    fetchStoryPage();
  }, []);

  const fetchStoryPage = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/story-page`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setContent(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch story page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl font-bold">Failed to load content</p>
      </div>
    );
  }

  // Split content into paragraphs for proper rendering
  const renderParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 mb-6" style={{ lineHeight: '1.9' }}>
        {paragraph}
      </p>
    ));
  };

  // Split manifesto content into lines
  const manifestoLines = content.manifestoContent.split('\n').filter(line => line.trim());

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-center mb-6 tracking-wider">
            {content.heroTitle}
          </h1>
          <div className="w-32 h-1 bg-white mx-auto"></div>
          <p className="text-base sm:text-lg md:text-xl text-center mt-8 tracking-wide font-bold text-gray-300">
            {content.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">

          {/* Section 1 - The Beginning */}
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-8 tracking-wider uppercase text-black">
              {content.section1Title}
            </h2>
            {renderParagraphs(content.section1Content)}

            {content.section1Quote && (
              <div className="my-10 p-4 sm:p-6 md:p-8 border-l-4 border-black bg-gray-50 text-gray-800 italic">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ lineHeight: '1.8' }}>
                  {content.section1Quote}
                </p>
              </div>
            )}
          </div>

          {/* Section 2 - The Revelation */}
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-8 tracking-wider uppercase text-black">
              {content.section2Title}
            </h2>
            {renderParagraphs(content.section2Content)}
          </div>

          {/* Section 3 - What is Vellapanti */}
          <div className="mb-16 p-6 sm:p-8 md:p-10 bg-black text-white rounded-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 tracking-wider uppercase text-center">
              {content.section3Title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-300" style={{ lineHeight: '1.9' }}>
              {content.section3Content}
            </p>
          </div>

          {/* Section 4 - Our Mission */}
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-8 tracking-wider uppercase text-black">
              {content.section4Title}
            </h2>
            {renderParagraphs(content.section4Content)}
          </div>

          {/* Manifesto */}
          <div className="my-16 p-6 sm:p-8 md:p-12 lg:p-16 text-center bg-black text-white shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-6 tracking-wider uppercase">
              {content.manifestoTitle}
            </h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-wider leading-tight">
              {manifestoLines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < manifestoLines.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
