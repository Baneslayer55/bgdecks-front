export type SocialType = 'Telegram' | 'VK';

export interface SocialModel {
  socialType: SocialType;
  socialUrl: string;
  isVerified: boolean;
}

export interface UserProfileModel {
  id: number;
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  avatarId: string | null;
  userSocials: SocialModel[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  city?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  telegram?: string;
  vk?: string;
  city?: string;
}

export const USERNAME_PATTERN =
  /^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ0-9._]*[a-zA-Zа-яА-ЯёЁ0-9]$/;

export const PASSWORD_PATTERN = /^\S+$/;

export const TELEGRAM_PATTERN =
  /^https:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}$/;

export const VK_PATTERN = /^https:\/\/vk\.com\/[a-zA-Z0-9_.]+$/;
