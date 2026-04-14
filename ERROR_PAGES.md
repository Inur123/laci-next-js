# 🎨 Error Pages Documentation

Error pages dengan design modern seperti gambar referensi yang Anda kirim.

## 📁 File Structure

```
src/
├── app/
│   ├── not-found.tsx          # 404 - Page Not Found
│   ├── error.tsx              # 500 - Server Error
│   ├── forbidden/
│   │   └── page.tsx           # 403 - Forbidden
│   └── unauthorized/
│       └── page.tsx           # 401 - Unauthorized
└── components/
    └── errors/
        └── error-page.tsx     # Reusable Error Component
```

## 🎯 Built-in Error Pages

### 1. **404 - Not Found** (`/not-found.tsx`)

Otomatis muncul ketika user mengakses halaman yang tidak ada.

**URL Test:** `http://localhost:3000/halaman-tidak-ada`

### 2. **500 - Server Error** (`/error.tsx`)

Otomatis muncul ketika ada error di server/runtime.

**Features:**

- Tombol "Try Again" untuk retry
- Tombol "Back to Home"
- Menampilkan error message

### 3. **403 - Forbidden** (`/forbidden/page.tsx`)

Untuk halaman yang user tidak punya akses.

**URL:** `http://localhost:3000/forbidden`

### 4. **401 - Unauthorized** (`/unauthorized/page.tsx`)

Untuk halaman yang butuh login.

**URL:** `http://localhost:3000/unauthorized`

---

## 🛠️ Cara Menggunakan Reusable Component

Untuk membuat error page custom lainnya, gunakan component `ErrorPage`:

```tsx
import { ErrorPage } from "@/components/errors/error-page";
import { Shield } from "lucide-react";

export default function CustomError() {
  return (
    <ErrorPage
      code="418" // Error code (bisa 3 digit atau lebih)
      title="ERROR" // Title besar di atas
      message="I'm a teapot" // Pesan error
      actionButton={{
        // Optional: tombol action
        label: "Go Back",
        href: "/dashboard",
        icon: Shield,
      }}
      showHomeButton={true} // Optional: tampilkan tombol home (default: true)
    />
  );
}
```

---

## 🎨 Design Features

✅ **Font:** Bold, modern, geometric (menggunakan font default dari project)
✅ **Emoji-style numbers:** Angka tengah punya "wajah" lucu
✅ **Responsive:** Mobile-friendly
✅ **Smooth animations:** Hover effects pada tombol
✅ **Gradient background:** Subtle gray gradient
✅ **Customizable:** Mudah diubah warna dan style

---

## 🔧 Customization

### Mengubah Warna

Edit di component, ganti `blue-600` dengan warna lain:

```tsx
// Dari:
className = "text-blue-600";

// Jadi (contoh: merah):
className = "text-red-600";
```

### Mengubah Font

Font sudah otomatis menggunakan font dari `layout.tsx`:

- **Geist Sans** (default)
- **Outfit** (untuk bold text)

Untuk mengubah, tambahkan class `font-outfit`:

```tsx
<h1 className="font-outfit text-9xl font-black">ERROR</h1>
```

---

## 📝 Redirect ke Error Page

### Dari Server Component:

```tsx
import { redirect } from "next/navigation";

// Redirect ke 403
redirect("/forbidden");

// Redirect ke 401
redirect("/unauthorized");
```

### Dari Client Component:

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function MyComponent() {
  const router = useRouter();

  // Redirect ke error page
  router.push("/forbidden");
}
```

### Throw Error (akan trigger error.tsx):

```tsx
// Di server component
throw new Error("Something went wrong!");
```

---

## 🧪 Testing

Buka URL berikut untuk test:

- **404:** `http://localhost:3000/random-page-404`
- **403:** `http://localhost:3000/forbidden`
- **401:** `http://localhost:3000/unauthorized`
- **500:** Trigger dengan throw error di component

---

## 🎯 Next Steps

1. ✅ Customize warna sesuai brand
2. ✅ Tambah error pages lain (429, 503, dll)
3. ✅ Tambah analytics tracking untuk error pages
4. ✅ Tambah "Report Problem" button

---

**Enjoy your beautiful error pages! 🎉**
