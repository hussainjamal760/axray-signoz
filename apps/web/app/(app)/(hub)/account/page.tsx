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
    <div className="flex-1 overflow-y-auto w-full h-full p-gutter custom-scrollbar" data-lenis-prevent="true">
      <div className="flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 border-b-[3px] border-outline pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Account Settings</h1>
          <p className="text-on-surface-variant font-mono-label uppercase tracking-widest mt-2 flex items-center gap-2">
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
        <div className="bg-surface-container border-[3px] border-outline brutalist-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-9xl leading-none pointer-events-none select-none uppercase truncate w-full text-right -mt-8">
            {user?.username || "USER"}
          </div>

          <div className="p-8 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-[3px] border-white bg-primary-fixed flex items-center justify-center brutalist-shadow">
              <img
                className="w-full h-full object-cover transition-all duration-500"
                alt={user?.username || "Profile"}
                src={user?.avatarUrl || `https://github.com/identicons/${user?.username || 'user'}.png`}
              />
            </div>

            <div className="flex flex-col justify-center gap-5 flex-1 w-full min-w-0">
              <div className="min-w-0 w-full">
                <h2 className="font-mono-label text-primary-fixed uppercase tracking-widest font-bold text-xs mb-1 flex items-center gap-2">
                  <User size={12} /> Username
                </h2>
                <p className="text-3xl md:text-4xl font-black text-white uppercase truncate">{user?.username || "Unknown"}</p>
              </div>

              <div className="min-w-0 w-full">
                <h2 className="font-mono-label text-primary-fixed uppercase tracking-widest font-bold text-xs mb-1 flex items-center gap-2">
                  <GithubLogo size={14} weight="bold" /> GitHub Email
                </h2>
                <p className="text-lg md:text-xl font-bold text-on-surface truncate">{user?.email || "No email provided"}</p>
              </div>

              <div className="flex items-center gap-2 mt-2 bg-background/50 border-2 border-outline px-4 py-2 w-max">
                <span className="w-2.5 h-2.5 bg-green-500 brutalist-shadow-sm border border-white animate-pulse"></span>
                <span className="font-mono-label text-white uppercase font-bold text-xs tracking-wider">Status: Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & SESSION SECTION */}
        <div className="bg-surface border-2 border-error/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-2xl font-black text-error uppercase mb-2 flex items-center gap-3">
            <ShieldAlert /> Danger Zone
          </h3>
          <p className="text-on-surface-variant font-mono-label text-sm mb-6">Irreversible and destructive actions.</p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-2 border-error/30 bg-error/5">
              <div>
                <h4 className="font-bold text-white uppercase text-sm mb-1">End Current Session</h4>
                <p className="text-on-surface-variant font-mono-label text-xs">Log out of your current session on this device.</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="shrink-0 bg-background hover:bg-error hover:text-white text-error border-[3px] border-error px-6 py-3 font-black uppercase text-sm tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
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
