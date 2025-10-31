import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SiteSettings {
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  support_email: string;
  support_phone: string;
  business_hours: string;
}

// API response uses camelCase
interface SiteSettingsApiResponse {
  whatsappNumber: string;
  whatsappEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      const apiData = response.data.data as SiteSettingsApiResponse;

      // Transform camelCase to snake_case for frontend consistency
      const transformedData: SiteSettings = {
        whatsapp_number: apiData.whatsappNumber || '',
        whatsapp_enabled: apiData.whatsappEnabled || false,
        support_email: apiData.supportEmail || '',
        support_phone: apiData.supportPhone || '',
        business_hours: apiData.businessHours || '',
      };

      return { success: response.data.success, data: transformedData };
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
}
