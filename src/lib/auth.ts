import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import prisma from "./prisma";
import { sendVerificationEmail } from "./email";
import { createLogManual } from "./log-activity";
import { LogAction, LogModule } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Redirect error autentikasi ke halaman login
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Izinkan auto-link akun jika email Google cocok dengan akun yang sudah terdaftar
  account: {
    autoLink: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Izinkan proxy (Nginx/Cloudflare)
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "ipnu-laci", 
  },
  
  // SANGAT PENTING untuk Production di balik Proxy VPS
  trustHost: true,

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Google OAuth — hanya sebagai shortcut login, bukan registrasi
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Custom User Fields Mapping for Better Auth
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
      lastLogoutAt: {
        type: "date",
      },
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Hapus OTP lama di background (JANGAN await)
        prisma.verification.deleteMany({
          where: { 
            identifier: email,
            value: { not: otp }
          },
        }).catch((e) => {
          console.error(`[Better Auth] Failed to delete old verification records:`, e);
        });

        // Cari nama user di background, lalu kirim email
        // Tidak perlu menunggu nama — langsung kirim dengan fallback
        (async () => {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
              select: { name: true },
            });
            const name = user?.name || "Rekan/Rekanita";

            if (type === "email-verification") {
              sendVerificationEmail(email, name, otp).catch((err) => {
                console.error(`[Better Auth] Background OTP email failed:`, err);
              });
            }
          } catch (err) {
            console.error(`[Better Auth] OTP send flow error:`, err);
          }
        })();
      },
      otpLength: 6,
      expiresIn: 60 * 5,
      rateLimit: {
        window: 60,
        max: 10,
      },
    }),
  ],

  // DB Hooks for reliable auditing
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Bypass saat seeding database
          if (process.env.SEEDING === "true") return;

          // Jika emailVerified=true, ini adalah social login (Google langsung verified).
          // Pendaftaran manual selalu emailVerified=false (harus OTP dulu).
          if (user.emailVerified !== true) return;

          // Cek apakah email sudah pernah didaftarkan secara manual
          const exists = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });

          if (!exists) {
            console.warn(`[Auth] BLOCKED: Social login "${user.email}" — belum terdaftar.`);
            throw new Error("UNREGISTERED_EMAIL");
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // FIRE AND FORGET: Do not await logging in serverless environment to speed up response
          (async () => {
            try {
              const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { name: true, email: true },
              });
              
              await createLogManual(
                session.userId,
                "LOGIN" as LogAction,
                "AUTH" as LogModule,
                `User login ke sistem: ${user?.name || user?.email || "Unknown"}`,
              );
            } catch (err) {
              console.error("[Auth Hook] Background Login log failed:", err);
            }
          })();
        },
      },
      delete: {
        after: async (session) => {
          const userId = (session as any)?.userId;
          if (!userId) return;

          // FIRE AND FORGET: Do not await logout logging
          (async () => {
            try {
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true },
              });

              // Serial background tasks
              await createLogManual(
                userId,
                "LOGOUT" as LogAction,
                "AUTH" as LogModule,
                `User logout dari sistem: ${user?.name || "Unknown"}`,
              );
              
              await prisma.user.update({
                where: { id: userId },
                data: { lastLogoutAt: new Date() },
              });
            } catch (err) {
              console.error("[Auth Hook] Background Logout task failed:", err);
            }
          })();
        },
      },
    },
  },

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // Trust proxy for production
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),

  // Base URL harus absolut
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Session = typeof auth.$Infer.Session;
