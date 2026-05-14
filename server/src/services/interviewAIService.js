const { ChatOpenAI } = require("@langchain/openai");
const {
  HumanMessage,
  AIMessage,
  SystemMessage,
} = require("@langchain/core/messages");

class InterviewAIService {
  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      maxTokens: 1024,
    });
  }

  buildSystemPrompt(cvData, jobRole, jobLevel) {
    const skills = cvData.skills?.join(", ") || "various technologies";
    const projects =
      cvData.projects
        ?.map((p) => `"${p.name}" (${p.technologies?.join(", ")})`)
        .join(", ") || "various projects";
    const experience =
      cvData.experience?.map((e) => `${e.title} at ${e.company}`).join(", ") ||
      "previous companies";

    return `You are Alex, a Senior Hiring Manager conducting a technical interview at a top tech company.

CANDIDATE PROFILE:
- Name: ${cvData.name || "the candidate"}
- Target Role: ${jobRole || "Software Engineer"} (${jobLevel || "Mid"} Level)
- Skills: ${skills}
- Projects: ${projects}
- Experience: ${experience}
- Summary: ${cvData.summary || "No summary provided"}

INTERVIEW RULES (CRITICAL - FOLLOW STRICTLY):
1. Ask EXACTLY ONE question at a time. Never ask multiple questions.
2. Wait for the candidate's response before asking the next question.
3. Questions MUST be tailored to their specific projects, skills, and experience from the CV above.
4. Start with a warm, professional introduction, then dive into technical questions.
5. Progress: Introduction > Technical Skills > Project Deep-Dives > Problem-Solving > Behavioral.
6. Be encouraging but professional. React naturally to their answers.
7. Keep your messages concise (2-4 sentences max per turn).
8. After asking 8-12 questions, if the user says "finish" or you're prompted to evaluate, provide the evaluation.

START: Greet the candidate by name, introduce yourself, and ask your FIRST question about one of their most impressive projects or key skills.`;
  }

  async startInterview(cvData, jobRole, jobLevel) {
    const systemPrompt = this.buildSystemPrompt(cvData, jobRole, jobLevel);
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage("Please start the interview."),
    ];

    const response = await this.model.invoke(messages);
    return response.content;
  }

  async continueInterview(cvData, messageHistory, userMessage, jobRole, jobLevel) {
    const systemPrompt = this.buildSystemPrompt(cvData, jobRole, jobLevel);
    const langchainMessages = [new SystemMessage(systemPrompt)];

    for (const msg of messageHistory) {
      if (msg.role === "assistant") {
        langchainMessages.push(new AIMessage(msg.content));
      } else if (msg.role === "user") {
        langchainMessages.push(new HumanMessage(msg.content));
      }
    }

    langchainMessages.push(new HumanMessage(userMessage));

    const response = await this.model.invoke(langchainMessages);
    return response.content;
  }

  async generateFeedback(cvData, messageHistory) {
    const transcript = messageHistory
      .filter((m) => m.role !== "system")
      .map(
        (m) =>
          `${m.role === "user" ? "CANDIDATE" : "INTERVIEWER"}: ${m.content}`,
      )
      .join("\n\n");

    const feedbackPrompt = `You are an expert HR analyst. Analyze this interview transcript for ${cvData.name || "the candidate"} and provide a comprehensive evaluation.

CANDIDATE SKILLS FROM CV: ${cvData.skills?.join(", ")}
CANDIDATE PROJECTS: ${cvData.projects?.map((p) => p.name).join(", ")}

INTERVIEW TRANSCRIPT:
${transcript}

Provide evaluation as ONLY valid JSON (no markdown, no code blocks):
{
  "overallScore": <0-100 integer>,
  "technicalScore": <0-100 integer>,
  "communicationScore": <0-100 integer>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific actionable improvement1", "improvement2", "improvement3"],
  "detailedAnalysis": "2-3 paragraph detailed analysis of their performance",
  "recommendation": "<one of: Strongly Recommend | Recommend | Neutral | Not Recommend>"
}`;

    const messages = [new HumanMessage(feedbackPrompt)];
    const response = await this.model.invoke(messages);

    try {
      const cleaned = response.content
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        overallScore: 70,
        technicalScore: 70,
        communicationScore: 70,
        strengths: ["Completed the interview", "Engaged with questions"],
        weaknesses: ["Could not fully evaluate due to parsing error"],
        improvements: ["Continue practicing technical interviews"],
        detailedAnalysis: response.content,
        recommendation: "Neutral",
      };
    }
  }
}

module.exports = new InterviewAIService();
