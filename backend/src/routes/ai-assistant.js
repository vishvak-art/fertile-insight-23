const express = require('express');
const router = express.Router();

// AI assistant endpoint
router.post('/assist', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Add delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    let reply;
    let suggestions = [];
    let resources = [];
    
    const text = message.toLowerCase();
    
    // Check if we have OpenAI API key for advanced responses
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        // Use OpenAI for more sophisticated responses
        const openaiResponse = await callOpenAI(message, context);
        reply = openaiResponse.reply;
        suggestions = openaiResponse.suggestions;
        resources = openaiResponse.resources;
      } catch (error) {
        console.error('OpenAI API error, falling back to rule-based:', error.message);
        // Fall through to rule-based response
      }
    }
    
    // Rule-based fallback responses
    if (!reply) {
      if (text.includes('ph') || text.includes('acidity') || text.includes('alkalin')) {
        reply = "Soil pH affects nutrient availability. Most crops prefer 6.0-7.0. Low pH needs lime, high pH may need sulfur amendments.";
        suggestions = ["Test soil pH", "Apply lime for acidic soil", "Add sulfur for alkaline soil"];
        resources = ["pH testing guide", "Lime application rates"];
        
      } else if (text.includes('nitrogen') || text.includes(' n ') || text.includes('npk')) {
        reply = "Nitrogen is essential for leaf growth and green color. Deficiency shows as yellowing leaves. Apply urea, ammonium sulfate, or compost.";
        suggestions = ["Check nitrogen levels", "Apply nitrogen fertilizer", "Use organic compost"];
        resources = ["Nitrogen deficiency guide", "Fertilizer calculator"];
        
      } else if (text.includes('fertilizer') || text.includes('nutrient')) {
        reply = "Choose fertilizers based on soil test results. NPK ratios should match your soil's needs. Consider organic options for long-term health.";
        suggestions = ["Get soil analysis", "Calculate fertilizer needs", "Try organic alternatives"];
        resources = ["Fertilizer guide", "NPK calculator"];
        
      } else if (text.includes('crop') || text.includes('plant') || text.includes('grow')) {
        reply = "Crop selection depends on soil fertility, pH, and climate. High-fertility soils support heavy feeders like corn, while low-fertility suits legumes.";
        suggestions = ["Check recommended crops", "Consider soil requirements", "Plan crop rotation"];
        resources = ["Crop selection guide", "Planting calendar"];
        
      } else if (text.includes('organic') || text.includes('compost')) {
        reply = "Organic matter improves soil structure, water retention, and nutrient availability. Aim for 3-5% organic matter content.";
        suggestions = ["Add compost", "Test organic matter", "Use cover crops"];
        resources = ["Composting guide", "Organic farming tips"];
        
      } else if (text.includes('water') || text.includes('irrigation') || text.includes('moisture')) {
        reply = "Proper soil moisture is crucial for nutrient uptake. Most crops need 1-2 inches of water per week. Check soil moisture regularly.";
        suggestions = ["Monitor soil moisture", "Improve drainage", "Install irrigation"];
        resources = ["Irrigation guide", "Moisture management"];
        
      } else {
        reply = "I can help with soil fertility, pH, nutrients, fertilizers, and crop recommendations. What specific soil challenge are you facing?";
        suggestions = ["Ask about soil pH", "Get fertilizer advice", "Check crop recommendations", "Learn about nutrients"];
        resources = ["Soil testing guide", "Fertility basics"];
      }
    }

    res.json({
      success: true,
      reply,
      suggestions,
      resources,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in AI assistant:', error);
    res.status(500).json({ 
      error: 'Assistant failed',
      message: error.message 
    });
  }
});

async function callOpenAI(message, context) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a soil fertility expert assistant. Provide concise, actionable advice about soil health, fertilizers, and crop recommendations. 
          Context: ${context ? JSON.stringify(context) : 'No soil data provided'}
          
          Always format your response as JSON with:
          - reply: 2-3 sentence answer
          - suggestions: array of 3-4 actionable suggestions
          - resources: array of 2-3 helpful resource names`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      reply: content,
      suggestions: ["Get soil test", "Apply recommended fertilizers", "Monitor crop health"],
      resources: ["Soil guide", "Fertilizer calculator"]
    };
  }
}

module.exports = router;