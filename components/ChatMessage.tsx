"use client";

import { Message } from "@/app/page";
import ReactMarkdown from 'react-markdown';

function ChatMessage({ message }: { message: Message }) {
  const isHuman = message.role === "human";

  return (
    <div className={`flex ${isHuman ? "justify-end" : "justify-start"} m-2`}>
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
          isHuman
            ? "bg-teal-500 text-white"
            : "bg-gray-300 text-black"
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default ChatMessage;
