# StayLens - Next.js App Structure

```
staylens/
├── app/
│   ├── layout.tsx              ← Root layout (replaces App.tsx BrowserRouter)
│   ├── page.tsx                ← HomePage (/)
│   ├── globals.css             ← Your existing CSS
│   ├── hotels/
│   │   ├── page.tsx            ← HotelsListPage (/hotels)
│   │   └── [hotelId]/
│   │       └── page.tsx        ← HotelDetailPage (/hotels/:hotelId)
│   ├── login/
│   │   └── page.tsx            ← LoginPage (/login)
│   ├── onboarding/
│   │   └── page.tsx            ← OnboardingPage (/onboarding)
│   ├── profile/
│   │   └── page.tsx            ← ProfilePage (/profile)
│   ├── privacy/
│   │   └── page.tsx            ← PrivacyPage
│   └── terms/
│       └── page.tsx            ← TermsPage
├── components/
│   ├── SiteNav.tsx
│   ├── SiteFooter.tsx
│   ├── LeafletMap.tsx
│   ├── WeatherWidget.tsx
│   ├── HotelChatbot.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── hotels.ts
│   └── onboarding.ts
├── hooks/
│   └── useAuth.ts
└── integrations/
    └── firebase/
        └── client.ts
```
