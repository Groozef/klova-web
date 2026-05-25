import useSWR from 'swr';
import { apiFetcher } from './client';
import type {
  Category,
  City,
  Country,
  Deal,
  Notification,
  Order,
  Portfolio,
  Post,
  Response,
  TaxRecord,
  Transaction,
  User,
} from './types';

export function useMe() {
  return useSWR<User>('/users/me', apiFetcher);
}

export function useUser(id: string | null) {
  return useSWR<User>(id ? `/users/${id}` : null, apiFetcher);
}

export function useCountries() {
  return useSWR<Country[]>('/countries', apiFetcher);
}

export function useCities(countryId?: string | null) {
  return useSWR<City[]>(countryId ? `/cities?country_id=${countryId}` : '/cities', apiFetcher);
}

export function useCategories() {
  return useSWR<Category[]>('/categories', apiFetcher);
}

export function useOrders(params?: { city_id?: string; category_id?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.city_id) qs.set('city_id', params.city_id);
  if (params?.category_id) qs.set('category_id', params.category_id);
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString();
  return useSWR<Order[]>(`/orders${query ? '?' + query : ''}`, apiFetcher);
}

export function useOrder(id: string | null) {
  return useSWR<Order>(id ? `/orders/${id}` : null, apiFetcher);
}

export function useRecommendedOrders() {
  return useSWR<Order[]>('/orders/recommended', apiFetcher);
}

export function useOrderResponses(orderId: string | null) {
  return useSWR<Response[]>(orderId ? `/orders/${orderId}/responses` : null, apiFetcher);
}

export function useDeals(role?: 'customer' | 'executor') {
  const qs = role ? `?role=${role}` : '';
  return useSWR<Deal[]>(`/deals${qs}`, apiFetcher);
}

export function useDeal(id: string | null) {
  return useSWR<Deal>(id ? `/deals/${id}` : null, apiFetcher);
}

export function useDealTransactions(id: string | null) {
  return useSWR<Transaction[]>(id ? `/deals/${id}/transactions` : null, apiFetcher);
}

export function useTaxRecords() {
  return useSWR<Array<TaxRecord & { deal?: { order?: { title: string } } }>>('/tax/records', apiFetcher);
}

export function useTaxSummary(from?: string, to?: string) {
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const query = qs.toString();
  return useSWR<{
    count: number;
    income_total: number;
    tax_total: number;
    osms_total: number;
    opv_total: number;
    recommended_aside_total: number;
  }>(`/tax/summary${query ? '?' + query : ''}`, apiFetcher);
}

export function useNotifications() {
  return useSWR<Notification[]>('/notifications', apiFetcher, { refreshInterval: 30_000 });
}

export function useUnreadNotifications() {
  const { data } = useSWR<{ count: number }>('/notifications/unread-count', apiFetcher, {
    refreshInterval: 30_000,
  });
  return { count: data?.count ?? 0 };
}

export function useUserPortfolio(userId: string | null) {
  return useSWR<Portfolio[]>(userId ? `/users/${userId}/portfolio` : null, apiFetcher);
}

export function useFeed() {
  return useSWR<Post[]>('/posts', apiFetcher);
}
