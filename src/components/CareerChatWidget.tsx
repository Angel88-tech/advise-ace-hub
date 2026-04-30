import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Msg = { role: "user" | "assistant"; content: string }

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const CHAT_URL = `${SUPABASE_URL}/functions/v1/chat`

const WELCOME_AR =
  "مرحباً! 👋 أنا المساعد الذكي لنظام التوصية المهنية. اسألني عن المهن، المهارات، أو كيفية استخدام الموقع."
const WELCOME_EN =
  "Hi! 👋 I'm the smart assistant for the Career Recommendation System. Ask me about careers, skills, or how to use the site."

export const CareerChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME_AR + "\n\n" + WELCOME_EN },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "إعدادات Supabase ناقصة. تأكدي من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env",
        },
      ])
      return
    }

    setInput("")

    const newMessages: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: newMessages.filter((m, i) => !(i === 0 && m.role === "assistant")),
        }),
      })

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "")
        let errMsg = "حدث خطأ. حاول مرة أخرى."

        try {
          const j = JSON.parse(errText)
          if (j.error) errMsg = j.error
          if (j.msg) errMsg = j.msg
          if (j.message) errMsg = j.message
        } catch {}

        setMessages((p) => [...p, { role: "assistant", content: errMsg }])
        return
      }

      const rawText = await resp.text()
      let assistantReply = "لم أستطع إنشاء رد الآن. حاول مرة أخرى."

      try {
        const lines = rawText.split("\n")
        let finalText = ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue

          const json = line.slice(6).trim()
          if (!json || json === "[DONE]") continue

          const parsed = JSON.parse(json)
          const delta = parsed.choices?.[0]?.delta?.content

          if (delta) finalText += delta
        }

        if (finalText.trim()) assistantReply = finalText
      } catch {
        if (rawText.trim()) assistantReply = rawText
      }

      setMessages((p) => [...p, { role: "assistant", content: assistantReply }])
    } catch (e) {
      console.error(e)
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "تعذّر الاتصال بالخادم. تحقق من الاتصال." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open career assistant chat"
        className={cn(
          "fixed bottom-5 right-5 z-20 h-14 w-14 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200 hover:scale-110 hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className={cn(
            "fixed bottom-24 right-5 z-20",
            "w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[70vh]",
            "bg-card border border-border rounded-2xl shadow-2xl",
            "flex flex-col overflow-hidden",
            "animate-in fade-in slide-in-from-bottom-4 duration-200",
          )}
        >
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">Career Assistant</div>
              <div className="text-xs opacity-80 leading-tight">المساعد المهني الذكي</div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-background"
          >
            {messages.map((m, i) => {
              const rtl = isArabic(m.content)

              return (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    dir={rtl ? "rtl" : "ltr"}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              )
            })}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="اكتب سؤالك... / Type your question..."
                rows={1}
                dir={isArabic(input) ? "rtl" : "ltr"}
                className={cn(
                  "flex-1 resize-none rounded-xl border border-input bg-background",
                  "px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  "max-h-32 min-h-[40px]",
                )}
              />

              <Button
                size="icon"
                onClick={send}
                disabled={loading || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}