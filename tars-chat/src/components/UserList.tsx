"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function UserList({ onSelectUser, selectedUserId }: any) {
  const { user: clerkUser } = useUser();
  // Call the new query we just made
  const users = useQuery(api.users.getUsersWithLastMessage);
  const [searchTerm, setSearchTerm] = useState("");

  if (users === undefined) return <div className="p-4 text-gray-400">Loading users...</div>;

  const filteredUsers = users.filter((u) =>
    u.clerkId !== clerkUser?.id && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="p-4 text-center text-gray-500 text-sm">No users found.</p>
        ) : (
          filteredUsers.map((u) => (
            <button
              key={u._id}
              onClick={() => onSelectUser(u)}
              className={`w-full text-left p-4 flex items-center gap-3 border-b transition-all ${
                selectedUserId === u._id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-sm truncate text-gray-800">{u.name}</p>
                </div>
                {/* THE PREVIEW: Requirement #3 */}
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {u.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}