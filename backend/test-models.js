require('dotenv').config();
const { Groq } = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function main() {
  try {
    const models = await groq.models.list();
    console.log("AVAILABLE MODELS:");
    models.data.forEach(m => console.log(m.id));
  } catch (e) {
    console.error("Error fetching models:", e.message);
  }
}

main();
