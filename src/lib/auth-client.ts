import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "https://laci.pelajarnumagetan.or.id",
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
