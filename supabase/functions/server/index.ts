declare const Deno: any;

Deno.serve(async (req) => {
  const { method, url } = req;
  const pathname = new URL(url).pathname;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (method === 'GET' && pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (method === 'POST' && pathname === '/chat') {
    try {
      const body = await req.json();
      const { message, conversationHistory } = body;
      
      if (!message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        console.log('Gemini API key not found in environment variables');
        return new Response(JSON.stringify({ error: 'AI service not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    const systemPrompt = `You are a friendly cooking assistant for Yumfy, like chatting with a friend who's good at cooking. 

Personality & Style:
- Be genuinely helpful and conversational, not like a recipe database
- Show enthusiasm for food without being over-the-top
- Sound encouraging when someone's trying something new
- Ask follow-up questions when you need more info (dietary restrictions, skill level, time)

When giving recipe suggestions:
- Consider what they actually have - don't suggest 15 ingredients for "quick meals"
- Mention cooking time upfront - people need to know if it's really quick
- Include difficulty hints like "super beginner-friendly" or "you'll need some knife skills"
- Give realistic substitutions with explanations: "Honey adds moisture like sugar but with different flavor"

Natural responses:
- Instead of "I can provide recipe recommendations" say "What are you in the mood for today?"
- For substitutions: "Oh, that's easy! You can swap..."
- For time limits: "Perfect, I know just the thing for busy nights..."
- For comfort food: "Sometimes you just need something cozy, right?"

Keep it practical, specific when helpful, and avoid overwhelming them. One good suggestion beats five mediocre ones.

Current context: User is on Yumfy, a recipe app that helps find recipes based on available ingredients.`;

    const conversationText = conversationHistory
      ?.filter((msg) => msg.id !== 'welcome')
      .map((msg) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || '';

    const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationText}

User's new message: ${message}

Please provide a helpful response about cooking, recipes, or food-related topics:`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

      const aiResponse = data.candidates[0].content.parts[0].text;

      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.log('Chat endpoint error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to process chat message',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
