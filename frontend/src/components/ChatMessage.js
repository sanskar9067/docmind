export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`chat-message chat-message--${role}`}>
      <div className="chat-message__avatar" aria-hidden="true">
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="chat-message__bubble">
        <p className="chat-message__content">{content}</p>
      </div>
    </div>
  );
}

export function ChatTypingIndicator() {
  return (
    <div className="chat-message chat-message--assistant">
      <div className="chat-message__avatar" aria-hidden="true">
        AI
      </div>
      <div className="chat-message__bubble chat-message__bubble--typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
