import * as React from "react";
import { useState } from "react";

const modalStyles: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFFFFF',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
  width: '90%',
  maxWidth: '400px',
  color: '#000000', 
};

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 999,
};

// Define the props our component will accept
interface LoginPopUpProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginPopUp({ onClose, onLoginSuccess }: LoginPopUpProps) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const endpoint = isSigningUp ? '/api/auth/signup' : '/api/auth/signin';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unexpected error occurred.');
      }
      
      if (isSigningUp) {
          setMessage('Account created! Please log in to continue.');
          setIsSigningUp(false); 
      } else {
        localStorage.setItem('authToken', data.token);
        onLoginSuccess();
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <h2>{isSigningUp ? "Create Account" : "Log In"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
          <button type="submit" style={{ width: '100%', padding: '0.75rem', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            {isSigningUp ? "Sign Up" : "Log In"}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={() => { setIsSigningUp(!isSigningUp); setError(null); setMessage(null); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>
            {isSigningUp ? "Already have an account? Log In" : "Don't have an account? Create one"}
            </button>
        </div>
      </div>
    </div>
  );
}