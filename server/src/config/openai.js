const { OpenAI } = require('openai');

class OpenAIConfig {
  constructor() {
    this.instance = null;
  }

  get client() {
    if (!this.instance) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in environment variables');
      }
      this.instance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.instance;
  }
}

module.exports = new OpenAIConfig();
