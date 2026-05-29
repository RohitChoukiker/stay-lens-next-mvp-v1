import { NextRequest, NextResponse } from "next/server";

// This API receives onboarding answers and returns the top 5 hotels (Claude-powered)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const onboardingAnswers = body.answers;

  // Call Claude API with onboarding answers
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key":  process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Given these onboarding answers as JSON: ${JSON.stringify(onboardingAnswers)}\nReturn a JSON array of the top 5 best-matching hotels for this user. Each hotel should have: id, name, city, state, vibe, stars, amenities, reviewCount, rating, tagline, images (array), pricePerNight. Only return the array, no explanation.`
        }
      ]
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
