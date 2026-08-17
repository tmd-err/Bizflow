import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/auth";
import type {
  SendEmailCodeFormData,
  UpdatePasswordFormData,
  UpdateProfileFormData,
} from "@/app/features/profile/schemas";

export interface ProfileResponse {
  user: AuthUser;
}

export interface UpdateProfileResponse {
  message: string;
  user: AuthUser;
}

export interface UpdatePasswordResponse {
  message: string;
}

export async function getProfileRequest() {
  return apiGet<ProfileResponse>("/api/profile");
}

export async function sendEmailVerificationCodeRequest(
  data: SendEmailCodeFormData
) {
  return apiPost<{ message: string }>("/api/profile/email/send-code", data);
}

export async function updateProfileRequest(
  data: UpdateProfileFormData,
  options?: { emailChanged?: boolean }
) {
  const payload: Record<string, string> = {
    name: data.name,
    email: data.email,
  };

  if (options?.emailChanged && data.email_verification_code) {
    payload.email_verification_code = data.email_verification_code;
  }

  return apiPatch<UpdateProfileResponse>("/api/profile", payload);
}

export async function updatePasswordRequest(data: UpdatePasswordFormData) {
  return apiPut<UpdatePasswordResponse>("/api/profile/password", data);
}
