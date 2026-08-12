import 'dotenv/config';
console.log('LLM_MODEL_FAST:', process.env.LLM_MODEL_FAST);
console.log('LLM_BASE_URL:', process.env.LLM_BASE_URL);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present (starts with ' + process.env.GEMINI_API_KEY.slice(0, 8) + ')' : 'Absent');
