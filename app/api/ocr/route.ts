import { NextRequest, NextResponse } from "next/server";

interface ExtractedMedicine {
  name: string;
  dosage: string;
  instructions: string;
}

interface OcrResponse {
  medicines: ExtractedMedicine[];
  rawText: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

const GEMINI_VISION_PROMPT = `You are a medical prescription reader for an Indian healthcare app.

Analyze this prescription image carefully and extract ALL medicine information.

Return ONLY a valid JSON object with this exact structure:
{
  "medicines": [
    {
      "name": "Medicine name with strength (e.g. Paracetamol 500mg)",
      "dosage": "How many tablets/ml per dose (e.g. 1 tablet, 5ml)",
      "instructions": "When and how to take (e.g. Twice daily after meals for 5 days)"
    }
  ],
  "rawText": "All text you can read from the prescription",
  "confidence": "high | medium | low",
  "notes": "Any important warnings, doctor name, or notes from the prescription"
}

Rules:
- Extract every medicine listed, even if partially legible
- For Indian prescriptions: common abbreviations like BD=twice daily, TDS=three times daily, OD=once daily, SOS=as needed, AC=before meals, PC=after meals
- If handwriting is unclear, make your best inference and set confidence to "low" or "medium"
- Include the drug strength/formulation in the name (e.g. Amoxicillin 500mg, not just Amoxicillin)
- Return valid JSON only, no markdown, no explanation`;

export async function POST(req: NextRequest) {
  try {
    const { imageData, mimeType } = await req.json() as {
      imageData: string;
      mimeType: string;
    };

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Use the configured model or fall back to gemini-2.0-flash (supports vision)
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageData, // base64 encoded image
                  },
                },
                {
                  text: GEMINI_VISION_PROMPT,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // Low temp for accuracy
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OCR] Gemini API error:", errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}` },
        { status: 502 }
      );
    }

    const payload = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
        finishReason?: string;
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No content extracted from image" },
        { status: 422 }
      );
    }

    // Parse the JSON response from Gemini
    let ocrResult: OcrResponse;
    try {
      ocrResult = JSON.parse(text) as OcrResponse;
    } catch {
      // Gemini sometimes wraps in markdown even with responseMimeType set
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ocrResult = JSON.parse(jsonMatch[0]) as OcrResponse;
      } else {
        return NextResponse.json(
          { error: "Could not parse prescription data", rawText: text },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(ocrResult);
  } catch (err) {
    console.error("[OCR] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
