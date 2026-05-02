"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import LoginClient from "@/components/features/auth/login-client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { verifyRecaptchaAction } from "@/app/actions/recaptcha-actions";

export default function LoginForm() {
  return (
    <div className="h-screen w-full grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-12 relative overflow-hidden lg:rounded-tr-[16px] lg:rounded-br-[16px] shadow-2xl z-20">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-lg">
          <div className="flex justify-center">
            <Image
              src="/images/logo-laci.webp"
              alt="Logo LACI"
              width={200}
              height={200}
              className="drop-shadow-2xl"
              style={{ height: "auto" }}
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Laci Digital IPNU IPPNU
            </h1>
            <p className="text-lg text-green-50 leading-relaxed">
              Sistem Manajemen Administrasi Digital untuk Pimpinan Anak Cabang
              IPNU & IPPNU
            </p>
          </div>
          <div className="pt-8 space-y-3 text-green-50">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-2 h-2 bg-green-200 rounded-full"></div>
              <p className="text-sm">Kelola data anggota dengan mudah</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-2 h-2 bg-green-200 rounded-full"></div>
              <p className="text-sm">Arsip surat digital yang terorganisir</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-2 h-2 bg-green-200 rounded-full"></div>
              <p className="text-sm">Monitoring aktivitas real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-start sm:items-center justify-center p-4 sm:p-8 bg-white overflow-hidden">
        <div className="w-full max-w-md space-y-4 pt-4 sm:pt-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Image
              src="/images/logo-laci.webp"
              alt="Logo LACI"
              width={60}
              height={60}
              style={{ height: "auto" }}
              priority
            />
          </div>

          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Selamat Datang
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <LoginClient />
          <LoginWithRecaptcha />

          <div className="text-center text-sm text-slate-600 pb-2">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginWithRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!executeRecaptcha) {
        toast.error("Verifikasi keamanan belum siap. Silakan refresh halaman.");
        return;
      }

      setIsLoading(true);

      try {
        // Get reCAPTCHA token
        const recaptchaToken = await executeRecaptcha("login");

        // Verify reCAPTCHA server-side
        const isHuman = await verifyRecaptchaAction(recaptchaToken);
        if (!isHuman) {
          toast.error(
            "Terdeteksi sebagai aktivitas mencurigakan (Bot). Silakan coba lagi.",
          );
          setIsLoading(false);
          return;
        }

        // Sign in with Better Auth
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          let errorMessage = "Email atau password salah.";
          if (
            error.status === 401 ||
            error.code === "INVALID_EMAIL_OR_PASSWORD"
          ) {
            errorMessage = "Email atau password salah.";
          } else if (error.code === "EMAIL_NOT_VERIFIED") {
            errorMessage =
              "Email Anda belum diverifikasi. Silakan cek inbox email Anda.";
          } else {
            errorMessage = error.message || "Terjadi kesalahan saat login.";
          }
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }

        // Proteksi Tambahan: Cek isActive setelah login berhasil
        const session = await authClient.getSession();
        if (
          session.data?.user &&
          (session.data.user as any).isActive === false
        ) {
          toast.error("Akun Anda belum diaktifkan oleh Sekretaris Cabang.");
          await authClient.signOut();
          setIsLoading(false);
          return;
        }

        // Success - Konsisten dengan Google, biarkan Dashboard yang menampilkan toast
        router.push("/dashboard?login=success");
        router.refresh();
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
        setIsLoading(false);
      }
    },
    [email, password, executeRecaptcha, router],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      name="login"
      data-form-type="login"
    >
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700"
        >
          Alamat Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail size={18} className="text-slate-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            placeholder="anda@email.com"
            autoComplete="email"
            data-lpignore="false"
            data-form-type="email"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock size={18} className="text-slate-400" />
          </div>

          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
            placeholder="Masukkan password"
            autoComplete="current-password"
            data-lpignore="false"
            data-form-type="password"
            required
            disabled={isLoading}
          />

          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all shadow-lg shadow-green-700/30 hover:shadow-xl hover:shadow-green-700/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </button>

      {/* Google Login */}
      <button
        type="button"
        onClick={async () => {
          setIsGoogleLoading(true);
          try {
            await authClient.signIn.social({
              provider: "google",
              callbackURL: `${window.location.origin}/dashboard?login=success`,
              errorCallbackURL: `${window.location.origin}/login?error=unregistered`,
            });
          } catch (err) {
            console.error("Google login error:", err);
            toast.error("Terjadi kesalahan saat login Google.");
            setIsGoogleLoading(false);
          }
        }}
        disabled={isLoading || isGoogleLoading}
        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        {isGoogleLoading ? "Menyambungkan..." : "Masuk dengan Google"}
      </button>
    </form>
  );
}
