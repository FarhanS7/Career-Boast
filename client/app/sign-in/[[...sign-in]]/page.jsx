import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          card: 'bg-zinc-900 border border-white/10',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
          socialButtonsBlockButtonText: 'text-white',
          formFieldLabel: 'text-zinc-300',
          formFieldInput: 'bg-black border-white/10 text-white',
          footerActionLink: 'text-blue-400 hover:text-blue-300',
          identityPreviewText: 'text-zinc-300',
          formFieldInputShowPasswordButton: 'text-zinc-400',
        }
      }} />
    </div>
  );
}
