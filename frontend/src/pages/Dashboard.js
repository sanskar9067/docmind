import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatHistory, sendMessage, uploadPdf } from '../api/chat';
import ChatMessage, { ChatTypingIndicator } from '../components/ChatMessage';
import FileUpload from '../components/FileUpload';

function historyToMessages(chats) {
  const messages = [];
  chats.forEach((chat) => {
    messages.push({ id: `u-${chat.id}`, role: 'user', content: chat.message });
    messages.push({ id: `a-${chat.id}`, role: 'assistant', content: chat.response });
  });
  return messages;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [chatType, setChatType] = useState('pdf');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const messagesEndRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError('');
    try {
      const chats = await getChatHistory(token);
      setMessages(historyToMessages(chats));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput('');
    setSending(true);
    setError('');

    const userMessage = { id: `temp-u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendMessage(token, trimmed, chatType);
      setMessages((prev) => [
        ...prev,
        { id: `temp-a-${Date.now()}`, role: 'assistant', content: response },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleUpload(file) {
    setUploading(true);
    setError('');
    try {
      await uploadPdf(token, file);
      setToast(`"${file.name}" uploaded and indexed successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-mark brand-mark--sm">dm</div>
          <div>
            <strong className="brand-name brand-name--sm">
              documind<span className="brand-name__suffix">.ai</span>
            </strong>
            <span>Document intelligence</span>
          </div>
        </div>

        <FileUpload onUpload={handleUpload} uploading={uploading} />

        <div className="sidebar__section">
          <h3>Chat mode</h3>
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-toggle__btn ${chatType === 'pdf' ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => setChatType('pdf')}
            >
              <span className="mode-toggle__icon">📑</span>
              PDF Chat
            </button>
            <button
              type="button"
              className={`mode-toggle__btn ${chatType === 'general' ? 'mode-toggle__btn--active' : ''}`}
              onClick={() => setChatType('general')}
            >
              <span className="mode-toggle__icon">💬</span>
              General
            </button>
          </div>
          <p className="sidebar__hint">
            {chatType === 'pdf'
              ? 'Answers are retrieved from your uploaded documents.'
              : 'Free-form conversation with the AI model.'}
          </p>
        </div>

        <div className="sidebar__footer">
          <div className="user-chip">
            <div className="user-chip__avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
            <div className="user-chip__info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="btn btn--ghost btn--full" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div>
            <h1>{chatType === 'pdf' ? 'Document Chat' : 'General Chat'}</h1>
            <p>
              {chatType === 'pdf'
                ? 'Ask questions about your indexed PDFs'
                : 'Chat without document context'}
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={loadHistory}>
            Refresh history
          </button>
        </header>

        {toast && <div className="toast toast--success">{toast}</div>}
        {error && <div className="alert alert--error chat-alert">{error}</div>}

        <div className="chat-feed">
          {loadingHistory ? (
            <div className="chat-empty">
              <div className="spinner" />
              <p>Loading conversation history…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty__icon">✦</div>
              <h2>Start a conversation</h2>
              <p>
                {chatType === 'pdf'
                  ? 'Upload a PDF on the left, then ask anything about its contents.'
                  : 'Type a message below to begin chatting with the AI.'}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} role={message.role} content={message.content} />
              ))}
              {sending && <ChatTypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-composer" onSubmit={handleSend}>
          <textarea
            className="chat-composer__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              chatType === 'pdf'
                ? 'Ask something about your documents…'
                : 'Type your message…'
            }
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            disabled={sending}
          />
          <button type="submit" className="btn btn--primary" disabled={!input.trim() || sending}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
