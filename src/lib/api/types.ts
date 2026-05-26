// Mirror of klova-api enums and key DTOs.
// Keep in sync with backend prisma/schema.prisma.

export type Role = 'executor' | 'customer' | 'both';
export type Locale = 'ru' | 'kk' | 'en';
export type TaxStatus =
  | 'physical'
  | 'ip_simple'
  | 'ip_general'
  | 'too_simple'
  | 'too_general';
export type OrderStatus = 'open' | 'cancelled';
export type ResponseStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type DealStatus =
  | 'escrow_held'
  | 'in_work'
  | 'review'
  | 'completed'
  | 'disputed'
  | 'refunded';
export type TransactionType =
  | 'payment_in'
  | 'payout'
  | 'refund'
  | 'commission_klova'
  | 'commission_provider';
export type TransactionStatus = 'pending' | 'held' | 'released' | 'failed';
export type DisputeStatus = 'open' | 'bot_review' | 'human_review' | 'resolved';
export type DisputeResolution = 'in_favor_customer' | 'in_favor_executor' | 'split';
export type NotificationType =
  | 'profile_incomplete'
  | 'new_response'
  | 'deal_status_changed'
  | 'dispute_update'
  | 'message';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; role: Role; locale: Locale };
}

export interface User {
  id: string;
  email?: string;
  phone?: string | null;
  name: string;
  city_id?: string | null;
  role: Role;
  bio?: string | null;
  avatar_url?: string | null;
  tax_status: TaxStatus;
  locale: Locale;
  verified: boolean;
  rating: number;
  created_at: string;
  email_verified_at?: string | null;
  has_password?: boolean;
  has_google?: boolean;
  categories?: Array<{ category: Category }>;
}

export interface Session {
  id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  expires_at: string;
}

export interface Message {
  id: string;
  deal_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: string; name: string; avatar_url: string | null };
}

export interface Country {
  id: string;
  code: string;
  name: string;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface PartyMini {
  id: string;
  name: string;
  avatar_url?: string | null;
  rating: number;
  verified?: boolean;
  city_id?: string | null;
}

export interface Order {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  budget: string;
  deadline: string | null;
  status: OrderStatus;
  created_at: string;
  customer?: PartyMini;
  categories?: Array<{ category: Category }>;
  _count?: { responses: number };
}

export interface Response {
  id: string;
  order_id: string;
  executor_id: string;
  cover_letter: string | null;
  proposed_price: string;
  status: ResponseStatus;
  created_at: string;
  executor?: PartyMini;
}

export interface Transaction {
  id: string;
  deal_id: string;
  type: TransactionType;
  amount: string;
  provider_ref: string | null;
  fiscal_receipt_url: string | null;
  status: TransactionStatus;
  created_at: string;
}

export interface TaxRecord {
  id: string;
  deal_id: string;
  user_id: string;
  income: string;
  applied_status: TaxStatus;
  tax_amount: string;
  osms_amount: string;
  opv_amount: string;
  recommended_aside: string;
  calculated_at: string;
}

export interface Deal {
  id: string;
  order_id: string;
  customer_id: string;
  executor_id: string;
  amount: string;
  status: DealStatus;
  created_at: string;
  completed_at: string | null;
  order?: { id: string; title: string; description: string };
  customer?: PartyMini;
  executor?: PartyMini;
  transactions?: Transaction[];
  tax_record?: TaxRecord | null;
  dispute?: { id: string; status: DisputeStatus; resolution: DisputeResolution | null } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  media_url: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  likes_count: number;
  created_at: string;
  user?: PartyMini;
}
