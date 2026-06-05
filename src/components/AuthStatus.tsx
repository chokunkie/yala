/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { Shield, LogIn, LogOut, UserCheck } from 'lucide-react';

export default function AuthStatus() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Authentication failed: ", error);
      // Fallback to anonymous sign-in in the sandboxed preview environment if popup was blocked
      try {
        await signInAnonymously(auth);
      } catch (anonymErr) {
        console.error("Anonymous authentication fallback failed", anonymErr);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Signout failed: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/40 text-xs text-slate-400">
        <div className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>
        <span>กำลังตรวจสอบสิทธิ์...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentUser ? (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 rounded-lg text-emerald-200">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] text-emerald-400/80 leading-none">เจ้าหน้าที่เทคนิค (Ops Authorized)</span>
            <span className="text-xs font-semibold max-w-[100px] truncate leading-tight mt-0.5">
              {currentUser.displayName || currentUser.email || 'ผู้ประสานงานหลัก'}
            </span>
          </div>
          <button
            id="auth-signout-btn"
            onClick={handleSignOut}
            title="ออกจากระบบ"
            className="ml-1 p-1 hover:bg-emerald-900/50 rounded text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          id="auth-signin-btn"
          onClick={handleGoogleSignIn}
          className="flex items-center gap-1.5 border border-cyan-500 bg-cyan-900/30 hover:bg-cyan-800/40 px-3.5 py-1.5 rounded-lg text-xs font-medium text-cyan-200 hover:text-white transition-all shadow-lg hover:shadow-cyan-950 cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5 shrink-0" />
          <span>เข้าสู่ระบบเจ้าหน้าที่ (Google SSO)</span>
        </button>
      )}
    </div>
  );
}
