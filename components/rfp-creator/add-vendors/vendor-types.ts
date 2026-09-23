/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Vendor {
  id?: string | number;
  companyName?: string;
  name?: string;
  email?: string;
  mobileNo?: string;
  phone?: string;
  category?: any;
  tags?: any;
  description?: any;
  city?: any;
  state?: any;
  country?: any;
  serviceAreas?: any;
  rating?: number;
  logoUrl?: string;
  [key: string]: any;
}
