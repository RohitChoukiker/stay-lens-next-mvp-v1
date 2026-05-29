import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const onboardingAnswers = body.answers;

    if (!onboardingAnswers) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    const systemPrompt = `You are a luxury hotel recommendation expert specialising in Indian hospitality. 
You have deep knowledge of hotels across India — from beach resorts in Goa to hill retreats in Himachal, 
city hotels in Mumbai/Delhi/Jaipur to jungle lodges in Coorg and Kerala backwaters.
Always respond with ONLY valid JSON — no markdown, no explanation, no preamble.`;

    const userPrompt = `A traveller has completed a detailed preference questionnaire. 
Based on their answers below, recommend the top 6 best-matching real hotels in India.

TRAVELLER PREFERENCES:
${JSON.stringify(onboardingAnswers, null, 2)}

Return a JSON array of exactly 6 hotel objects. Each object must have these fields:
- id: unique string slug (e.g. "taj-lake-palace-udaipur")
- name: full hotel name
- city: city name
- state: Indian state name
- vibe: 2-3 word vibe descriptor (e.g. "Heritage Romance", "Beach Bliss", "Mountain Retreat")
- stars: number (3, 4, or 5)
- rating: decimal from 4.0 to 5.0
- reviewCount: realistic integer (e.g. 1240)
- tagline: one punchy sentence that captures WHY this matches this traveller specifically
- pricePerNight: integer in INR (e.g. 8500)
- amenities: array of 4-6 strings (e.g. ["Infinity pool", "Spa", "Free breakfast"])
- images: array with exactly one string — a publicly accessible image URL of this specific hotel. 
  Use real Unsplash URLs in this format: https://images.unsplash.com/photo-{id}?w=800&q=80
  Pick photos that genuinely represent the hotel type and location.
  If unsure, use: "/images/placeholder.jpg"
- matchReasons: array of 2-3 short strings explaining why this hotel matches the traveller's answers

Order the hotels from best match to good match. Only return the JSON array — nothing else.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Claude API error:", errData);
      return NextResponse.json(
        { error: "Claude API request failed", details: errData },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Extract raw text from Claude's response
    const rawText: string = data.content
      ?.map((block: { type: string; text?: string }) =>
        block.type === "text" ? (block.text ?? "") : ""
      )
      .join("") ?? "";

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // Parse and validate
    let hotels;
    try {
      hotels = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw response:", rawText);
      return NextResponse.json(
        { error: "Failed to parse Claude response as JSON", raw: rawText },
        { status: 500 }
      );
    }

    if (!Array.isArray(hotels)) {
      return NextResponse.json(
        { error: "Expected a JSON array of hotels", received: typeof hotels },
        { status: 500 }
      );
    }

    return NextResponse.json({ hotels });

  } catch (err) {
    console.error("Unexpected error in /api/recommend:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}