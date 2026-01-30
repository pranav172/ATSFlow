import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to continue optimizing your resume
        </p>
      </div>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/upload"
      />
    </>
  );
}
