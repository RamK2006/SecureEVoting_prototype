export interface RegisterRequest {
  nationalId: string;
  password: string;
  constituencyId: string;
  biometricData?: string;
}

export interface RegisterResponse {
  success: boolean;
  voterHash: string;
  voterAddress: string;
  message: string;
}

export interface LoginRequest {
  nationalId: string;
  password: string;
  otp?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  expiresIn: number;
  message: string;
}

export interface TokenResponse {
  token: string;
  expiresIn: number;
}

export interface OTPRequest {
  nationalId: string;
  otp: string;
}

export interface AuthCredentials {
  id: string;
  voterHash: string;
  passwordHash: string;
  otpSecret?: string;
  lastLogin?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
}

export interface JWTPayload {
  voterHash: string;
  constituencyId: string;
  iat: number;
  exp: number;
}

export interface SecurityReport {
  isRooted: boolean;
  isJailbroken: boolean;
  deviceIntegrityValid: boolean;
  warnings: string[];
}
