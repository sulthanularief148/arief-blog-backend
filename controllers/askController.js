// backend/controllers/askController.js
import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import PDFDocument from "pdfkit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------- Helpers -------------------- */

// Basic policy word check (expand as needed)
function containsBadWords(q) {
    if (!q) return false;
    const bad = [
        "kill",
        "murder",
        "rape",
        "porn",
        "sexual",
        "explosive",
        "bomb",
        "suicide",
        "child abuse",
    ];
    const s = q.toLowerCase();
    return bad.some((w) => s.includes(w));
}

// Very small sanitizer (trim & normalize whitespace)
function normalizeText(s = "") {
    return s.replace(/\s+/g, " ").trim();
}

// Detect topical hints from blog content (simple heuristic)
function detectBlogCategory(fullText = "") {
    const t = fullText.toLowerCase();
    const travelKeys = ["travel", "trip", "journey", "adventure", "destination", "solo travel", "backpack", "spiritual", "retreat"];
    const healthKeys = ["health", "fitness", "gym", "workout", "diet", "wellness", "breakfast", "sleep", "nutrition", "morning"];
    const foodKeys = ["food", "recipe", "cook", "meal", "breakfast", "dinner", "nutrition"];
    let score = { travel: 0, health: 0, food: 0 };

    travelKeys.forEach((k) => { if (t.includes(k)) score.travel++; });
    healthKeys.forEach((k) => { if (t.includes(k)) score.health++; });
    foodKeys.forEach((k) => { if (t.includes(k)) score.food++; });

    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] === 0) return "general";
    return best[0]; // travel | health | food
}

// Build user/system prompt for OpenAI
function buildPrompts(blog, fullText, query, blogCategory) {
    const systemPrompt = `
You are an expert assistant for the blog site "arief.info". 
- Answer politely and professionally in bullet points.
- Keep answers concise (3-8 bullets) and include at the end one short "How I arrived" line (chain-of-thought summary).
- Use ONLY the blog content provided as context when it is relevant.
- If the question is outside the blog's domain (non-health/food/gym/routine/travel), reply with: "I don't know."
- If the blog doesn't contain the required info, reply: "I couldn't find that in this blog. Would you like me to search the web?" (do not call web search here).
- Do NOT provide violent or sexual content (refuse politely).
`;

    const userPrompt = `
Blog Title: ${blog.title || "(no title)"} 
Blog Category (detected): ${blogCategory}
Blog Content (excerpts):
${fullText.slice(0, 4000)}   // (truncated if long)

User question:
${query}

Answer format:
- Use bullet points (each line starting with "- ").
- Final line should be: "How I arrived: <two-line summary>"
`;

    return { systemPrompt, userPrompt };
}

// Convert AI response text into bullet array
function splitToBullets(aiText) {
    if (!aiText || typeof aiText !== "string") return [];
    const lines = aiText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // If lines already look like bullets, keep them.
    const bullets = [];
    lines.forEach((l) => {
        if (l.startsWith("-")) bullets.push(l.replace(/^-+\s?/, "").trim());
        else bullets.push(l);
    });

    return bullets;
}

// Generate simple PDF and return relative public URL
async function generatePdfFile(slug, text) {
    const pdfDir = path.join(process.cwd(), "public", "pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const safeSlug = slug.replace(/[^a-z0-9\-]/gi, "-").toLowerCase();
    const filename = `${safeSlug}-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40 });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);
            doc.fontSize(12).text(text, { align: "left" });
            doc.end();
            stream.on("finish", () => {
                resolve(`/pdfs/${filename}`);
            });
            stream.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}

/* -------------------- Controller -------------------- */

/**
 * POST /api/ask/ask
 * body: { slug, query, wantPdf }
 */
export const askBlogAgent = async (req, res) => {
    try {
        const body = req.body || {};
        const slug = body.slug;
        const query = normalizeText(body.query || "");
        const wantPdf = !!body.wantPdf;

        if (!slug) return res.status(400).json({ error: "Missing slug in request" });
        if (!query) return res.status(400).json({ error: "Missing query in request" });

        // Policy checks
        if (containsBadWords(query)) {
            return res.json({
                answerBullets: [
                    "This question isn't related to the blog topic. I can't assist with violent or sexual content. May I help you with something else related to the blog?"
                ],
                source: "policy"
            });
        }

        // Fetch blog from MySQL
        const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ? LIMIT 1", [slug]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ answerBullets: ["Blog not found."] });
        }
        const blog = rows[0];

        // Parse blog.content safely
        let parsedContent = [];
        try {
            parsedContent = typeof blog.content === "string" ? JSON.parse(blog.content) : blog.content;
            if (!Array.isArray(parsedContent)) parsedContent = [{ subHeading: blog.title || "", description: String(blog.content || "") }];
        } catch (err) {
            // fallback: treat content as simple text
            parsedContent = [{ subHeading: blog.title || "", description: String(blog.content || "") }];
        }

        // Compose fullText from blog sections (for prompt)
        const fullText = parsedContent
            .map((s) => `${s.subHeading || ""}\n${s.description || ""}`)
            .join("\n\n");

        // Detect category automatically
        const blogCategory = detectBlogCategory(fullText);

        // Build prompts
        const { systemPrompt, userPrompt } = buildPrompts(blog, fullText, query, blogCategory);

        // Call OpenAI Chat Completion
        let aiText = "";
        try {
            const resp = await openai.chat.completions.create({
                model: "gpt-4o-mini", // adjust model if you prefer
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.6,
                max_tokens: 600,
            });

            aiText = resp?.choices?.[0]?.message?.content?.trim() || "";
        } catch (err) {
            console.error("OpenAI error:", err);
            // graceful fallback: small template answer
            aiText = "I couldn't generate a response right now. Please try again later.";
        }

        // If AI returned "I don't know" or asked to web search, handle accordingly
        const lowerAi = aiText.toLowerCase();
        if (lowerAi.includes("i don't know") || lowerAi.includes("i dont know")) {
            return res.json({
                answerBullets: ["I don't know."],
                source: "ai",
            });
        }

        // If AI suggests web search wording, propagate needWebSearch
        const needWebSearch = lowerAi.includes("search the web") || lowerAi.includes("web search") || lowerAi.includes("would you like me to search the web");

        // Convert to bullets
        const bullets = splitToBullets(aiText);

        // Optionally generate PDF
        let pdfUrl = null;
        if (wantPdf) {
            try {
                const pdfText = bullets.join("\n\n");
                pdfUrl = await generatePdfFile(slug, pdfText);
            } catch (err) {
                console.error("PDF generation failed:", err);
                // continue without pdf
            }
        }

        // Return response
        return res.json({
            answerBullets: bullets,
            pdfUrl,
            needWebSearch: needWebSearch || false,
            blogCategory,
            source: "ai-generated",
        });

    } catch (error) {
        console.error("askBlogAgent error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export default askBlogAgent;
