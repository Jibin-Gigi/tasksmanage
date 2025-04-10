import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function POST(req: Request) {
  try {
    //const { goal } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate a random challenge that can be done daily for personal growth`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from response");
    }

    const questData = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!questData.title || !questData.description || !questData.tasks) {
      throw new Error("Invalid quest data structure");
    }

    return NextResponse.json(questData);
  } catch (error) {
    console.error("Quest generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quest" },
      { status: 500 }
    );
  }
}
