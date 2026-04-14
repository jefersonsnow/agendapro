/**
 * Auto-Translation Helper for AgendarPro
 * Uses a lightweight, free translation shim to automatically localize DB content.
 */
export async function translateText(text: string, targetLocale: string, sourceLocale: string = "pt"): Promise<string> {
  if (!text || targetLocale === sourceLocale) return text;
  
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLocale}&tl=${targetLocale}&dt=t&q=${encodeURI(text)}`);
    const data = await res.json();
    return data[0].map((step: any) => step[0]).join('');
  } catch (e) {
    console.error(`Translation error for "${text}" to ${targetLocale}:`, e);
    return text; // Fallback to original
  }
}

export async function translateObject(obj: any, fields: string[], targetLocale: string, sourceLocale: string = "pt"): Promise<any> {
    const results: any = {};
    for (const field of fields) {
        if (obj[field]) {
            results[field] = await translateText(obj[field], targetLocale, sourceLocale);
        }
    }
    return results;
}
