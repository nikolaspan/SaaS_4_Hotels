import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Room,
  Guest,
  Booking,
  LoginCredentials,
  AuthResponse,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    this.setAccessToken(data.accessToken);
    return data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.setAccessToken(null);
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get<User>('/auth/me');
    return data;
  }

  async getUsers(): Promise<User[]> {
    const { data } = await this.client.get<User[]>('/users');
    return data;
  }

  async createUser(user: Partial<User> & { password: string }): Promise<User> {
    const { data } = await this.client.post<User>('/users', user);
    return data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data } = await this.client.put<User>(`/users/${id}`, user);
    return data;
  }

  async deactivateUser(id: string): Promise<User> {
    const { data } = await this.client.patch<User>(`/users/${id}/deactivate`);
    return data;
  }

  async getRooms(): Promise<Room[]> {
    const { data } = await this.client.get<Room[]>('/rooms');
    return data;
  }

  async createRoom(room: Partial<Room>): Promise<Room> {
    const { data } = await this.client.post<Room>('/rooms', room);
    return data;
  }

  async updateRoom(id: number, room: Partial<Room>): Promise<Room> {
    const { data } = await this.client.put<Room>(`/rooms/${id}`, room);
    return data;
  }

  async deleteRoom(id: number): Promise<void> {
    await this.client.delete(`/rooms/${id}`);
  }

  async getGuests(): Promise<Guest[]> {
    const { data } = await this.client.get<Guest[]>('/guests');
    return data;
  }

  async createGuest(guest: Partial<Guest>): Promise<Guest> {
    const { data } = await this.client.post<Guest>('/guests', guest);
    return data;
  }

  async updateGuest(id: number, guest: Partial<Guest>): Promise<Guest> {
    const { data } = await this.client.put<Guest>(`/guests/${id}`, guest);
    return data;
  }

  async deleteGuest(id: number): Promise<void> {
    await this.client.delete(`/guests/${id}`);
  }

  async getBookings(params?: {
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const { data } = await this.client.get('/bookings', { params });
    return data;
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const { data } = await this.client.post<Booking>('/bookings', booking);
    return data;
  }

  async updateBooking(id: number, booking: Partial<Booking>): Promise<Booking> {
    const { data } = await this.client.put<Booking>(`/bookings/${id}`, booking);
    return data;
  }

  async deleteBooking(id: number): Promise<void> {
    await this.client.delete(`/bookings/${id}`);
  }
}

export const apiClient = new ApiClient();
