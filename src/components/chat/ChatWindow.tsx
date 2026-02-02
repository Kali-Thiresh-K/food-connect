import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Chat, ChatMessage } from '@/types/chat';

interface ChatWindowProps {
    donationId: string;
    onMessagesRead?: () => void;
}

export default function ChatWindow({ donationId, onMessagesRead }: ChatWindowProps) {
    const { user } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollInterval = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (donationId) {
            initChat();
        }

        // Cleanup polling on unmount
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [donationId]);

    useEffect(() => {
        // Scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const initChat = async () => {
        try {
            // First get the chat ID
            const chatRes = await api.get(`/chats/donation/${donationId}`);
            setChat(chatRes.data);

            // Then load messages
            await loadMessages(chatRes.data._id);

            // Mark as read immediately
            markAsRead(chatRes.data._id);

            // Start polling
            startPolling(chatRes.data._id);
        } catch (error) {
            console.error('Failed to init chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (chatId: string) => {
        try {
            await api.put(`/chats/${chatId}/read`);
            if (onMessagesRead) onMessagesRead();
        } catch (error) {
            console.error('Failed to mark messages as read', error);
        }
    };

    const loadMessages = async (chatId: string) => {
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            setMessages(res.data);

            // Check if there are any unread messages from others, if so, mark as read
            // Optimistically we can just call markAsRead occasionally or check the messages content
            // For simplicity, we can call it on every poll if we detect new messages, or just rely on the user having the window open.
            // Let's call it here to ensure we stay up to date
            // Note: This might be chatty (every 5s). Let's restrict it.
            // A better approach is to check if the last message is NOT from me and isRead=false.
            // But we don't have isRead on the frontend message type yet (maybe).

            // For now, let's simple mark read on load.
            // markAsRead(chatId); // Moved to init to avoid excessive calls, maybe call if length changed?
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const startPolling = (chatId: string) => {
        if (pollInterval.current) clearInterval(pollInterval.current);
        pollInterval.current = setInterval(() => {
            loadMessages(chatId);
        }, 5000); // Poll every 5 seconds
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !chat || isSending) return;

        setIsSending(true);
        try {
            const res = await api.post(`/chats/${chat._id}/messages`, {
                text: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <p>Chat unavailable</p>
            </div>
        );
    }

    const otherUser = chat.donor._id === user?.id ? chat.ngo : chat.donor;

    return (
        <div className="flex flex-col h-[500px] border rounded-lg bg-background">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-muted/30">
                <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{otherUser.fullName}</p>
                    {otherUser.organizationName && (
                        <p className="text-xs text-muted-foreground">{otherUser.organizationName}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.sender._id === user?.id;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted text-foreground rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={!chat.isActive}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending || !chat.isActive}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
