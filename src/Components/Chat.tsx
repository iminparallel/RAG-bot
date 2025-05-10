"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Input } from "@/Components/ui/input";
import { Upload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Card, CardContent } from "@/Components/ui/card";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/Components/MarkDown";
import { toast } from "sonner";

const Chat = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const {
    messages,
    input,
    error,
    handleInputChange,
    handleSubmit,
    setMessages,
    status,
  } = useChat({
    // Add these options to optimize streaming performance
    onFinish: () => {
      // Ensure we scroll one final time when the full message is received
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Add a slightly longer delay for initial load to ensure DOM is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 300);
    }
  }, [isLoading, messages.length]);
  // Handle errors
  useEffect(() => {
    if (error) {
      toast("Chat could not be fetched, contact the developer");
    }
  }, [error]);

  // Check for userId
  useEffect(() => {
    if (!userId) router.push("/");
  }, [userId, router]);

  // Load chat history once
  useEffect(() => {
    if (!initialLoadComplete) {
      fetch("/api/chat/history")
        .then((res) => res.json())
        .then((res) => {
          if (res?.messages?.length > 0) {
            setMessages(res.messages);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch chat history:", err);
        })
        .finally(() => {
          setIsLoading(false);
          setInitialLoadComplete(true);
        });
    }
  }, [initialLoadComplete, setMessages]);

  // Handle scrolling for new messages and streaming content
  const lastMessageRef = useRef<string | null>(null);
  const statusRef = useRef(status);

  // Only scroll when a new message arrives or streaming starts/ends
  useEffect(() => {
    // Check if this is a new message or end of streaming
    const isNewMessage =
      messages.length > 0 &&
      messages[messages.length - 1]?.content !== lastMessageRef.current;
    const streamingStateChanged = status !== statusRef.current;

    // Only scroll if there's a new complete message or streaming status changed
    if (isNewMessage || streamingStateChanged) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }

      // Update refs to prevent unnecessary scrolling
      if (messages.length > 0) {
        lastMessageRef.current = messages[messages.length - 1]?.content;
      }
      statusRef.current = status;
    }
  }, [messages, status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upsert", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      toast("Added PDF data to AI's knowledge");

      if (data?.message) {
        router.push(`/Chat/${data.message}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast("File Could not be uploaded");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading || isUploading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <motion.div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="flex flex-col bg-gray-900 text-white border-none h-full">
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {messages.map(({ content }, idx) => (
              <div
                key={idx}
                className={`max-w-xl px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  idx % 2 === 0
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-gray-400 text-gray-800 self-start mr-auto"
                }`}
              >
                <MarkdownRenderer text={content} />
              </div>
            ))}
            {status === "streaming" && (
              <motion.div className="w-5 h-5 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto" />
            )}
            <div ref={messagesEndRef} className="h-4" />
          </CardContent>

          <CardContent className="bg-gray-600 p-1 border-t border-gray-400">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex items-center gap-3"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                      className="p-2 rounded hover:bg-gray-700"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Upload PDF</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Input
                value={input}
                onChange={handleInputChange}
                className="flex-grow bg-gray-200 text-black border-none"
                placeholder="Ask something..."
              />
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chat;
