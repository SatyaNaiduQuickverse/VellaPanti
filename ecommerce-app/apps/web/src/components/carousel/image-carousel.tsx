'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  centerTitle?: string;
  centerDescription?: string;
  bottomLeftTitle?: string;
  bottomLeftDescription?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoSlide?: boolean;
  slideInterval?: number;
  className?: string;
  theme?: 'black' | 'white';
  showOverlay?: boolean;
}

export function ImageCarousel({
  images,
  autoSlide = true,
  slideInterval = 5000,
  className = '',
  theme = 'black',
  showOverlay = false
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, images.length, slideInterval]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={`relative w-full h-full ${theme === 'black' ? 'bg-black' : 'bg-white'} flex items-center justify-center ${className}`}>
        <p className={`font-bold uppercase tracking-wide ${theme === 'black' ? 'text-white' : 'text-black'}`}>
          No Images Available
        </p>
      </div>
    );
  }

  const textColor = theme === 'black' ? 'text-white' : 'text-black';
  const bgColor = theme === 'black' ? 'bg-black' : 'bg-white';
  const buttonBg = theme === 'black' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30';
  const indicatorBg = theme === 'black' ? 'bg-white/30' : 'bg-black/30';
  const indicatorActiveBg = theme === 'black' ? 'bg-white' : 'bg-black';

  return (
    <div className={`relative w-full h-full overflow-hidden ${bgColor} ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            console.error('Image failed to load:', images[currentIndex].src);
            // Hide broken image
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Overlay for text readability */}
        {showOverlay && <div className="absolute inset-0 bg-black/30" />}

        {/* Center Text Overlay */}
        {(images[currentIndex].centerTitle || images[currentIndex].centerDescription) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 sm:px-6 md:px-8">
              {images[currentIndex].centerTitle && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-black mb-2 sm:mb-3 md:mb-4 uppercase tracking-wider">
                  {images[currentIndex].centerTitle}
                </h2>
              )}
              {images[currentIndex].centerDescription && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wider">
                  {images[currentIndex].centerDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Left Text Overlay */}
        {(images[currentIndex].bottomLeftTitle || images[currentIndex].bottomLeftDescription) && (
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
            {images[currentIndex].bottomLeftTitle && (
              <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-1 sm:mb-2 uppercase tracking-wide">
                {images[currentIndex].bottomLeftTitle}
              </h3>
            )}
            {images[currentIndex].bottomLeftDescription && (
              <p className="text-white/90 text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide">
                {images[currentIndex].bottomLeftDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${buttonBg} ${textColor} transition-all hover:scale-110`}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${buttonBg} ${textColor} transition-all hover:scale-110`}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? indicatorActiveBg : indicatorBg
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}