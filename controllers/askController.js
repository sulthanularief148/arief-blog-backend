import pool from "../config/db.js";
import OpenAI from "openai";
import pdfkit from "pdfkit";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ---- Helper Functions ----

// Detect violent or sexual content
function isViolentOrSexual(query) {
    const badWords = [
        "kill",
        "murder",
        "rape",
        "sex",
        "sexual",
        "violence",
        "blood",
        "weapon",
    ];
    return badWords.some((word) => query.toLowerCase().includes(word));
}

// Only allow health/gym/food/routine
function isOutsideDomain(query) {
    const allowed = ["health", "food", "diet", "gym", "routine", "wellness", "breakfast", "sleep", "dinner"];
    return !allowed.some((w) => query.toLowerCase().includes(w));
}

// Generate PDF from text
function generatePdf(answerText, slug) {
    const pdfDir = path.join(process.cwd(), "public", "pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const filePath = path.join(pdfDir, `${slug}-${Date.now()}.pdf`);
    const doc = new pdfkit();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(14).text(answerText, { align: "left" });
    doc.end();
    return `/pdfs/${path.basename(filePath)}`;
}

// ---- Main Controller ----
export const askBlogAgent = async (req, res) => {
    const { slug, query, wantPdf } = req.body;

    try {
        // 1️⃣ Policy checks
        if (isViolentOrSexual(query)) {
            return res.json({
                answerBullets: [
                    "This question isn't related to the blog topic. I can't assist with violent or sexual content. May I help you with something else related to the blog?",
                ],
            });
        }

        if (isOutsideDomain(query)) {
            return res.json({
                answerBullets: ["I don't know."],
            });
        }

        // 2️⃣ Fetch the blog content from DB
        const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ?", [slug]);
        if (!rows.length) {
            return res.status(404).json({ error: "Blog not found" });
        }

        const blog = rows[0];
        const parsedContent =
            typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;

        // Combine all section text for RAG-style context
        const contextText = parsedContent
            .map((sec) => `Section: ${sec.subHeading}\n${sec.description}`)
            .join("\n\n");

        // 3️⃣ Build the AI prompt
        const prompt = `
You are an expert AI assistant for Arief's blog readers.
You must:
- Answer only health, gym, food, and routine related queries.
- Search through the following blog context.
- If answer not found, use general wellness and food knowledge.
- Always answer politely, step-by-step, in bullet points.
- End with a short "How I arrived at this answer" summary.

BLOG CONTEXT:
${contextText}

READER QUESTION:
${query}
`;

        // 4️⃣ Ask OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
        });

        const answer = completion.choices[0].message.content;

        // 5️⃣ Create PDF if requested
        let pdfUrl = null;
        if (wantPdf) {
            pdfUrl = generatePdf(answer, slug);
        }

        // 6️⃣ Respond
        res.json({
            answerBullets: answer.split("\n").filter(Boolean),
            pdfUrl,
            source: "blog+AI",
        });
    } catch (error) {
        console.error("AI Agent Error:", error);
        res.status(500).json({ error: "AI agent failed to respond" });
    }
};
