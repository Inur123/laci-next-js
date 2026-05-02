import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const PRODUCTION_DOMAIN = "https://laci.pelajarnumagetan.or.id";

export const authClient = createAuthClient({
  baseURL: PRODUCTION_DOMAIN,
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      isActive: {
        type: "boolean",
      },
      periodeAktifId: {
        type: "string",
      },
    },
  },
  plugins: [emailOTPClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
