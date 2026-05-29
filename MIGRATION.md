# StayLens — React → Next.js Migration Guide

## Kya kya badla? (What changed?)

### 1. Routing
| React (react-router-dom) | Next.js (App Router) |
|--------------------------|----------------------|
| `<BrowserRouter>` | App Router (automatic) |
| `<Route path="/hotels">` | `app/hotels/page.tsx` |
| `<Route path="/hotels/:id">` | `app/hotels/[hotelId]/page.tsx` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useParams()` | `useParams()` from `next/navigation` |
| `useSearchParams()` | `useSearchParams()` from `next/navigation` |
| `<Link to="/...">` | `<Link href="/...">` from `next/link` |
| `<Navigate to="..." />` | `router.replace("...")` in useEffect |

### 2. File Structure
```
REACT:                          NEXT.JS:
src/pages/HomePage.tsx    →     app/page.tsx
src/pages/HotelsListPage  →     app/hotels/page.tsx
src/pages/HotelDetailPage →     app/hotels/[hotelId]/page.tsx
src/pages/LoginPage.tsx   →     app/login/page.tsx
src/pages/OnboardingPage  →     app/onboarding/page.tsx
src/pages/ProfilePage.tsx →     app/profile/page.tsx
src/App.tsx               →     app/layout.tsx
```

### 3. Client Components
Next.js mein **har interactive component ke upar** `"use client"` likhna padta hai:
```tsx
"use client";   // ← ye add karo agar useState/useEffect use ho
import { useState } from "react";
```

### 4. Suspense Boundaries
`useSearchParams()` ke liye **Suspense wrap** zaroori hai Next.js mein:
```tsx
export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Content />   {/* useSearchParams yahan use karo */}
    </Suspense>
  );
}
```

### 5. Import Paths
`@/` alias use karo relative paths ki jagah:
```tsx
// Pehle (React):
import { SiteNav } from "./../components/SiteNav";

// Ab (Next.js):
import { SiteNav } from "@/components/SiteNav";
```

---

## Setup karo

```bash
# 1. Dependencies install karo
npm install

# 2. Apni lib/hotels.ts aur lib/onboarding.ts copy karo

# 3. globals.css copy karo → app/globals.css mein

# 4. Dev server chalao
npm run dev
```

## Baaki files jo tumhe khud copy karni hain
- `lib/hotels.ts` (tumhara existing file)
- `lib/onboarding.ts` (tumhara existing file)
- `app/globals.css` (tumhara existing CSS)
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/not-found.tsx` (404 page)

## ProfilePage mein ek fix
`user.id` → `user.uid` (Firebase User object mein `uid` hota hai, `id` nahi):
```tsx
// Pehle:
<div>{user.id}</div>
// Ab:
<div>{user.uid}</div>
```
