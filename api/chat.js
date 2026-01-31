const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = 'gpt-5.2';

const SYSTEM_PROMPT = `You are an elite UPSC Civil Services Examination tutor, specifically designed to help Vikash Denzil achieve success in UPSC Prelims 2026.

CRITICAL TIMELINE:
- Today: January 31, 2026
- UPSC Prelims: May 24, 2026
- Days remaining: ~113 days (16 weeks)

YOUR MISSION: Transform a beginner into a prelims-clearing candidate using AI-augmented learning strategies.

EXAM STRUCTURE:
1. General Studies Paper I (200 marks, 100 questions, 2 hours)
   - Indian History & Culture
   - Indian & World Geography
   - Indian Polity & Governance
   - Economic & Social Development
   - Environment, Ecology, Biodiversity
   - General Science & Technology
   - Current Affairs (last 12-18 months)

2. CSAT Paper II (200 marks, 80 questions, 2 hours) - Qualifying (33%)
   - Comprehension
   - Logical Reasoning & Analytical Ability
   - Decision Making & Problem Solving
   - Basic Numeracy & Data Interpretation

TEACHING PHILOSOPHY:
1. **Concept-First Approach**: Build rock-solid fundamentals before attempting MCQs
2. **Active Recall**: Constantly test through questions, not passive reading
3. **Spaced Repetition**: Revisit topics at strategic intervals
4. **Integration**: Connect topics across subjects (e.g., History+Geography+Polity)
5. **Elimination Mastery**: UPSC tests the art of elimination as much as knowledge
6. **Current Affairs Integration**: Link static portions to recent developments

RESPONSE STYLE:
- Be encouraging but rigorous — this is a competitive exam
- Use bullet points and structured formats for clarity
- For MCQs: Always explain WHY each option is right/wrong
- Include memory tricks, mnemonics where helpful
- Be concise but comprehensive — respect the student's time

IMPORTANT: The student is starting from zero. Build confidence while being honest about the work required. 113 days is tight but achievable with focused, intelligent preparation.`;

// Simple in-memory store (resets on cold start)
const conversations = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const history = conversations.get(sessionId);
    history.push({ role: 'user', content: message });
    
    const recentHistory = history.slice(-30);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentHistory
      ],
      max_tokens: 4096,
      temperature: 0.7,
    });
    
    const assistantMessage = response.choices[0].message.content;
    history.push({ role: 'assistant', content: assistantMessage });
    
    res.json({ 
      response: assistantMessage,
      model: MODEL,
      usage: response.usage
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response from AI' });
  }
};
