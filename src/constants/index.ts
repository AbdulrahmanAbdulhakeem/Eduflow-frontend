export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROLES = {
  ADMIN: 'ADMIN',
  LECTURER: 'LECTURER',
  STUDENT: 'STUDENT',
} as const;

export const APP_NAME = "Eduflow";