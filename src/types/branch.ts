export type Branch = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  is_active: boolean;
  avg_prep_time_minutes: number;
  created_at: string;
};
