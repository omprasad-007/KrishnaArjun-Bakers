import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Send, Clock, Store, CheckCheck, MessageSquare, AlertCircle } from 'lucide-react';

export const CustomerChat = () => {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Real-time Firestore Subscription
    const unsubscribe = api.subscribeToMessages(user.id, (msgs) => {
      setMessages(msgs || []);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await api.sendMessage(
        user.id,
        text,
        user.id,
        'admin_sangola_01',
        orderId ? String(orderId) : null
      );
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="pb-24 pt-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-md overflow-hidden flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-[#6c2f00] via-[#8b4513] to-[#855300] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#fea619] text-[#6c2f00] flex items-center justify-center font-bold text-xl shadow-warm-sm">
                🥖
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-[#22c55e]"
                title="Bakery Realtime Desk Active"
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-white">KrishnaArjun Bakers Support</h3>
              <p className="text-[11px] text-[#ffdbc9]">
                Firestore Realtime Desk • Sangola
              </p>
            </div>
          </div>

          {orderId && (
            <span className="bg-white/20 text-[#ffdbc9] text-[10px] font-bold px-2.5 py-1 rounded-full">
              Linked to Order #{orderId}
            </span>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#fffbf5] space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#f6f3f2] flex items-center justify-center mx-auto text-2xl">
                💬
              </div>
              <h4 className="font-headline font-bold text-sm text-gray-800">
                Welcome to KrishnaArjun Bakers Live Desk
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Ask about today's fresh bread batches, custom cake designs, delivery timings, or special requirements.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-warm-sm leading-relaxed ${
                      isMine
                        ? 'bg-[#8b4513] text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-[#dac2b6]/40 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                        isMine ? 'text-[#ffc29f]' : 'text-gray-400'
                      }`}
                    >
                      <span>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {isMine && <CheckCheck className="w-3 h-3 text-[#ffc29f]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#f0eded] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to KrishnaArjun Bakers..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none focus:border-secondary transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white flex items-center justify-center shadow-warm-sm transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerChat;
