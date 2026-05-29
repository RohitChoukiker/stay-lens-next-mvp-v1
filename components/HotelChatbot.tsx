"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
  filters?: string[];
};

type FilterUpdate = {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
  vibe?: string | null;
  amenities?: string[];
};

type Props = {
  onFiltersChange: (filters: FilterUpdate) => void;
};

const SUGGESTIONS = [
  "Luxury stay in Goa",
  "Budget hotels under ₹5000",
  "Hotels with a pool",
  "Pet-friendly 5 star",
  "Romantic stay in Rajasthan",
];

const SYSTEM_PROMPT = `You are a helpful hotel search assistant for an India hotel booking platform.
When the user describes what kind of hotel they want, extract filter preferences and respond in JSON format ONLY.

JSON schema:
{
  "reply": "friendly short reply in English",
  "filters": {
    "query": "search keyword like city/hotel name (string or null)",
    "minPrice": number or null (in INR per night),
    "maxPrice": number or null (in INR per night),
    "minStars": 0 | 3 | 4 | 5 or null,
    "vibe": one of ["Luxury", "Heritage", "Beach", "Wellness", "Adventure", "Boutique", "Business"] or null,
    "amenities": array of strings from ["Pool", "Spa", "Gym", "Pet-friendly", "Restaurant", "Free WiFi", "Bar", "Airport Transfer", "Kids Club"] or []
  },
  "filterLabels": ["human readable label for each applied filter"]
}

Rules:
- Reply must be warm, short, in Hinglish
- Only include filters the user actually mentioned
- filterLabels should be short readable tags like "Goa", "Under ₹5,000", "Pool", "5★"
- If user says "budget" assume maxPrice 5000, "luxury" assume minStars 5
- For vibe: beach-related → "Beach", palace/heritage → "Heritage", relaxation/spa → "Wellness", etc.`;

export default function HotelChatbot({ onFiltersChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! 👋 Tell me what kind of hotel you're looking for — budget, location, vibe, or any specific amenity. I'll set the filters for you automatically!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [history, setHistory] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  async function sendMessage(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    const newHistory = [...history, { role: "user", content: userText }];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });

      const data = await response.json();
      const rawText =
        data.content
          ?.map((c: { type: string; text?: string }) => c.text || "")
          .join("") ?? "";

      let reply =
        "Sorry, I didn't quite get that — could you give more details?";
      let filterLabels: string[] = [];

      try {
        const clean = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        reply = parsed.reply ?? reply;
        filterLabels = parsed.filterLabels ?? [];

        const f: FilterUpdate = {};
        const pf = parsed.filters ?? {};
        if (pf.query != null) f.query = pf.query;
        if (pf.minPrice != null) f.minPrice = pf.minPrice;
        if (pf.maxPrice != null) f.maxPrice = pf.maxPrice;
        if (pf.minStars != null) f.minStars = pf.minStars;
        if ("vibe" in pf) f.vibe = pf.vibe;
        if (pf.amenities != null) f.amenities = pf.amenities;

        if (Object.keys(f).length > 0) onFiltersChange(f);
      } catch {
        reply = rawText || reply;
      }

      const assistantMsg = { role: "assistant", content: rawText };
      setHistory([...newHistory, assistantMsg]);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, filters: filterLabels },
      ]);
      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Something went wrong, please try again in a moment!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating Chat Panel */}
      <div
        className={`fixed bottom-24 right-7 z-50 w-[360px] flex flex-col rounded-[20px] border border-border bg-card overflow-hidden transition-all duration-200 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        }`}
        style={{
          height: 520,
          boxShadow:
            "0 24px 60px oklch(0.165 0 0 / 0.16), 0 8px 20px oklch(0.165 0 0 / 0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center shrink-0 text-accent text-base">
            ✦
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Hotel Assistant</div>
            <div className="text-[10px] text-foreground/45 mt-0.5">
              Filter hotels by chatting with me
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:bg-muted transition-colors text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[86%] px-3.5 py-2.5 text-[13px] leading-[1.55] ${
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-[14px] rounded-br-[4px]"
                    : "bg-muted text-foreground rounded-[14px] rounded-bl-[4px]"
                }`}
              >
                {msg.text}
              </div>
              {msg.filters && msg.filters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.filters.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide"
                      style={{
                        background: "oklch(0.71 0.097 80 / 0.12)",
                        color: "oklch(0.52 0.09 80)",
                        border: "0.5px solid oklch(0.71 0.097 80 / 0.3)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="flex items-center gap-1 px-3.5 py-2.5 bg-muted rounded-[14px] rounded-bl-[4px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-foreground/30 inline-block"
                    style={{
                      animation: `bounce 1.2s infinite ${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="whitespace-nowrap text-[11px] px-3 py-1.5 border border-border rounded-full bg-card text-foreground/55 hover:bg-muted hover:border-accent hover:text-foreground transition-all shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 px-3 pt-2 pb-3.5 border-t border-border shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Beachfront hotel in Goa under ₹8,000..."
            rows={1}
            className="flex-1 resize-none border border-border rounded-xl px-3 py-2.5 text-[13px] bg-muted/60 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent leading-[1.45] max-h-24 min-h-[38px]"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-[10px] bg-foreground flex items-center justify-center text-background disabled:opacity-30 shrink-0 hover:opacity-80 active:scale-95 transition-all text-sm"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xl"
        style={{ boxShadow: "0 8px 24px oklch(0.165 0 0 / 0.22)" }}
        aria-label="Open hotel assistant"
      >
        {isOpen ? "✕" : "✦"}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold flex items-center justify-center text-white border-2 border-white">
            1
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
