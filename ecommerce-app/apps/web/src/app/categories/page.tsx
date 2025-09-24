'use client';

import { useSearchParams } from 'next/navigation';
import { CategoryGrid } from '@/components/categories/category-grid';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') as 'BLACK' | 'WHITE' | null;
  const { data: categoriesData, isLoading } = useCategories(theme);

  const getThemeStyles = () => {
    if (theme === 'BLACK') {
      return {
        bg: 'bg-black',
        text: 'text-white',
        accent: 'text-white',
        border: 'border-white',
        button: 'bg-white text-black hover:bg-gray-200'
      };
    } else if (theme === 'WHITE') {
      return {
        bg: 'bg-white',
        text: 'text-black',
        accent: 'text-black',
        border: 'border-black',
        button: 'bg-black text-white hover:bg-gray-800'
      };
    } else {
      return {
        bg: 'bg-gray-50',
        text: 'text-black',
        accent: 'text-black',
        border: 'border-black',
        button: 'bg-black text-white hover:bg-gray-800'
      };
    }
  };

  const styles = getThemeStyles();

  const getTitle = () => {
    if (theme === 'BLACK') return 'BLACK COLLECTIONS';
    if (theme === 'WHITE') return 'WHITE COLLECTIONS';
    return 'ALL COLLECTIONS';
  };

  const getSubtitle = () => {
    if (theme === 'BLACK') return 'STREET • CULTURE • UNDERGROUND';
    if (theme === 'WHITE') return 'CLEAN • MINIMAL • PREMIUM';
    return 'DISCOVER YOUR STYLE';
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight`}>
            <span className={`border-b-4 ${styles.border} pb-2`}>{getTitle()}</span>
          </h1>
          <p className={`text-lg font-bold uppercase tracking-wide ${styles.text}`}>
            {getSubtitle()}
          </p>
        </div>

        {/* Category Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className={`${theme === 'BLACK' ? 'bg-gray-700' : 'bg-gray-200'} aspect-[3/4] border-2 ${styles.border} rounded-lg`}></div>
              </div>
            ))}
          </div>
        ) : (
          <CategoryGrid theme={theme} />
        )}
      </div>
    </div>
  );
}