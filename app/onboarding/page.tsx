
"use client";

import { SiteNav } from "@/components/SiteNav";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Option = {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
};

type Question = {
  key: string;
  title: string;
  helper: string;
  multi: boolean;
  options: Option[];
  layer: number;
  layerLabel: string;
};

type Answers = Record<string, string | string[]>;

// ─── Branching blueprint (from docx) ─────────────────────────────────────────
// This tells us WHAT question to ask and in WHICH order.
// Claude generates the actual wording + options for each slot.

type QuestionSlot = {
  id: string;
  layer: number;
  layerLabel: string;
  context: string; // what Claude should focus on for this slot
};

function buildSlots(answers: Answers): QuestionSlot[] {
  const dest = answers["destination_type"] as string | undefined;
  const group = answers["group_type"] as string | undefined;

  const slots: QuestionSlot[] = [
    {
      id: "Q1", layer: 1, layerLabel: "Context",
      context: "Ask about destination type in India. Options must be: beach/coast, mountains/hills, city/town, countryside/rural. Use Indian examples (Goa, Himalayas, Mumbai, Coorg).",
    },
    {
      id: "Q2", layer: 1, layerLabel: "Context",
      context: "Ask about travel group composition. Options: solo, couple, family with kids, friends group.",
    },
    {
      id: "Q3", layer: 2, layerLabel: "Universal",
      context: "Ask about budget using a concrete forced-choice between two hypothetical hotels at the same Indian destination. Use INR pricing (₹3,000 / ₹6,000 / ₹12,000 per night). Make it feel real and honest.",
    },
    {
      id: "Q4", layer: 2, layerLabel: "Universal",
      context: "Ask about holiday pace: packed/active days vs mix vs restful. Frame it as 'what does your ideal day look like'.",
    },
    {
      id: "Q5", layer: 2, layerLabel: "Universal",
      context: "Ask about food preference: eat out at local restaurants vs hotel dining vs mix. Mention Indian dining context.",
    },
  ];

  // Layer 3 – destination branch
  if (!dest || dest === "beach") {
    slots.push(
      {
        id: "Q6a", layer: 3, layerLabel: "Beach",
        context: "Beach-specific: ask what the traveller is mainly there for — water sports/active vs sunbathing/relaxed vs both. Use Indian beach context (Goa, Andaman, Kerala).",
      },
      {
        id: "Q7a", layer: 3, layerLabel: "Beach",
        context: "Beach-specific: ask about acceptable distance from hotel to beach — beachfront only vs short walk vs shuttle is fine.",
      }
    );
  } else if (dest === "mountain") {
    slots.push(
      {
        id: "Q6b", layer: 3, layerLabel: "Mountains",
        context: "Mountain-specific: ask what they're mainly there for — hiking/trekking vs scenery/photography vs skiing/snow sports. Use Indian mountain context (Manali, Shimla, Darjeeling, Leh).",
      },
      {
        id: "Q7b", layer: 3, layerLabel: "Mountains",
        context: "Mountain-specific: ask what they want after a day outdoors — spa/recovery vs cosy fireplace and food vs just a great bed. Frame as 'back at the hotel after a full day outside'.",
      }
    );
  } else if (dest === "city") {
    slots.push(
      {
        id: "Q6c", layer: 3, layerLabel: "City",
        context: "City-specific: ask what their city focus is — culture/sights vs food/restaurants vs nightlife/social. Use Indian city context (Delhi, Mumbai, Jaipur, Kolkata).",
      },
      {
        id: "Q7c", layer: 3, layerLabel: "City",
        context: "City-specific: ask about hotel location preference — near transport hubs vs tourist centre/walkable to sights vs local neighbourhood off the tourist trail.",
      }
    );
  } else if (dest === "countryside") {
    slots.push(
      {
        id: "Q6d", layer: 3, layerLabel: "Countryside",
        context: "Countryside-specific: ask how quiet/remote they want — totally isolated vs near a village vs working farm/estate. Use Indian rural context (Coorg, Rajasthan villages, Kerala backwaters).",
      },
      {
        id: "Q7d", layer: 3, layerLabel: "Countryside",
        context: "Countryside-specific: ask what type of property appeals — full-service country resort vs self-catering cottage vs boutique homestay/B&B.",
      }
    );
  }

  // Layer 4 – group branch
  if (group === "family") {
    slots.push({
      id: "Q8a", layer: 4, layerLabel: "Family",
      context: "Family-specific: ask what keeps the kids happiest — kids club/structured activities vs pool access vs outdoor space to run around. Make it warm and relatable.",
    });
  } else if (group === "couple") {
    slots.push({
      id: "Q8b", layer: 4, layerLabel: "Couple",
      context: "Couple-specific: ask what this trip is mainly about — romance/intimacy vs adventure together vs decompression/switching off. Keep it honest and non-cliché.",
    });
  } else if (group === "friends") {
    slots.push({
      id: "Q8c", layer: 4, layerLabel: "Friends",
      context: "Friends group-specific: ask what the group is mainly there for — party/social/nightlife vs active adventures together vs chill pool days and good food.",
    });
  }
  // solo = no layer 4 question

  return slots;
}

