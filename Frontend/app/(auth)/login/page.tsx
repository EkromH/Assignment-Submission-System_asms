'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';

interface JwtPayload {
  // ASP.NET Core stores roles under this standard claim URI
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  role?: string; // Fallback for custom role claims
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/Auth/login', { email, password });
      const token = response.data.token;

      if (!token) {
        setError('No token received from server.');
        setLoading(false);
        return;
      }

      // Store JWT token for api.ts interceptor
      localStorage.setItem('token', token);

      // Decode token to extract user role
      const decoded = jwtDecode<JwtPayload>(token);
      const role =
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decoded.role;

      // Redirect to the appropriate dashboard based on role
      if (role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (role === 'Teacher') {
        router.push('/teacher/dashboard');
      } else if (role === 'Student') {
        router.push('/student/dashboard');
      } else {
        setError('Unrecognized user role.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials or server connection error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6 border border-gray-200"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">ASMS Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@school.test"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-bold py-2 px-4 rounded transition ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}