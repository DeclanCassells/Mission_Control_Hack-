import { NextResponse } from "next/server";
import fs from "fs";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const base64Audio: string = body.audio;

  // Define the file path for storing the temporary WAV file
  const filePath = "tmp/input.wav";

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Ensure the tmp directory exists
    fs.mkdirSync("tmp", { recursive: true });

    // Write the audio data to a temporary WAV file using base64 encoding
    fs.writeFileSync(filePath, base64Audio, { encoding: "base64" });

    // Create a readable stream from the temporary WAV file
    const readStream = fs.createReadStream(filePath);

    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Remove the temporary file after successful processing
    fs.unlinkSync(filePath);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
