"use client";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function Chat({ receiver }: any) {
  const { user: clerkUser } = useUser();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const users = useQuery(api.users.getUsersWithLastMessage);
  const currentUser = users?.find((u: any) => u.clerkId === clerkUser?.id);
  const messages = useQuery(api.messages.getPrivateMessages, 
    currentUser && receiver ? { userA: currentUser._id, userB: receiver._id } : "skip"
  );

  const sendMessage = useMutation(api.messages.send);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !receiver || !text.trim()) return;
    await sendMessage({ body: text, author: clerkUser?.fullName || "User", senderId: currentUser._id, receiverId: receiver._id });
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">{receiver.name.charAt(0)}</div>
        <h2 className="font-bold text-gray-800">{receiver.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
        {messages?.map((msg: any) => {
          const isMe = msg.senderId === currentUser?._id;
          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`relative group max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                <p className="text-sm">{msg.body}</p>
                
                {/* Emoji Picker on Hover (Requirement #12) */}
                <div className={`absolute -top-10 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex bg-white shadow-xl border rounded-full px-2 py-1 gap-2 z-10 animate-in fade-in zoom-in duration-200`}>
                  {EMOJIS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => currentUser && toggleReaction({ messageId: msg._id, emoji, userId: currentUser._id })}
                      className="hover:scale-150 transition-transform cursor-pointer text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Active Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {msg.reactions.map((r: any, i: number) => (
                    <span key={i} className="text-[10px] bg-white border rounded-full px-1.5 py-0.5 shadow-sm">
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            className="flex-1 border rounded-full px-5 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Type a message..." 
          />
          <button type="submit" className="bg-blue-600 text-white rounded-full px-6 py-2 text-sm font-bold">Send</button>
        </div>
      </form>
    </div>
  );
}