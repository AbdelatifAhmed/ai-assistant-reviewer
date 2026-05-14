const openaiConfig = require("../config/openai");

let PDFParseClass;
const loadPDFParser = () => {
  if (!PDFParseClass) {
    const pkg = require("pdf-parse");
    PDFParseClass = pkg.PDFParse;
  }
  return PDFParseClass;
};

const EXTRACTION_PROMPT = `
You are an expert CV/Resume parser. Analyze the provided CV/Resume and extract ALL information into this exact JSON structure. 
Be thorough and extract every detail available.

Return ONLY valid JSON with no markdown code blocks, no extra text:

{
  "name": "Full name of the candidate",
  "email": "email@example.com",
  "phone": "+1234567890",
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 - Dec 2022",
      "description": "Key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Computer Science",
      "institution": "University Name",
      "year": "2019"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does and your role",
      "technologies": ["React", "Node.js"]
    }
  ]
}

CV Content to analyze:
`;

class CVParserService {
  async parse(fileBuffer, mimeType, originalName) {
    try {
      if (mimeType === "application/pdf") {
        const rawText = await this.extractTextFromPDF(fileBuffer);
        return await this.parseText(rawText);
      }
      return await this.parseImage(fileBuffer, mimeType);
    } catch (error) {
      console.error("CV Parsing Error:", error.message);
      throw new Error(`Failed to parse CV: ${error.message}`);
    }
  }

  async extractTextFromPDF(buffer) {
    try {
      const PDFParse = loadPDFParser();
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();

      if (parser.destroy) {
        await parser.destroy();
      }

      if (!data.text || data.text.trim().length < 50) {
        throw new Error(
          "PDF appears to be empty or image-based. Try uploading as an image.",
        );
      }
      return data.text;
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async parseText(text) {
    const client = openaiConfig.client;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: EXTRACTION_PROMPT + text }],
      response_format: { type: "json_object" },
    });

    return this.formatResponse(response.choices[0].message.content, text);
  }

  async parseImage(imageBuffer, mimeType) {
    const client = openaiConfig.client;
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: EXTRACTION_PROMPT + "\n[Analyze the image above as a CV/Resume]",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    return this.formatResponse(response.choices[0].message.content, null);
  }

  formatResponse(responseText, rawText) {
    try {
      const cleaned = responseText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        rawText: rawText || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      };
    } catch (parseError) {
      console.warn("JSON parse failed, returning partial data:", parseError.message);
      return {
        name: "Unknown",
        email: "",
        phone: "",
        summary: responseText.substring(0, 500),
        skills: [],
        experience: [],
        education: [],
        projects: [],
        rawText: rawText || "",
      };
    }
  }
}

module.exports = new CVParserService();
