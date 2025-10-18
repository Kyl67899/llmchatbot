// app/api/send-message/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, conversationId, orgId, content, role } = body
    if (!userId || !conversationId || !orgId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Build user message object returned to client
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }

    // Call OpenAI Chat Completions (gpt-4o-mini / gpt-4.1 etc) — adjust model as appropriate
    const OPENAI_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_KEY) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change to available model
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text().catch(() => "")
      return NextResponse.json({ error: "LLM error", details: text }, { status: 502 })
    }

    const openaiJson = await openaiRes.json();
    // adapt to provider shape; OpenAI chat completions: choices[0].message.content
    const assistantContent =
      openaiJson?.choices?.[0]?.message?.content ??
      (openaiJson?.choices?.[0]?.text ?? "Sorry, I couldn't generate a response.")

    const assistantMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: assistantContent,
      createdAt: new Date().toISOString(),
    }

    // creditsUsed: you can compute based on tokens returned by provider; here we use 1
    const creditsUsed = 1

    // Optionally: persist messages + deduct credits in DB here (recommended)
    // await prisma.message.create({ data: { ... } })
    // await prisma.organization.update({ where: { id: orgId }, data: { credits: { decrement: creditsUsed } } })

    return NextResponse.json({ userMessage, assistantMessage, creditsUsed });
  } catch (err) {
    console.error("send-message error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




