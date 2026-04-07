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

  const { agencyName, clientName, clientCompany, serviceType } = req.body;

  if (!agencyName || !clientName || !clientCompany || !serviceType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
      return res.status(500).json({ error: "No response from AI" });
    }

    return res.json(JSON.parse(content));
  } catch (err) {
    console.error("Error generating follow-up email:", err);
    return res.status(500).json({ error: "Failed to generate follow-up email" });
  }
}
