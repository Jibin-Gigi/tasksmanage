import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '')

export async function POST(request: Request) {
  try {
    const { entries } = await request.json()

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries provided for analysis' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.GOOGLE_AI_KEY) {
      console.error('GOOGLE_AI_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 500 }
      )
    }

    // Prepare the prompt for the AI
    const prompt = `Analyze the following diary entries and provide insights in JSON format:
    ${JSON.stringify(entries, null, 2)}
    
    Please provide a response in the following JSON format:
    {
      "overallMood": "A brief description of the overall emotional tone",
      "commonThemes": ["List of recurring themes or topics"],
      "suggestions": ["Personalized suggestions based on the content"]
    }
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      // Clean the response text to handle markdown formatting
      let cleanText = text;
      
      // Remove markdown code block syntax if present
      cleanText = cleanText.replace(/```json\s*|\s*```/g, '');
      
      // Remove any leading/trailing whitespace
      cleanText = cleanText.trim();
      
      // Parse the cleaned AI response
      const analysis = JSON.parse(cleanText);
      return NextResponse.json(analysis);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error analyzing diary entries:', error);
    return NextResponse.json(
      { error: 'Failed to analyze diary entries' },
      { status: 500 }
    );
  }
} 