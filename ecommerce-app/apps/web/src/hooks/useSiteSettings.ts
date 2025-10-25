import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SiteSettings {
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  support_email: string;
  support_phone: string;
  business_hours: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data as { success: boolean; data: SiteSettings };
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
}
