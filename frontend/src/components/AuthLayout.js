import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--brand">
        <div className="auth-brand">
          <div className="brand-mark">dm</div>
          <h1 className="brand-name">
            documind<span className="brand-name__suffix">.ai</span>
          </h1>
          <p>Upload documents, ask questions, and get answers grounded in your PDFs — or chat freely with AI.</p>
          <ul className="auth-features">
            <li>Semantic search across uploaded PDFs</li>
            <li>Switch between document and general chat</li>
            <li>Full conversation history</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthForm({ onSubmit, children, submitLabel, loading, error, footer }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {error && <div className="alert alert--error">{error}</div>}
      {children}
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'Please wait…' : submitLabel}
      </button>
      {footer && <div className="auth-form__footer">{footer}</div>}
    </form>
  );
}

export function AuthField({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input
        id={id}
        type={type}
        className="field__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}

export function AuthSwitchLink({ text, linkText, to }) {
  return (
    <p>
      {text}{' '}
      <Link to={to} className="text-link">
        {linkText}
      </Link>
    </p>
  );
}
