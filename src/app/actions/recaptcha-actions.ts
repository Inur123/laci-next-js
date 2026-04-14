"use server";

import { verifyRecaptcha as verifyRecaptchaLib } from "@/lib/recaptcha";

export async function verifyRecaptchaAction(token: string): Promise<boolean> {
  return await verifyRecaptchaLib(token);
}
