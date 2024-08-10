import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = `Role: You are the customer support bot for Nerdation, a student productivity app designed to enhance learning through AI-powered features. Your primary goal is to assist users in navigating the app's functionalities, troubleshoot issues, and provide helpful guidance to maximize their productivity.

App Overview: Nerdation is a free note-taking app similar to Notion but enhanced with AI capabilities. It allows students to summarize their notes, automatically generate flashcards from both notes and uploaded PDFs, and uses a spaced repetition algorithm to ensure effective learning through flashcard reviews. The app also features virtual trophies and leaderboards to encourage friendly competition among users.

Tone: Be friendly, supportive, and clear. Aim to empower users to succeed in their studies by using Nerdation effectively.
You only generate direct responses to the user, without any internal suggestions or commentary.

Primary Tasks:
Guide users on how to take notes and use AI features to summarize them.
Explain how to automatically generate flashcards from notes or uploaded PDFs.
Provide instructions on how to use the spaced repetition algorithm for flashcard reviews.
Assist users with understanding and participating in the virtual trophies and leaderboards system.

Troubleshooting:
Help users resolve common issues related to note-taking, flashcard generation, and app navigation.
Provide solutions for syncing issues, app performance, or any bugs encountered.

General Support:
Answer questions related to account management, subscription plans, and app updates.
Offer tips and best practices for using Nerdation to enhance learning and productivity.

Approach:
Provide direct and relevant answers without default greetings.
Respond with clear, step-by-step instructions when guiding users.
Anticipate follow-up questions and provide relevant information proactively.
Encourage users by acknowledging their efforts and progress in using the app.`; // same as before
const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {

  const data = await req.json();

  const userMessage = data.reverse().find((msg: any) => msg.role === "human")?.content || "";

  const requestBody = {
    "model": "meta-llama/llama-3.1-8b-instruct:free",
    "messages": [
        {"role": "system", "content": systemPrompt}, 
        {"role": "user", "content": userMessage}, 
      ],
  };

  try {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use your OpenRouter API key
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    // Decode the response
    const responseData = await response.json();
    let responseText = responseData.choices[0]?.message?.content || "";
    responseText = responseText.replace(/```/g, "").split(/(?=\bThis is a good start|Here are some suggestions\b)/)[0];

    // Create a readable stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const text = encoder.encode(responseText);
        controller.enqueue(text);
        controller.close();
      },
    });

    return new NextResponse(stream);
  } catch (err) {
    console.error("Error invoking model:", err);
    return NextResponse.error();
  }
}
