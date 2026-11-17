const apiBase = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function askGemini(prompt, context = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.status = 503;
    throw error;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const response = await fetch(`${apiBase}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Bạn là CineMind, trợ lý điện ảnh nói tiếng Việt. Trả lời rõ ràng, không bịa dữ kiện phim. Nếu không biết, hãy nói rõ. Khi có dữ liệu phim được cung cấp, chỉ dựa vào dữ liệu đó cho các thông tin cụ thể về phim.' }] },
      contents: [{ role: 'user', parts: [{ text: `${context ? `Dữ liệu tham khảo:\n${context}\n\n` : ''}${prompt}` }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 700 }
    }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) {
    const error = new Error(`Gemini request failed (${response.status})`);
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }
  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) {
    const error = new Error('AI did not return an answer');
    error.status = 502;
    throw error;
  }
  return answer;
}
