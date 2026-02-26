"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Conversation, ConversationContent, ConversationEmptyState } from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import type { LeadDetailData } from "@/components/leads/types"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export function ChatsClient({ lead }: { lead: LeadDetailData }) {
  const router = useRouter()
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch(`/api/leads/${lead.id}/chats`)
        if (res.ok) {
          const data = await res.json()
          setChats(data.chats || [])
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [lead.id])

  const sortedChats = [...chats].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto md:h-[calc(100vh-11rem)]">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="-ml-2" onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Lead
        </Button>
      </div>

      <div className="h-[75vh] md:h-full">
        <div className="flex h-full flex-col rounded-lg border bg-background">
          <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
            <span className="font-medium text-sm">
              Chat with {lead.name || lead.email || "Anonymous"}
            </span>
          </div>

          <Conversation className="flex-1 min-h-0">
            <ConversationContent
              className="gap-4 p-4"
              scrollClassName="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading chats...
                </div>
              ) : sortedChats.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12 text-muted-foreground" />}
                  title="No chats available"
                  description="This lead doesn't have any chat messages yet"
                />
              ) : (
                sortedChats.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent className="text-sm max-w-[85%] break-words">
                      <span>{message.content}</span>
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
          </Conversation>
        </div>
      </div>
    </div>
  )
}
