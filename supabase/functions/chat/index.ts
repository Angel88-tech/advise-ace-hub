import knowledgeBase from "./knowledge_base.json" with { type: "json" }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const PROJECT_CONTEXT = `
هذا الموقع هو "Career Recommendation System" - نظام توصية مهنية لطلاب جامعة الملك خالد (King Khalid University - College of Computer Science).

الفريق:
Hana Mohammad Kamal
Renad Abdullah Alqahtani
Sarah Mohammed Mofareh
Maryam Mohammed Bakhsh

المشرفة:
Ms. Asfia Sabahath

الهدف:
مساعدة الطلاب على اكتشاف المسارات المهنية المناسبة لهم بناءً على مهاراتهم واهتماماتهم.

كيف يعمل الموقع:
1. الطالب يسجل حساب ويدخل بياناته مثل التخصص والمعدل والجامعة.
2. الطالب يحدد مستوى مهاراته من 0 إلى 5.
3. النظام يستخدم خوارزمية Cosine Similarity لمقارنة مهارات الطالب مع متطلبات الوظائف من قاعدة بيانات O*NET.
4. النظام يعرض أفضل المهن المناسبة.
5. النظام يعرض Skill Gap Analysis لتوضيح المهارات الناقصة.
6. النظام يقترح موارد تعليمية ومنح ومرشدين.

التقنيات المستخدمة:
React + Vite للواجهة.
Supabase / PostgreSQL للخلفية وقاعدة البيانات.
Cosine Similarity للمطابقة.

مصدر بيانات المهن:
O*NET Taxonomy، وهي قاعدة بيانات أمريكية معيارية لتصنيف المهن والمهارات.

Job Zones:
Zone 1: تحضير قليل جداً.
Zone 2: تحضير قليل.
Zone 3: تحضير متوسط.
Zone 4: تحضير عالٍ، عادة بكالوريوس.
Zone 5: تحضير عالٍ جداً، غالباً دراسات عليا أو خبرة متقدمة.
`

function detectArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

function searchOccupations(query: string, limit = 8): any[] {
  const q = query.toLowerCase()
  const tokens = q.split(/\s+/).filter((t) => t.length > 2)

  if (tokens.length === 0) return []

  const scored = (knowledgeBase as any[]).map((occ) => {
    const hay = `${occ.t ?? ""} ${occ.d ?? ""} ${(occ.s || []).join(" ")}`.toLowerCase()
    let score = 0

    for (const tok of tokens) {
      if (hay.includes(tok)) score += 1
    }

    if ((occ.t ?? "").toLowerCase().includes(q)) score += 5

    return { occ, score }
  })

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.occ)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const lastUser =
      [...messages].reverse().find((m: any) => m.role === "user")?.content ?? ""

    const isArabic = detectArabic(lastUser)
    const matches = searchOccupations(lastUser, 8)

    const occupationContext =
      matches.length > 0
        ? `\n\nالمهن ذات الصلة بسؤال المستخدم من قاعدة بيانات O*NET:\n${matches
            .map(
              (o: any) =>
                `- ${o.t ?? "Unknown"} (Job Zone ${o.z ?? "?"}): ${o.d ?? ""} | أهم المهارات: ${(o.s || []).join(", ")}`,
            )
            .join("\n")}`
        : ""

    const systemPrompt = `
أنت مساعد ذكي للموقع التالي. مهمتك مساعدة الطلاب.

${PROJECT_CONTEXT}
${occupationContext}

قواعد مهمة:
1. اللغة: ${isArabic ? "أجب بالعربية الفصحى المبسطة." : "Respond in English."}
2. كن ودوداً ومختصراً ومباشراً.
3. عند سؤال عن مهنة معينة، استخدم بيانات O*NET أعلاه.
4. إذا سألك الطالب "كيف استخدم الموقع؟" اشرح الخطوات الست المذكورة أعلاه.
5. إذا سألك عن Skill Gap، وضّح أنها المهارات الناقصة بين مهارات الطالب ومتطلبات المهنة.
6. إذا ذكر الطالب مهاراته، اقترح مهن مناسبة من البيانات واشرح السبب.
7. لا تخترع معلومات. إذا لم تكن متأكداً، قل ذلك بصدق.
8. لا تجب على أسئلة خارج نطاق المهن والموقع والتوجيه المهني.
9. اجعل الإجابة كاملة ومنظمة وغير مقطوعة.
`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-6)],
        stream: true,
        temperature: 0.3,
        max_tokens: 1800,
      }),
    })

    if (!response.ok) {
      const t = await response.text()
      console.error("Groq error:", response.status, t)

      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (e) {
    console.error("career-chat error:", e)

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})