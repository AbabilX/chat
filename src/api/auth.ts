import { request } from './client';
import type { AuthResponse, User } from './types';

export type SignupInput = {
  email: string;
  username: string;
  password: string;
  display_name?: string;
};

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
}

export function signup(input: SignupInput): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    auth: false,
    body: input,
  });
}

export function me(): Promise<User> {
  return request<User>('/me');
}
