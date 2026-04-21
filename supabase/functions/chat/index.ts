import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert career guidance AI assistant for higher education students. Provide clear, practical, and personalized career advice. Use markdown formatting.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("Missing LOVABLE_API_KEY");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get last user message
    const lastUserMsg = [...messages]
      .reverse()
      .find((m: any) => m.role === "user");

    let careerContext = "";

    if (lastUserMsg?.content) {
      const userText = lastUserMsg.content.toLowerCase();

      const keywords = userText
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w: string) => w.length > 3);

      if (keywords.length > 0) {
        const { data: occupations } = await supabase.rpc(
          "search_occupations_by_skills",
          {
            skill_keywords: keywords.slice(0, 8),
            max_results: 5,
          }
        );

        if (occupations && occupations.length > 0) {
          const details = await Promise.all(
            occupations.slice(0, 3).map(async (occ: any) => {
              const { data } = await supabase.rpc("get_occupation_details", {
                p_onet_code: occ.onet_soc_code,
              });
              return data;
            })
          );

          careerContext += "\n\n--- CAREER DATA ---\n";

          for (const d of details) {
            if (!d?.occupation) continue;

            careerContext += `\n${d.occupation.title}\n`;
            careerContext += `${d.occupation.description || ""}\n`;

            if (d.top_skills?.length) {
              careerContext += `Skills: ${d.top_skills
                .slice(0, 5)
                .map((s: any) => s.name)
                .join(", ")}\n`;
            }

            if (d.education?.length) {
              careerContext += `Education data available\n`;
            }
          }

          careerContext += "--- END CAREER DATA ---\n";
        }
      }
    }

    const augmentedMessages = [...messages];

    if (careerContext && augmentedMessages.length > 0) {
      const lastIndex = augmentedMessages.length - 1;
      augmentedMessages[lastIndex] = {
        ...augmentedMessages[lastIndex],
        content:
          augmentedMessages[lastIndex].content + careerContext,
      };
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...augmentedMessages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: "AI request failed",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!response.body) {
      throw new Error("Empty response from AI");
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});