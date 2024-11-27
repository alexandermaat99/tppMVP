import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login({ searchParams }: { searchParams: Message }) {
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-lg font-light text-center">Welcome back to</h1>
      <h1 className="text-2xl text-center font-medium">The Pattern's Place</h1>
      {/* TPP Main Logo - off black */}

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        {/* <Label htmlFor="email">Email</Label> */}
        <Input id="email" name="email" placeholder="Email Address" required />
        {/* <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
        </div> */}
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <p className="text-sm text-center text-foreground ">
          {" "}
          <Link className="font-light text-tppPink" href="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>

        <p className="text-center text-sm text-foreground">
          Don't have an account?{" "}
          <Link
            className="text-primary font-medium text-tppPink"
            href="/sign-up"
          >
            Sign up
          </Link>
        </p>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
