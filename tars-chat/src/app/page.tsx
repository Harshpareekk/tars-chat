"use client";
import { useState, useEffect } from "react";
import { SignInButton, UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserList } from "@/components/UserList";
import { Chat } from "@/components/Chat";

export default function Home() {
  const { isSignedIn, user } = useUser();
  // State to track who we are currently chatting with (Requirement #3 & #15)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Hook into the Convex mutation to save user data (Requirement #1 & #12)
  const storeUser = useMutation(api.users.store);

  // Requirement #12: Automatically sync user profile to Convex
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn) {
        try {
          await storeUser();
          console.log("User synced successfully!");
        } catch (error) {
          console.error("Auto-sync failed:", error);
        }
      }
    };
    syncUser();
  }, [isSignedIn, storeUser]);

  return (
    <main className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <SignedOut>
        <div className="flex h-full items-center justify-center">
          <div className="text-center p-8 bg-white shadow-xl rounded-lg border max-w-sm w-full">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">Tars Chat</h1>
            <p className="text-gray-500 mb-6 text-sm">Real-time internship challenge portal</p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition active:scale-95">
                Sign In to Start
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Header: Requirement #1 (Name and Avatar) */}
        <header className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
          <h1 className="font-bold text-xl text-blue-600 tracking-tight">Tars Chat</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-600">
              {user?.fullName}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Requirement #2 (Discovery) & #6 (Responsive Sidebar) */}
          <aside className="w-full sm:w-1/3 md:w-1/4 border-r bg-white overflow-y-auto">
            <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?._id} />
          </aside>

          {/* Chat Area: Requirement #3 (Private DMs) & #6 (Desktop Area) */}
          <section className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
              <Chat receiver={selectedUser} />
            ) : (
              // Requirement #5: Empty State
              <div className="flex-1 flex items-center justify-center text-gray-400 p-10 text-center">
                <div>
                  <div className="text-6xl mb-4 grayscale">💬</div>
                  <h2 className="text-xl font-semibold text-gray-600 mb-2">Your Inbox</h2>
                  <p className="max-w-xs mx-auto">Select a user from the sidebar to start a private conversation.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </SignedIn>
    </main>
  );
}