// ─── Claude question generator ────────────────────────────────────────────────

async function generateQuestion(
  slot: QuestionSlot,
  answers: Answers,
  stepIndex: number,
  totalSlots: number
): Promise<Question> {
  const previousQA = Object.entries(answers)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  const prompt = `You are helping travellers find their perfect hotel in India.
This is question ${stepIndex + 1} of ${totalSlots} in a branching preference questionnaire.

YOUR TASK FOR THIS QUESTION:
${slot.context}

${previousQA ? `PREVIOUS ANSWERS (use these for context and personalisation):\n${previousQA}\n` : ""}

RULES:
- Write in a warm, conversational tone — like a knowledgeable friend
- Options should feel like real, honest human choices — not generic labels
- Add relevant Indian context (cities, experiences, cultural nuances)
- emoji field: single emoji per option that visually represents the choice
- description: one short sentence that makes the option feel vivid and real
- 3-4 options only
- multi: false unless the question genuinely benefits from multi-select
- key must be a unique snake_case identifier for this question's answer

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "key": "snake_case_key",
  "title": "Question text here?",
  "helper": "Short warm subtitle (max 10 words)",
  "multi": false,
  "options": [
    { "value": "value1", "label": "Display Label", "emoji": "🏖️", "description": "One vivid sentence." },
    { "value": "value2", "label": "Display Label", "emoji": "⛰️", "description": "One vivid sentence." }
  ]
}`;

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.map((c: any) => c.text || "").join("") ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    layer: slot.layer,
    layerLabel: slot.layerLabel,
  };
}

// ─── Layer colours ────────────────────────────────────────────────────────────

