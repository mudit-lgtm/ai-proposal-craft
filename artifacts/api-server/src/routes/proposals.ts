import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateProposalBody, RegenerateSectionBody, GenerateFollowUpEmailBody } from "@workspace/api-zod";

const router = Router();

const SERVICE_TYPE_LABELS: Record<string, string> = {
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

const TONE_INSTRUCTIONS: Record<string, string> = {
  formal: "Use formal, professional language throughout. Avoid contractions and colloquialisms.",
  balanced: "Use clear, professional language that is approachable but authoritative.",
  conversational: "Use a friendly, conversational tone while remaining professional. Use contractions naturally.",
};

router.post("/proposals/generate", async (req, res) => {
  const parsed = GenerateProposalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const {
    serviceType,
    agencyName,
    agencyContact,
    clientName,
    clientCompany,
    clientIndustry,
    clientGoals,
    budget,
    language,
    tone,
    validityDays,
  } = parsed.data;

  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toneInstruction = tone ? (TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.balanced) : TONE_INSTRUCTIONS.balanced;
  const languageInstruction = language && language !== "English" ? `Write the entire proposal in ${language}.` : "Write in English.";

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const proposalData = JSON.parse(content);

    res.json({
      ...proposalData,
      serviceType,
      agencyName,
      clientName,
      clientCompany,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error generating proposal");
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

router.post("/proposals/regenerate-section", async (req, res) => {
  const parsed = RegenerateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sectionKey, serviceType, agencyName, clientName, clientCompany, clientGoals, tone, language } = parsed.data;

  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;
  const toneInstruction = tone ? (TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.balanced) : TONE_INSTRUCTIONS.balanced;
  const languageInstruction = language && language !== "English" ? `Write in ${language}.` : "Write in English.";

  const sectionDescriptions: Record<string, string> = {
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
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    res.json({ content: content.trim() });
  } catch (err) {
    req.log.error({ err }, "Error regenerating section");
    res.status(500).json({ error: "Failed to regenerate section" });
  }
});

router.post("/proposals/follow-up-email", async (req, res) => {
  const parsed = GenerateFollowUpEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { agencyName, clientName, clientCompany, serviceType } = parsed.data;
  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;

  const prompt = `Write a professional follow-up email from ${agencyName} to ${clientName} at ${clientCompany} about a ${serviceLabel} proposal that was previously sent.

The email should:
- Be warm but professional
- Reference the proposal without being pushy
- Ask if they have any questions
- Offer to schedule a call
- Be concise (3-4 short paragraphs)

Return ONLY valid JSON with exactly these keys:
{
  "subject": "A compelling email subject line",
  "body": "The full email body text with natural paragraph breaks using \\n\\n"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const emailData = JSON.parse(content);
    res.json(emailData);
  } catch (err) {
    req.log.error({ err }, "Error generating follow-up email");
    res.status(500).json({ error: "Failed to generate follow-up email" });
  }
});

export default router;
