"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Store ID token for ProtectedRoute check
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem("firebase_id_token", token);
        } catch {
          localStorage.removeItem("firebase_id_token");
        }
      } else {
        localStorage.removeItem("firebase_id_token");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("firebase_id_token");
  };

  return { user, loading, signOut };
}