const LAYER_COLORS: Record<number, string> = {
  1: "#6366f1",
  2: "#0ea5e9",
  3: "#f59e0b",
  4: "#10b981",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  // Add SiteNav at the top
  const { user, loading } = useAuth();
  const router = useRouter();

  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loadingQ, setLoadingQ] = useState(false);
  const [saving, setSaving] = useState(false);
  const fetchedSlots = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Build current flow
  const slots = buildSlots(answers);
  const totalSteps = slots.length;
  const currentSlot = slots[stepIndex];

  // Fetch question for current slot whenever it changes
  useEffect(() => {
    if (!user || !currentSlot) return;
    const slotId = currentSlot.id;
    if (fetchedSlots.current.has(slotId)) return;
    fetchedSlots.current.add(slotId);

    setLoadingQ(true);
    generateQuestion(currentSlot, answers, stepIndex, totalSteps)
      .then((q) => setQuestions((prev) => ({ ...prev, [slotId]: q })))
      .catch(() => {
        toast.error("Could not load question, please try again.");
        fetchedSlots.current.delete(slotId); // allow retry
      })
      .finally(() => setLoadingQ(false));
  }, [user, currentSlot?.id]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-foreground/40">
        Loading…
      </div>
    );
  }

  const q = currentSlot ? questions[currentSlot.id] : undefined;
  const isLast = stepIndex === totalSteps - 1;
  const progress = ((stepIndex + 1) / Math.max(totalSteps, 8)) * 100;
  const layerColor = LAYER_COLORS[currentSlot?.layer ?? 1] ?? "#6366f1";
  const currentValue = q ? answers[q.key] : undefined;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const setAnswer = (val: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
  };

  const toggleMulti = (val: string) => {
    if (!q) return;
    const arr: string[] = Array.isArray(currentValue) ? currentValue : [];
    const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
    setAnswers((prev) => ({ ...prev, [q.key]: next }));
  };

  const goNext = async () => {
    if (isLast) {
      await finish();
    } else {
      setStepIndex((s) => s + 1);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) router.push("/");
    else setStepIndex((s) => s - 1);
  };

  const finish = async (skip = false) => {
    setSaving(true);
    try {
      localStorage.setItem("onboarding_completed", "true");
      localStorage.setItem("onboarding_answers", JSON.stringify(answers));
      toast.success(skip ? "Saved. You can update these anytime." : "Preferences saved!");
    } catch {
      toast.error("Could not save, but continuing…");
    } finally {
      setSaving(false);
      router.push("/hotels");
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loadingQ || !q) {
    return (
      <div className="h-full bg-muted/50 grid place-items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-3xl shadow-[var(--shadow-luxe)] p-8 sm:p-12 md:p-16 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-1.5 transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: layerColor }}
            />
            <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/40">
                Question {stepIndex + 1} of {totalSteps}
              </span>
            </div>

            <div className="animate-pulse space-y-4">
              <div className="h-5 bg-muted rounded-full w-24 mb-6" />
              <div className="h-8 bg-muted rounded-xl w-3/4" />
              <div className="h-4 bg-muted rounded-lg w-1/2" />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-foreground/40 text-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent inline-block"
                    style={{ animation: `bounce 1.2s infinite ${i * 0.2}s` }}
                  />
                ))}
              </div>
              Claude is crafting your next question…
            </div>
          </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      <SiteNav hideHotels hideProfile />
      <div className="min-h-screen bg-muted/50 grid place-items-center px-6 py-12">
        <div className="w-full">
        <div className="bg-card rounded-3xl shadow-[var(--shadow-luxe)] p-8 sm:p-12 md:p-16 relative overflow-hidden w-full">

          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-1.5 transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: layerColor }}
          />

          {/* Header row */}
          <div className="flex justify-between items-center mb-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/40">
              Question {stepIndex + 1} of {totalSteps}
            </span>
            <button
              onClick={() => finish(true)}
              disabled={saving}
              className="text-[10px] font-bold tracking-widest uppercase text-accent hover:underline disabled:opacity-50"
            >
              Skip all
            </button>
          </div>

          {/* Layer badge + AI badge */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <div
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ color: layerColor, backgroundColor: `${layerColor}18` }}
            >
              Layer {q.layer} · {q.layerLabel}
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
              <span>✦</span> Claude AI
            </div>
          </div>

          {/* Question */}
          <h2 className="font-serif text-3xl md:text-4xl mb-3">{q.title}</h2>
          <p className="text-foreground/60 mb-10">{q.helper}</p>

          {/* Options */}
          <div
            className={`grid gap-3 ${
              q.options.length > 3 || q.multi ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {q.options.map((opt) => {
              const selected = q.multi
                ? (Array.isArray(currentValue) ? currentValue : []).includes(opt.value)
                : currentValue === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => q.multi ? toggleMulti(opt.value) : setAnswer(opt.value)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all ${
                    selected
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  {opt.emoji && (
                    <span className="text-2xl block mb-2">{opt.emoji}</span>
                  )}
                  <div className="font-semibold">{opt.label}</div>
                  {opt.description && (
                    <div className="text-sm text-foreground/55 mt-1">{opt.description}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={goBack}
              className="text-foreground/50 font-medium px-2 hover:text-foreground transition-colors"
            >
              {stepIndex === 0 ? "Cancel" : "← Back"}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={goNext}
                className="text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Skip this
              </button>
              <button
                onClick={goNext}
                disabled={saving}
                className="rounded-full bg-foreground text-background px-8 py-3.5 font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : isLast ? "Finish →" : "Next →"}
              </button>
            </div>
          </div>

          {/* Dot progress */}
          <div className="mt-8 flex gap-1.5 justify-center">
            {slots.map((slot, i) => (
              <div
                key={slot.id}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === stepIndex ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: i <= stepIndex ? layerColor : "var(--border)",
                  opacity: i < stepIndex ? 0.5 : 1,
                }}
              />
            ))}
          </div>

        </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}

