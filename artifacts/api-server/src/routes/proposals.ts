import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateProposalBody } from "@workspace/api-zod";

const router = Router();

const SERVICE_TYPE_LABELS: Record<string, string> = {
  seo: "Search Engine Optimization (SEO)",
  website: "Website Design & Development",
  "google-ads": "Google & Meta Ads Management",
  "social-media": "Social Media Marketing",
  orm: "Online Reputation Management",
  "lead-generation": "Lead Generation Campaigns",
  branding: "Branding & Creative Services",
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
  } = parsed.data;

  const serviceLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `You are an expert digital marketing proposal writer. Create a professional business proposal for ${agencyName} to present to ${clientName} at ${clientCompany}.

Service Type: ${serviceLabel}
Agency: ${agencyName}${agencyContact ? `\nAgency Contact: ${agencyContact}` : ""}
Client: ${clientName}
Company: ${clientCompany}${clientIndustry ? `\nIndustry: ${clientIndustry}` : ""}
Goals: ${clientGoals}${budget ? `\nBudget: ${budget}` : ""}
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
      model: "gpt-5.2",
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

export default router;
