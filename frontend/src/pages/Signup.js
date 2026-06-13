import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { AuthField, AuthForm, AuthSwitchLink } from '../components/AuthLayout';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Get started with documind.ai.">
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Create account"
        loading={loading}
        error={error}
        footer={
          <AuthSwitchLink
            text="Already have an account?"
            linkText="Sign in"
            to="/login"
          />
        }
      >
        <AuthField
          id="name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          autoComplete="new-password"
        />
      </AuthForm>
    </AuthLayout>
  );
}
