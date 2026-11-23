const apiBase = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function askGemini(prompt, context = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('AI provider is not configured');
    error.status = 503;
    error.code = 'AI_CONFIGURATION';
    throw error;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  let response;
  try {
    response = await fetch(`${apiBase}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `Bạn là CineMind, trợ lý điện ảnh nói tiếng Việt. Trả lời rõ ràng, không bịa dữ kiện phim. Nếu không biết, hãy nói rõ. Ngày hiện tại là ${new Date().toISOString().slice(0, 10)}. Khi dữ liệu chỉ có năm phát hành, chỉ nêu năm và không suy đoán phim sắp chiếu hay đã ra rạp. Khi có dữ liệu phim được cung cấp, chỉ dựa vào dữ liệu đó cho các thông tin cụ thể về phim. Nếu danh mục liệt kê một phim thì không được phủ nhận phim đó tồn tại; hãy nêu rõ thông tin đang dựa trên danh mục CineMind.` }] },
        contents: [{ role: 'user', parts: [{ text: `${context ? `Dữ liệu tham khảo:\n${context}\n\n` : ''}${prompt}` }] }],
        generationConfig: { maxOutputTokens: 700, thinkingConfig: { thinkingLevel: 'minimal' } }
      }),
      signal: AbortSignal.timeout(30000)
    });
  } catch (cause) {
    const timedOut = cause.name === 'TimeoutError' || cause.name === 'AbortError';
    const error = new Error(timedOut ? 'AI request timed out' : 'AI provider request failed', { cause });
    error.status = timedOut ? 504 : 502;
    error.code = timedOut ? 'AI_TIMEOUT' : 'AI_UPSTREAM';
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Gemini request failed (${response.status})`);
    error.status = response.status === 429 ? 429 : 502;
    error.code = response.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM';
    throw error;
  }
  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) {
    const error = new Error('AI did not return an answer');
    error.status = 502;
    error.code = 'AI_UPSTREAM';
    throw error;
  }
  return answer;
}
