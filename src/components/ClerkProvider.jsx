import React from 'react'
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Gracefully handle missing environment variable
if (!clerkPubKey) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
  console.info('Create a .env file with: VITE_CLERK_PUBLISHABLE_KEY=pk_test_bW92aW5nLWphdmVsaW4tNzguY2xlcmsuYWNjb3VudHMuZGV2JA')
}

const ClerkProviderWrapper = ({ children }) => {
  // If no Clerk key, render without authentication
  if (!clerkPubKey) {
    console.warn('Running without authentication - missing Clerk keys')
    return (
      <div>
        <div style={{ 
          background: '#fef3c7', 
          padding: '1rem', 
          margin: '1rem', 
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>⚠️ Authentication Not Configured</h3>
          <p style={{ color: '#92400e', margin: 0, fontSize: '0.9rem' }}>
            Create a .env file with your Clerk credentials to enable authentication
          </p>
        </div>
        {children}
      </div>
    )
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      navigate={(to) => window.location.href = to}
      signInUrl="/"
      signUpUrl="/"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}

// Authentication Header Component
export const AuthHeader = () => {
  if (!clerkPubKey) {
    return (
      <div className="auth-header">
        <button 
          className="btn btn-secondary" 
          style={{ 
            background: '#6b7280', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            cursor: 'not-allowed'
          }}
          disabled
        >
          🔐 Auth Disabled
        </button>
      </div>
    )
  }

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
            afterSignOutUrl="/"
          />
        </div>
      </SignedIn>
    </div>
  )
}

// Protected Route Component
export const ProtectedRoute = ({ children, fallback }) => {
  if (!clerkPubKey) {
    // If no Clerk, just render children (no protection)
    return children
  }

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