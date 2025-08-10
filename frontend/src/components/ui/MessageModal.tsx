import React, { useState } from 'react';
import './MessageModal.css';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId: string;
  onSendMessage: (recipientId: string, message: string, subject?: string) => Promise<void>;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientId,
  onSendMessage
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(recipientId, message, subject || undefined);
      
      // Reset form and close modal
      setSubject('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="message-modal-overlay" onClick={handleClose}>
      <div className="message-modal" onClick={e => e.stopPropagation()}>
        <div className="message-modal-header">
          <div className="recipient-info">
            <h3>💬 메시지 보내기</h3>
            <p>받는 사람: <strong>{recipientName}</strong></p>
          </div>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSending}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="message-form">
          <div className="form-group">
            <label htmlFor="subject">제목 (선택사항)</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="메시지 제목을 입력하세요"
              disabled={isSending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">메시지 *</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              rows={6}
              required
              disabled={isSending}
            />
            <div className="character-count">
              {message.length}/1000
            </div>
          </div>

          <div className="message-suggestions">
            <p>💡 제안 메시지:</p>
            <div className="suggestion-buttons">
              <button
                type="button"
                onClick={() => setMessage('안녕하세요! 프로필을 보고 연락드립니다. 커리어에 대해 조언을 구하고 싶은데, 시간 되실 때 대화 가능할까요?')}
                disabled={isSending}
              >
                커리어 조언 요청
              </button>
              <button
                type="button"
                onClick={() => setMessage('안녕하세요! 비슷한 분야에서 일하고 있어서 네트워킹하고 싶어 연락드립니다. 언제 시간 되실 때 이야기 나누면 좋겠습니다.')}
                disabled={isSending}
              >
                네트워킹 제안
              </button>
              <button
                type="button"
                onClick={() => setMessage('프로필을 보고 정말 인상깊었습니다. 혹시 멘토링에 관심 있으시다면 연락 부탁드립니다!')}
                disabled={isSending}
              >
                멘토링 요청
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isSending}
            >
              취소
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <>
                  <span className="loading-spinner"></span>
                  전송 중...
                </>
              ) : (
                <>
                  📤 메시지 전송
                </>
              )}
            </button>
          </div>
        </form>

        <div className="message-tips">
          <h4>💡 좋은 메시지 작성 팁:</h4>
          <ul>
            <li>구체적이고 정중한 어조로 작성하세요</li>
            <li>왜 연락하는지 명확히 설명하세요</li>
            <li>상대방의 시간을 존중하는 표현을 사용하세요</li>
            <li>너무 길지 않게 요점만 간단히 작성하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;