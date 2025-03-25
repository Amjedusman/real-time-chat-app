const fetch = require('node-fetch');

app.post('/find-toxicity', async (req, res) => {
  try {
    const { text, useGroq } = req.body;
    console.log(`Processing toxicity check - UseGroq: ${useGroq}, Text: "${text}"`);

    let result;
    if (useGroq) {
      result = await checkToxicityWithGroq(text);
      // Ensure model is always set
      result.model = "gemma2-9b-it";
      console.log("Groq result:", result);
    } else {
      result = await checkToxicityWithOriginal(text);
      console.log("Original result:", result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in toxicity check:', error);
    res.status(500).json({ 
      error: 'Failed to check toxicity', 
      details: error.message,
      model: useGroq ? "gemma2-9b-it" : "original"
    });
  }
});

async function checkToxicityWithGroq(text) {
  const GROQ_API_KEY = "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";
  
  try {
    console.log("Calling Groq API with text:", text);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [
          {
            role: "system",
            content: "You are a toxicity detection system. For the given message, respond with a JSON object in this exact format: {\"is_toxic\": true/false, \"reason\": \"brief explanation\"}"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw Groq API response:", data);

    // Parse the JSON response from the model
    let groqResult;
    try {
      groqResult = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse Groq response:", e);
      groqResult = { is_toxic: false, reason: "Failed to parse response" };
    }

    // Format response to match the expected structure
    return {
      predicted_class: groqResult.is_toxic ? 'toxic' : 'non-toxic',
      toxic_probability: groqResult.is_toxic ? 0.9 : 0.1,
      non_toxic_probability: groqResult.is_toxic ? 0.1 : 0.9,
      model: "gemma2-9b-it",
      text: text,
      reason: groqResult.reason
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
} 