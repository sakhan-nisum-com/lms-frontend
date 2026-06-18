"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Users, ThumbsUp, Check, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import {
  INITIAL_QA_ITEMS,
  MOCK_PARTICIPANTS,
  buildInitialMessages,
  buildRandomMessage,
  type ChatMessage,
  type QAItem,
} from "@/lib/data/live-session"

interface LiveChatPanelProps {
  sessionTitle: string
  participantCount: number
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

export function LiveChatPanel({ participantCount }: LiveChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "qa">("chat")
  const [messages, setMessages] = useState<ChatMessage[]>(buildInitialMessages)
  const [inputValue, setInputValue] = useState("")
  const [qaItems, setQaItems] = useState<QAItem[]>(INITIAL_QA_ITEMS)
  const [showParticipants, setShowParticipants] = useState(false)
  const [newQAInput, setNewQAInput] = useState("")
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const msgCounter = useRef(10)

  // Auto-generate mock messages
  useEffect(() => {
    const delay = 8000 + Math.random() * 7000
    const iv = setInterval(() => {
      const id = `msg-auto-${Date.now()}-${msgCounter.current++}`
      setMessages((prev) => [...prev, buildRandomMessage(id)])
    }, delay)
    return () => clearInterval(iv)
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, activeTab])

  function sendMessage() {
    const text = inputValue.trim()
    if (!text) return
    const msg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      authorName: "Alex Johnson",
      authorInitials: "AJ",
      authorColor: "#10B981",
      text,
      timestamp: new Date(),
      isSelf: true,
    }
    setMessages((prev) => [...prev, msg])
    setInputValue("")
  }

  function toggleUpvote(id: string) {
    setQaItems((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, upvotes: q.upvotes + (q.hasUpvoted ? -1 : 1), hasUpvoted: !q.hasUpvoted }
          : q
      )
    )
  }

  function submitQA() {
    const text = newQAInput.trim()
    if (!text) return
    const newItem: QAItem = {
      id: `qa-${Date.now()}`,
      question: text,
      askedBy: "Alex Johnson",
      askedByInitials: "AJ",
      upvotes: 0,
      hasUpvoted: false,
      isAnswered: false,
    }
    setQaItems((prev) => [newItem, ...prev])
    setNewQAInput("")
  }

  function toggleAnswer(id: string) {
    setExpandedAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 48, borderBottom: "1px solid #334155" }}
      >
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare size={14} style={{ color: "#3B82F6" }} />
          Live Chat
        </span>
        <button
          type="button"
          onClick={() => setShowParticipants((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
          style={{
            backgroundColor: showParticipants ? "#3B82F620" : "#334155",
            color: showParticipants ? "#60A5FA" : "#94A3B8",
          }}
        >
          <Users size={12} />
          {participantCount}
        </button>
      </div>

      {/* Tabs */}
      {!showParticipants && (
        <div
          className="flex items-center px-1 flex-shrink-0"
          style={{ height: 40, borderBottom: "1px solid #334155" }}
        >
          {(["chat", "qa"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 h-full text-xs font-semibold transition-all"
              style={{
                color: activeTab === tab ? "#F8FAFC" : "#64748B",
                borderBottom: `2px solid ${activeTab === tab ? "#3B82F6" : "transparent"}`,
              }}
            >
              {tab === "chat" ? "Chat" : "Q&A"}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {showParticipants ? (
          <div className="p-3">
            <p className="text-xs font-semibold mb-3 px-1" style={{ color: "#64748B" }}>
              {participantCount} participants
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                  style={{
                    backgroundColor: p.isSelf ? "#3B82F615" : "#0F172A",
                    border: `1px solid ${p.isSelf ? "#3B82F630" : "#334155"}`,
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ width: 24, height: 24, backgroundColor: p.color, fontSize: 9 }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate leading-none">
                      {p.isSelf ? "You" : p.name.split(" ")[0]}
                    </p>
                    {p.isInstructor && (
                      <p className="text-[10px] mt-0.5" style={{ color: "#3B82F6" }}>Instructor</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "chat" ? (
          <div className="p-3 space-y-3">
            {messages.map((msg) => (
              msg.isSelf ? (
                <div key={msg.id} className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]" style={{ color: "#475569" }}>{formatTime(msg.timestamp)}</span>
                    <span className="text-xs font-semibold" style={{ color: "#10B981" }}>You</span>
                  </div>
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-xs leading-relaxed"
                    style={{ backgroundColor: "#3B82F620", color: "#E2E8F0", border: "1px solid #3B82F640" }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ width: 24, height: 24, backgroundColor: msg.authorColor, fontSize: 9, marginTop: 2 }}
                  >
                    {msg.authorInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold" style={{ color: msg.authorColor }}>{msg.authorName}</span>
                      <span className="text-[10px]" style={{ color: "#475569" }}>{formatTime(msg.timestamp)}</span>
                    </div>
                    <p
                      className="text-xs leading-relaxed px-3 py-2 rounded-2xl rounded-tl-sm"
                      style={{ backgroundColor: "#0F172A", color: "#CBD5E1", border: "1px solid #334155" }}
                    >
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Q&A tab
          <div className="p-3 space-y-2">
            {qaItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl p-3"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed text-white">{item.question}</p>
                    <p className="text-[10px] mt-1" style={{ color: "#475569" }}>
                      Asked by {item.askedBy}
                    </p>
                  </div>
                  {item.isAnswered && (
                    <span
                      className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "#10B98120", color: "#10B981" }}
                    >
                      <Check size={9} /> Answered
                    </span>
                  )}
                </div>

                {item.isAnswered && item.answeredAt && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => toggleAnswer(item.id)}
                      className="flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-80"
                      style={{ color: "#64748B" }}
                    >
                      {expandedAnswers.has(item.id) ? (
                        <><ChevronUp size={10} /> Hide answer</>
                      ) : (
                        <><ChevronDown size={10} /> Show answer</>
                      )}
                    </button>
                    {expandedAnswers.has(item.id) && (
                      <div
                        className="mt-1.5 px-2.5 py-2 rounded-lg text-xs leading-relaxed"
                        style={{ backgroundColor: "#10B98110", color: "#6EE7B7", border: "1px solid #10B98130" }}
                      >
                        {item.answeredAt}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid #334155" }}>
                  <button
                    type="button"
                    onClick={() => toggleUpvote(item.id)}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    style={{ color: item.hasUpvoted ? "#3B82F6" : "#64748B" }}
                  >
                    <ThumbsUp size={11} style={{ fill: item.hasUpvoted ? "#3B82F6" : "none" }} />
                    {item.upvotes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-3 py-2.5"
        style={{ borderTop: "1px solid #334155" }}
      >
        {!showParticipants && activeTab === "chat" ? (
          <div className="flex items-center gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none placeholder-slate-600"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="flex-shrink-0 p-2 rounded-xl transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              <Send size={13} />
            </button>
          </div>
        ) : !showParticipants && activeTab === "qa" ? (
          <div className="flex items-center gap-2">
            <input
              value={newQAInput}
              onChange={(e) => setNewQAInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitQA() } }}
              placeholder="Ask a question…"
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none placeholder-slate-600"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
            />
            <button
              type="button"
              onClick={submitQA}
              disabled={!newQAInput.trim()}
              className="flex-shrink-0 p-2 rounded-xl transition-colors disabled:opacity-30"
              style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
            >
              <Send size={13} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}