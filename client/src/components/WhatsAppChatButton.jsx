import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

/**
 * WhatsApp Live Chat Button
 * Floating button on bottom-left that opens WhatsApp chat
 * Uses Evolution API for WhatsApp Business integration
 */

export default function WhatsAppChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const supportNumber = '+233249138687'; // DVSA DriveTime Saver support number

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Open WhatsApp with pre-filled message
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset and close
    setMessage('');
    setIsOpen(false);
  };

  const quickReplies = [
    'How do I book a test?',
    'I need an instructor',
    'Payment issues',
    'Technical support',
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open WhatsApp chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-green-500 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">DVSA Support</h3>
              <p className="text-green-100 text-xs">Typically replies in minutes</p>
            </div>
          </div>

          {/* Quick Replies */}
          <div className="p-4 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setMessage(reply)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors text-left"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-400">Powered by WhatsApp</p>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}