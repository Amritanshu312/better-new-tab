import React from "react";
import SearchBar from "../utils/Search";

export default function AppBars() {
  const apps = [
    { name: "Reddit", icon: "/icons/reddit.png", link: "https://www.reddit.com" },
    { name: "YouTube", icon: "/icons/youtube.png", link: "https://www.youtube.com" },
    { name: "Telegram", icon: "/icons/telegram.png", link: "https://web.telegram.org" },
    { name: "Instagram", icon: "/icons/instagram.png", link: "https://www.instagram.com" },
    { name: "ChatGPT", icon: "/icons/chatgpt.webp", link: "https://chat.openai.com" },
    { name: "Inbox (3,779)", icon: "/icons/gmail.png", link: "https://mail.google.com" },
  ];


  return (
    <div className="z-20 flex flex-col items-center">
      {/* App icons row */}
      <div className="flex space-x-6 mt-12 bg-black/10 rounded-2xl p-4 backdrop-blur-md">
        {apps.map((app, index) => (
          <a href={app.link} key={index} className="flex flex-col items-center space-y-2">
            <div className="bg-[#e5e7eb50] hover:bg-[#e5e7eb69] cursor-pointer p-3 rounded-2xl shadow-md transition">
              <img src={app.icon} alt={app.name} className="w-8 h-8" />
            </div>
            <p className="text-white text-sm font-medium">{app.name}</p>
          </a>
        ))}
      </div>


      {/* <SearchBar /> */}
    </div>
  );
}
