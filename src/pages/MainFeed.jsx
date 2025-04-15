// src/pages/MainFeed.jsx
import React from "react";
import ClashCard from "../components/ClashCard";

export default function MainFeed() {
  // Geçici mock data
  const mockClashes = [
    {
      id: 1,
      user: {
        username: "username_A",
        avatar: "https://i.pravatar.cc/100?img=1",
        timeAgo: "3h ago",
      },
      image: "https://cdn.dribbble.com/users/2152736/screenshots/17356916/media/fe83bc4cb195b1c0f6e9aa72c8ef58e6.png", // Clash görseli
      tag: "Coffee ⚔️ Tea",
      timeLeft: "12h 23m left",
      status: "New",
      message: "This clash is waiting for new challengers. Become the first one!",
      title: "Statement",
      argument: "Argument... more",
      likes: 0,
      comments: 0,
    },
    {
      id: 2,
      user: {
        username: "username_B",
        avatar: "https://i.pravatar.cc/100?img=2",
        timeAgo: "6h ago",
      },
      image: "https://cdn.dribbble.com/users/2152736/screenshots/17356916/media/fe83bc4cb195b1c0f6e9aa72c8ef58e6.png",
      tag: "Cats 🆚 Dogs",
      timeLeft: "3h 45m left",
      status: "New",
      message: "No arguments yet. Jump in!",
      title: "Which is better?",
      argument: "Both are adorable... but...",
      likes: 2,
      comments: 5,
    },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">🔥 Hot Debates</h1>
      {mockClashes.map((clash) => (
        <ClashCard key={clash.id} clash={clash} />
      ))}
    </div>
  );
}
