"use client";

import { GithubLogo } from "@phosphor-icons/react";
import { startGithubAuth } from "../api/auth.api";
import { Button } from "@/components/ui/button";

export const GithubLoginButton = () => {
  return (
    <Button
      onClick={startGithubAuth}
      size="lg"
      className="w-full max-w-sm gap-3 border-[3px] text-base"
    >
      <GithubLogo weight="fill" className="w-5 h-5 shrink-0" />
      Continue with GitHub
    </Button>
  );
};
