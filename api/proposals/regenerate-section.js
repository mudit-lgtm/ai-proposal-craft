import OpenAI from "openai";

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

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sectionKey, serviceType, agencyName, clientName, clientCompany, clientGoals, tone, language } = req.body;

  if (!sectionKey || !serviceType || !agencyName || !clientName || !clientCompany) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;
  const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.balanced;
  const languageInstruction = language && language !== "English" ? `Write in ${language}.` : "Write in English.";

  const sectionDescriptions = {
    executiveSummary: "A compelling 2-3 paragraph executive summary that captures the opportunity and demonstrates understanding of the client's needs",
    clientAnalysis: "2-3 paragraphs analyzing the client's current situation, industry landscape, challenges, and opportunities",
    proposedStrategy: "3-4 paragraphs detailing the comprehensive strategy tailored to achieve the client's goals, including specific tactics and approaches",
    deliverablesAndTimeline: "A detailed breakdown of all deliverables organized by phase (Phase 1, Phase 2, Phase 3), with specific activities and milestones",
    teamAndExpertise: "2-3 paragraphs about the team structure, expertise, and relevant experience the agency brings",
    pricingAndPackages: "Clear pricing breakdown including what's included in the engagement, monthly retainer details, and optional add-ons",
    termsAndConditions: "Professional terms covering contract duration, payment terms, revision policy, confidentiality, and next steps",
  };

  const sectionDesc = sectionDescriptions[sectionKey] || "A comprehensive section relevant to the proposal";

  const prompt = `You are an expert digital marketing proposal writer. Rewrite the "${sectionKey}" section for a ${serviceLabel} proposal.

${languageInstruction}
${toneInstruction}

Context:
- Agency: ${agencyName}
- Client: ${clientName} at ${clientCompany}
- Service: ${serviceLabel}
- Goals: ${clientGoals}

Write ONLY the "${sectionKey}" section. ${sectionDesc}. Return ONLY the plain text content (no JSON wrapper, no section title, just the section body text). Make it fresh, specific, and different from a generic template.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "No response from AI" });
    }

    return res.json({ content: content.trim() });
  } catch (err) {
    console.error("Error regenerating section:", err);
    return res.status(500).json({ error: "Failed to regenerate section" });
  }
}
