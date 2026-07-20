import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GithubLoginButton } from "./GithubLoginButton";

export const AuthCard = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center gap-4">
        <Image
          src="/logo/axray-logo.png"
          alt="AXRAY Logo"
          width={48}
          height={48}
          className="object-contain"
        />
        <div>
          <CardTitle className="text-3xl">AXRAY</CardTitle>
          <CardDescription className="mt-2">
            The flight recorder for AI coding agents.
            <br />
            Connect GitHub to get started.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-full h-[2px] bg-outline-variant" />
        <GithubLoginButton />
      </CardContent>
    </Card>
  );
};
