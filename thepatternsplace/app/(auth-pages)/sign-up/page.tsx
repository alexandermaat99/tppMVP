import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Signup({ searchParams }: { searchParams: Message }) {
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-lg font-light text-center">Welcome to</h1>
        <h1 className=" text-center text-2xl font-medium">
          The Pattern's Place
        </h1>
        {/* TPP Main Logo - off black */}

        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          {/* <Label htmlFor="email">Email</Label> */}
          <Input name="email" placeholder="Email Address" required />
          {/* <Label htmlFor="password">Password</Label> */}
          <Input
            type="password"
            name="password"
            placeholder="Password"
            minLength={6}
            required
          />
          {/* <Label htmlFor="confirmPassword">Confirm Password</Label> */}
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <p className=" text-center text-sm text text-foreground">
            Already have an account?{" "}
            <Link
              className="text-primary font-medium text-tppPink"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
