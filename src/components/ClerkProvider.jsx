import React from 'react'
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key')
}

const ClerkProviderWrapper = ({ children }) => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {children}
    </ClerkProvider>
  )
}

// Authentication Header Component
export const AuthHeader = () => {
  return (
    <div className="auth-header">
      <SignedOut>
        <div className="auth-signed-out">
          <SignInButton mode="modal">
            <button className="btn btn-primary auth-signin-btn">
              🔐 Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="auth-signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg",
                userButtonPopoverActionButton: "hover:bg-gray-100"
              }
            }}
            showName={true}
            userProfileMode="modal"
          />
        </div>
      </SignedIn>
    </div>
  )
}

// Protected Route Component
export const ProtectedRoute = ({ children, fallback }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {fallback || (
          <div className="auth-fallback">
            <div className="auth-fallback-content">
              <h2>🔐 Authentication Required</h2>
              <p>Please sign in to access Ravens TimeSheet</p>
              <SignInButton mode="modal">
                <button className="btn btn-primary">
                  Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </div>
        )}
      </SignedOut>
    </>
  )
}

export default ClerkProviderWrapper 