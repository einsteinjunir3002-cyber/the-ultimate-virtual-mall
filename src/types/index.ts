import { Role, ShopStatus, TemplateStyle, ProductStatus, FulfillmentStatus, PaymentStatus } from '@prisma/client';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  shopId: string;
  shopName: string;
  shopSlug: string;
  shopDeliveryFee: number;
}

export interface GroupedShopCart {
  shopId: string;
  shopName: string;
  shopSlug: string;
  deliveryFee: number;
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  alternativePhone?: string;
  region: string; // e.g. Greater Accra, Ashanti, Western, etc.
  city: string; // e.g. Accra, Kumasi, Takoradi
  streetAddress: string;
  digitalAddress?: string; // GhanaPost GPS (e.g. GA-123-4567)
  deliveryNotes?: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  shop?: {
    id: string;
    name: string;
    slug: string;
    status: ShopStatus;
  } | null;
}
