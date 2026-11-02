import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Send, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function SupportContent() {
  const { user, tickets, createTicket, addTicketMessage, closeTicket } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const userTickets = tickets.filter(t => t.userId === user?.id);
  const activeTicket = tickets.find(t => t.id === selectedTicket);

  const handleCreate = () => {
    if (!subject.trim() || !description.trim()) return;
    createTicket(subject, description);
    setSubject('');
    setDescription('');
    setShowNew(false);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    addTicketMessage(selectedTicket, newMessage);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Support</h2>
          <p className="text-white/50">Get help with your orders or account</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {userTickets.length === 0 && !showNew ? (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No support tickets</h3>
          <p className="text-white/50">Create a ticket if you need help</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="space-y-3">
            {userTickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`glass-card p-4 w-full text-left ${selectedTicket === ticket.id ? 'border-purple-500/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">{ticket.id}</span>
                  <span className={`status-badge text-xs ${ticket.status === 'open' ? 'status-pending' : 'status-expired'}`}>
                    {ticket.status}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white truncate">{ticket.subject}</h4>
                <p className="text-xs text-white/40 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 glass-card p-6">
            {activeTicket ? (
              <div className="flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{activeTicket.subject}</h3>
                    <p className="text-xs text-white/40">{activeTicket.id}</p>
                  </div>
                  {activeTicket.status === 'open' && (
                    <button onClick={() => closeTicket(activeTicket.id)} className="text-xs text-red-400 hover:text-red-300">
                      Close Ticket
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {activeTicket.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        msg.isAdmin ? 'bg-purple-500/20 text-purple-200' : 'bg-white/5 text-white/80'
                      }`}>
                        <p className="text-xs text-white/40 mb-1">{msg.senderName}</p>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activeTicket.status === 'open' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      className="input-field flex-1"
                      placeholder="Type your message..."
                    />
                    <button onClick={handleSend} className="btn-primary px-4">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">New Support Ticket</h3>
              <button onClick={() => setShowNew(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="input-field" placeholder="Brief description of your issue" />
              </div>
              <div>
                <label className="text-sm text-white/70 mb-2 block">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[120px] resize-none" placeholder="Describe your issue in detail..." />
              </div>
              <button onClick={handleCreate} className="btn-primary w-full">Submit Ticket</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
