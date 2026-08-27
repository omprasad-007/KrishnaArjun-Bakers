import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  MessageSquare,
  Send,
  User,
  ShoppingBag,
  CheckCheck,
  Search,
  RefreshCw,
  Phone
} from 'lucide-react';

export const AdminChat = () => {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const urlCustomerId = queryParams.get('customerId');

  useEffect(() => {
    setLoading(true);
    // Realtime Firestore conversations listener
    const unsubConversations = api.subscribeToConversations((convs) => {
      setConversations(convs || []);
      setLoading(false);
    });

    return () => {
      if (unsubConversations) unsubConversations();
    };
  }, []);

  useEffect(() => {
    if (urlCustomerId) {
      setSelectedCustomerId(urlCustomerId);
    } else if (conversations.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(conversations[0].customer_id);
    }
  }, [urlCustomerId, conversations]);

  useEffect(() => {
    if (!selectedCustomerId) return;

    const foundCust = conversations.find((c) => c.customer_id === selectedCustomerId);
    setActiveCustomer(foundCust || { customer_name: 'Customer', customer_phone: selectedCustomerId });

    // Realtime Firestore messages listener for the selected customer
    const unsubMessages = api.subscribeToMessages(selectedCustomerId, (msgs) => {
      setMessages(msgs || []);
    });

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [selectedCustomerId, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCustomerId || !user) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await api.sendMessage(
        selectedCustomerId,
        text,
        user.id || 'admin_sangola_01',
        selectedCustomerId,
        activeCustomer?.latest_order_id || null
      );
    } catch (err) {
      toast.error("Failed to send reply. Please try again.");
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.customer_name && c.customer_name.toLowerCase().includes(q)) ||
      (c.customer_id && String(c.customer_id).includes(q)) ||
      (c.customer_phone && c.customer_phone.includes(q))
    );
  });

  return (
    <div className="pb-12 space-y-4">
      <div>
        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-[#1b1c1c]">
          Customer Live Support Desk
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Firestore Real-Time customer messaging, custom cake inquiries, and baking questions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#dac2b6]/40 shadow-warm-md overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[75vh]">
        {/* Left Col: Conversations List (1 Col) */}
        <div className="border-r border-[#f0eded] flex flex-col h-full bg-[#fcf9f8]">
          <div className="p-3.5 border-b border-[#f0eded] bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#f6f3f2]">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading inbox...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No active customer chats yet.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.customer_id === selectedCustomerId;

                return (
                  <div
                    key={conv.id || conv.customer_id}
                    onClick={() => setSelectedCustomerId(conv.customer_id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#ffdbc9]/50 border-l-4 border-[#8b4513]'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {conv.customer_name ? conv.customer_name[0].toUpperCase() : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-headline font-bold text-xs text-[#1b1c1c] truncate">
                            {conv.customer_name || `Customer #${conv.customer_id}`}
                          </h4>
                          <span className="text-[10px] text-gray-500 block truncate">
                            {conv.customer_phone || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-2 line-clamp-1">
                      {conv.last_message || 'No messages yet.'}
                    </p>

                    {conv.latest_order_id && (
                      <span className="inline-block mt-1 text-[9px] font-bold text-[#855300] bg-[#fea619]/15 px-2 py-0.5 rounded">
                        Linked Order #{conv.latest_order_id}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Active Chat Conversation */}
        <div className="md:col-span-2 flex flex-col h-full bg-[#fffbf5]">
          {selectedCustomerId ? (
            <>
              {/* Top active customer bar */}
              <div className="p-3.5 bg-white border-b border-[#f0eded] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8b4513] text-[#ffc29f] flex items-center justify-center font-bold text-sm">
                    {activeCustomer?.customer_name ? activeCustomer.customer_name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-[#1b1c1c]">
                      {activeCustomer?.customer_name || `Customer #${selectedCustomerId}`}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {activeCustomer?.customer_phone || 'Live Chatting'}
                    </p>
                  </div>
                </div>

                {activeCustomer?.latest_order_id && (
                  <span className="text-xs font-bold text-[#6c2f00] bg-[#ffdbc9]/60 px-3 py-1 rounded-xl">
                    Order #{activeCustomer.latest_order_id}
                  </span>
                )}
              </div>

              {/* Message scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No message history with this customer. Send a message to start.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === (user?.id || 'admin_sangola_01');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-warm-sm leading-relaxed ${
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
                  placeholder={`Reply to ${activeCustomer?.customer_name || 'Customer'}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-[#dac2b6]/60 text-xs bg-[#fcf9f8] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-2xl bg-[#8b4513] hover:bg-[#6c2f00] text-white flex items-center justify-center shadow-warm-sm transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mb-2 text-[#dac2b6]" />
              <p className="text-xs font-semibold">Select a customer conversation from the list to reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
