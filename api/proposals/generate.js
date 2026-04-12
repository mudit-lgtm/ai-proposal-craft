import { getClientIp, checkRateLimit, incrementUsage } from "../_ratelimit.js";

const SERVICE_TYPE_LABELS = {
  seo: "Search Engine Optimization (SEO)",
  website: "Website Design & Development",
  "google-ads": "Google & Meta Ads Management",
  "social-media": "Social Media Marketing",
  orm: "Online Reputation Management",
  "lead-generation": "Lead Generation Campaigns",
  branding: "Branding & Creative Services",
  "email-marketing": "Email Marketing",
  "content-marketing": "Content Marketing & Blogging",
  "video-marketing": "Video Marketing & Production",
  "influencer-marketing": "Influencer Marketing",
  ppc: "Pay-Per-Click (PPC) Advertising",
  "e-commerce": "E-Commerce Marketing",
  analytics: "Analytics & Reporting",
  "app-marketing": "App Store Optimization & Mobile Marketing",
};

const TONE_INSTRUCTIONS = {
  formal: "Use formal, professional language throughout. Avoid contractions and colloquialisms.",
  balanced: "Use clear, professional language that is approachable but authoritative.",
  conversational: "Use a friendly, conversational tone while remaining professional. Use contractions naturally.",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const limit = await checkRateLimit(ip);

  if (!limit.allowed) {
    return res.status(429).json({
      error: "free_limit_reached",
      message: `You have used all ${limit.max} free proposals. Upgrade to Pro for unlimited access.`,
      used: limit.used,
      max: limit.max,
    });
  }

  const {
    serviceType, agencyName, agencyContact, clientName, clientCompany,
    clientIndustry, clientGoals, budget, language, tone, validityDays,
  } = req.body;

  if (!serviceType || !agencyName || !clientName || !clientCompany || !clientGoals) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured on server." });
  }

  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.balanced;
  const languageInstruction = language && language !== "English"
    ? `Write the entire proposal in ${language}.`
    : "Write in English.";

  const prompt = `You are an expert digital marketing proposal writer. Create a professional business proposal for ${agencyName} to present to ${clientName} at ${clientCompany}.

${languageInstruction}
${toneInstruction}

Service Type: ${serviceLabel}
Agency: ${agencyName}${agencyContact ? `\nAgency Contact: ${agencyContact}` : ""}
Client: ${clientName}
Company: ${clientCompany}${clientIndustry ? `\nIndustry: ${clientIndustry}` : ""}
Goals: ${clientGoals}${budget ? `\nBudget: ${budget}` : ""}${validityDays ? `\nProposal valid for: ${validityDays} days from ${today}` : ""}
Date: ${today}

Write a comprehensive, professional proposal with exactly these 7 sections. Return ONLY valid JSON with these exact keys:
{
  "executiveSummary": "A compelling 2-3 paragraph executive summary that captures the opportunity and demonstrates understanding of the client's needs",
  "clientAnalysis": "2-3 paragraphs analyzing the client's current situation, industry landscape, challenges, and opportunities specific to ${clientCompany}",
  "proposedStrategy": "3-4 paragraphs detailing the comprehensive ${serviceLabel} strategy tailored to achieve ${clientName}'s goals, including specific tactics and approaches",
  "deliverablesAndTimeline": "A detailed breakdown of all deliverables organized by month/phase (Phase 1, Phase 2, Phase 3), with specific activities and milestones",
  "teamAndExpertise": "2-3 paragraphs about the team structure, expertise, and relevant experience that ${agencyName} brings to this engagement",
  "pricingAndPackages": "Clear pricing breakdown${budget ? ` starting around ${budget}` : ""}, including what's included in the engagement, monthly retainer details, and any optional add-ons",
  "termsAndConditions": "Professional terms covering contract duration, payment terms, revision policy, confidentiality, and next steps to move forward"
}

Make it highly professional, specific to the service type and client industry, and persuasive. Use industry-specific terminology. Each section should be substantive (not generic filler).`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json();
      const errMsg = errData?.error?.message || "Gemini API error";
      console.error("Gemini API error:", errMsg);
      return res.status(502).json({ error: errMsg });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(502).json({ error: "Empty response from Gemini" });
    }

    // Clean markdown code fences if Gemini wraps response
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let proposalData;
    try {
      proposalData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "Raw:", cleaned.slice(0, 200));
      return res.status(502).json({ error: "Invalid JSON from Gemini. Try again." });
    }

    await incrementUsage(ip);

    return res.json({
      ...proposalData,
      serviceType,
      agencyName,
      clientName,
      clientCompany,
      generatedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Error generating proposal:", err);
    return res.status(500).json({ error: "Failed to generate proposal" });
  }
}
