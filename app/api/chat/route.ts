// app/api/ai/route.ts  (server-only)
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json();

    const serverApiKey = process.env.OPENAI_API_KEY;
    if (!serverApiKey || serverApiKey.trim() === "") {
      return Response.json(
        { error: "Server not configured with OpenAI API key", success: false },
        { status: 500 },
      );
    }

    const messages = [
      ...((conversationHistory ?? []).map((msg: any) => ({ role: msg.role, content: msg.content }))),
      { role: "user", content: message },
    ];

    const { text } = await generateText({
      model: openai("gpt-4o-mini", { apiKey: serverApiKey }),
      messages,
    });

    return Response.json({ response: text, success: true });
  } catch (error: any) {
    console.error("Error generating AI response:", error);

    let errorMessage = "Failed to generate response. Please try again.";
    const msg = String(error?.message ?? "");

    if (msg.includes("API key")) errorMessage = "Invalid OpenAI API key on server.";
    else if (msg.includes("quota")) errorMessage = "OpenAI API quota exceeded.";
    else if (msg.includes("rate limit")) errorMessage = "Rate limit exceeded. Try again later.";

    return Response.json({ error: errorMessage, success: false }, { status: 500 });
  }
}
