import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Export runtime configuration
export const runtime = "edge";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  // Validate request method
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "") {
    console.error("GEMINI_API_KEY is not set in environment variables");
    return NextResponse.json(
      {
        success: false,
        message: "API key not configured",
        error:
          "Missing or empty GEMINI_API_KEY environment variable. Please add it to your .env.local file and restart the server.",
      },
      { status: 500 }
    );
  }

  try {
    const prompt = `Generate 5 engaging, open-ended questions that would be suitable for an anonymous social messaging platform. 
    The questions should:
    - Be friendly and positive
    - Encourage meaningful conversations
    - Avoid personal or sensitive topics
    - Focus on universal themes
    - Be suitable for diverse audiences
    
    Format the response as a single line with questions separated by ||
    Example format: "Question 1||Question 2||Question 3||Question 4||Question 5"`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      return NextResponse.json(
        { success: false, message: "No response from Gemini AI" },
        { status: 500 }
      );
    }

    const text = response.text();

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Empty response from Gemini AI" },
        { status: 500 }
      );
    }

    // Clean up the response to ensure proper formatting
    const messages = text.replace(/\n/g, "").trim();

    if (!messages) {
      return NextResponse.json(
        { success: false, message: "No messages generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate suggestions",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
