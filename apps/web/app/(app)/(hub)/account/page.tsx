"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User, ShieldAlert
} from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";

export default function AccountPage() {
  const { data: currentUserData, isLoading } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-fixed border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono-label text-primary-fixed animate-pulse font-bold tracking-widest uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const user = currentUserData?.user;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/auth");
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-gutter custom-scrollbar bg-background" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} data-lenis-prevent="true">
      <div className="flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 border-b border-outline-variant/20 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-on-surface-variant font-medium tracking-wide mt-2 flex items-center gap-2">
            Manage your profile and session
          </p>
        </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-8 pb-20"
      >
        {/* PROFILE SECTION */}
        <div className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group">
          {/* Subtle glow */}
          <div className="absolute w-64 h-64 rounded-full blur-[80px] -top-10 -right-10 pointer-events-none transition-all duration-700 bg-primary-fixed/5 group-hover:bg-primary-fixed/10"></div>
          
          <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-9xl leading-none pointer-events-none select-none uppercase truncate w-full text-right -mt-8">
            {user?.username || "USER"}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[2rem] border border-outline-variant/20 bg-surface-container-high flex items-center justify-center shadow-lg overflow-hidden relative group-hover:border-primary-fixed/50 transition-colors">
              <img
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                alt={user?.username || "Profile"}
                src={user?.avatarUrl || `https://github.com/identicons/${user?.username || 'user'}.png`}
              />
            </div>

            <div className="flex flex-col justify-center gap-5 flex-1 w-full min-w-0">
              <div className="min-w-0 w-full">
                <h2 className="text-on-surface-variant font-medium uppercase tracking-widest text-xs mb-1.5 flex items-center gap-2">
                  <User size={14} className="text-primary-fixed" /> Username
                </h2>
                <p className="text-3xl md:text-4xl font-bold text-white truncate tracking-tight">{user?.username || "Unknown"}</p>
              </div>

              <div className="min-w-0 w-full">
                <h2 className="text-on-surface-variant font-medium uppercase tracking-widest text-xs mb-1.5 flex items-center gap-2">
                  <GithubLogo size={16} weight="bold" className="text-primary-fixed" /> GitHub Email
                </h2>
                <p className="text-lg md:text-xl font-medium text-white/90 truncate">{user?.email || "No email provided"}</p>
              </div>

              <div className="flex items-center gap-2.5 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 w-max rounded-full shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"></span>
                <span className="text-emerald-400 uppercase font-semibold text-xs tracking-wider">Status: Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & SESSION SECTION */}
        <div className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-error/20 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group">
          <div className="absolute w-64 h-64 rounded-full blur-[80px] -bottom-10 -right-10 pointer-events-none transition-all duration-700 bg-error/5 group-hover:bg-error/10"></div>
          
          <h3 className="text-2xl font-bold text-error mb-2 flex items-center gap-3 tracking-tight">
            <ShieldAlert className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Danger Zone
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 font-medium">Irreversible and destructive actions.</p>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 rounded-2xl border border-error/20 bg-error/5 backdrop-blur-md">
              <div>
                <h4 className="font-semibold text-white text-base mb-1 tracking-wide">End Current Session</h4>
                <p className="text-on-surface-variant text-sm">Log out of your current session on this device.</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="shrink-0 bg-error/10 hover:bg-error hover:text-white text-error border border-error/30 px-6 py-2.5 rounded-xl font-bold uppercase text-sm tracking-wider transition-all duration-300 flex items-center gap-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
