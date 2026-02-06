const express = require('express');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Using GPT-5.2 - OpenAI's most intelligent model (Jan 2026)
// "The best model for coding and agentic tasks across industries"
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

STUDY RESOURCES (Recommend these):
- NCERTs: Class 6-12 (History, Geography, Polity, Science, Economics)
- Laxmikanth: Indian Polity (Bible for Polity)
- Spectrum: Modern India
- Shankar IAS Environment
- Economic Survey (key chapters)
- Monthly magazines: Yojana, Kurukshetra, PIB

YOUR CAPABILITIES:
1. Explain any UPSC topic with clarity and depth
2. Generate unlimited practice MCQs with detailed explanations
3. Create topic-wise and full-length mock tests
4. Analyze answer patterns and identify weak areas
5. Provide daily/weekly study schedules
6. Connect current affairs to static syllabus
7. Teach elimination techniques for tough questions
8. Motivate and keep the student focused

RESPONSE STYLE:
- Be encouraging but rigorous — this is a competitive exam
- Use bullet points and structured formats for clarity
- For MCQs: Always explain WHY each option is right/wrong
- Include memory tricks, mnemonics where helpful
- Reference specific book chapters when recommending study material
- Be concise but comprehensive — respect the student's time

IMPORTANT: The student is starting from zero. Build confidence while being honest about the work required. 113 days is tight but achievable with focused, intelligent preparation.

When discussing strategy, remember:
- Week 1-4: Foundation building (NCERTs, basic concepts)
- Week 5-10: Deep dive into each subject + daily current affairs
- Week 11-14: Revision + Mock tests + Previous year analysis
- Week 15-16: Final revision, weak areas, confidence building

Let's crack this exam together! 🇮🇳`;

// Store conversation history per session
const conversations = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    
    const history = conversations.get(sessionId);
    history.push({ role: 'user', content: message });
    
    // Keep last 30 messages for good context
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
});

app.get('/api/clear', (req, res) => {
  const { sessionId = 'default' } = req.query;
  conversations.delete(sessionId);
  res.json({ success: true });
});

// Endpoint to get study plan
app.get('/api/study-plan', (req, res) => {
  res.json(STUDY_PLAN);
});

const STUDY_PLAN = {
  overview: {
    startDate: "2026-01-31",
    examDate: "2026-05-24",
    totalDays: 113,
    totalWeeks: 16,
    dailyHours: "8-10 recommended"
  },
  phases: [
    {
      name: "Phase 1: Foundation",
      weeks: "1-4 (Feb 1 - Feb 28)",
      focus: "Building strong conceptual base with NCERTs",
      subjects: [
        { name: "History", tasks: ["NCERT 6-12", "Ancient → Medieval → Modern sequence", "Art & Culture basics"] },
        { name: "Geography", tasks: ["NCERT 6-12", "Physical → Indian → World sequence", "Map work daily"] },
        { name: "Polity", tasks: ["Laxmikanth Chapters 1-25", "Constitutional framework", "Fundamental Rights & DPSP"] },
        { name: "Current Affairs", tasks: ["Start daily newspaper habit", "Monthly compilation", "Link to static"] }
      ],
      dailyRoutine: "6 hrs static + 1 hr current affairs + 1 hr revision"
    },
    {
      name: "Phase 2: Deep Dive",
      weeks: "5-10 (Mar 1 - Apr 11)",
      focus: "Subject mastery + PYQ analysis",
      subjects: [
        { name: "History", tasks: ["Spectrum Modern India", "Post-independence", "World History basics"] },
        { name: "Geography", tasks: ["GC Leong for Physical", "Indian Geography depth", "Economic Geography"] },
        { name: "Polity", tasks: ["Laxmikanth complete", "Governance issues", "Constitutional amendments"] },
        { name: "Economy", tasks: ["NCERT + Ramesh Singh basics", "Budget 2026 analysis", "Economic Survey"] },
        { name: "Science", tasks: ["NCERT Science", "Space & Defense", "Sci-Tech current affairs"] },
        { name: "Environment", tasks: ["Shankar IAS", "Biodiversity hotspots", "Climate conventions"] }
      ],
      dailyRoutine: "5 hrs static + 2 hrs current affairs + 1 hr MCQ practice + 30 min PYQ"
    },
    {
      name: "Phase 3: Consolidation",
      weeks: "11-14 (Apr 12 - May 9)",
      focus: "Revision + Mock Tests + Weak areas",
      tasks: [
        "Complete 20+ full-length mock tests",
        "Analyze every mistake thoroughly",
        "Subject-wise revision cycles",
        "Focus on weak areas identified",
        "Previous 10 years PYQ completion",
        "Current affairs consolidation (6 months)"
      ],
      dailyRoutine: "1 mock test + 3 hrs analysis + 3 hrs revision + 1 hr current affairs"
    },
    {
      name: "Phase 4: Final Sprint",
      weeks: "15-16 (May 10 - May 23)",
      focus: "Confidence building + Light revision",
      tasks: [
        "Only revision, no new topics",
        "Quick facts and static GK",
        "2-3 light mock tests",
        "Current affairs last 3 months focus",
        "Relax and sleep well",
        "Exam day strategy practice"
      ],
      dailyRoutine: "Light revision + Rest + Mental preparation"
    }
  ],
  weeklyTargets: [
    "Week 1: History NCERT (Ancient + Medieval)",
    "Week 2: History NCERT (Modern) + Geography NCERT (Physical)",
    "Week 3: Geography NCERT (India) + Polity Laxmikanth (1-15)",
    "Week 4: Polity Laxmikanth (16-35) + Revision Week 1-3",
    "Week 5: Spectrum Modern India + PYQ History",
    "Week 6: Geography depth + Economic Geography",
    "Week 7: Economy basics + Budget + Current Affairs catch-up",
    "Week 8: Science & Tech + NCERT Science revision",
    "Week 9: Environment complete + Biodiversity",
    "Week 10: Polity revision + Governance + Ethics basics",
    "Week 11: Mock Test 1-5 + Full revision cycle 1",
    "Week 12: Mock Test 6-10 + Weak area focus",
    "Week 13: Mock Test 11-15 + PYQ intensive",
    "Week 14: Mock Test 16-20 + Current affairs consolidation",
    "Week 15: Light revision + 2 mocks + Rest",
    "Week 16: Final prep + Confidence + Exam ready"
  ]
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3456;
  app.listen(PORT, () => {
    console.log(`🏛️ UPSC Prelims Tutor (GPT-5.2) running at http://localhost:${PORT}`);
    console.log(`📅 ${STUDY_PLAN.overview.totalDays} days until Prelims!`);
  });
}

// Export for Vercel serverless
module.exports = app;
