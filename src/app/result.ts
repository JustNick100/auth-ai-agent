export interface ResultText {
  topic: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TestResult {
  score: number;
  total: number;
  date: Date;
  ru: ResultText;
  kk: ResultText;
}

const BLOCK = /\[\[RESULT\]\]([\s\S]*?)\[\[\/RESULT\]\]/;

function toList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((v) => String(v).trim()).filter(Boolean).slice(0, 6)
    : [];
}

function toText(d: unknown): ResultText | null {
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  return {
    topic: String(o['topic'] ?? '').trim() || '—',
    summary: String(o['summary'] ?? '').trim(),
    strengths: toList(o['strengths']),
    weaknesses: toList(o['weaknesses']),
    recommendations: toList(o['recommendations']),
  };
}

export function extractResult(reply: string): { text: string; result: TestResult | null } {
  const match = reply.match(BLOCK);
  if (!match) return { text: reply, result: null };

  const text = reply.replace(BLOCK, '').trim();

  try {
    const raw = match[1].replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);
    const score = Number(data.score);
    const total = Number(data.total);

    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
      return { text, result: null };
    }

    // Новый формат: ru и kk. Если пришла только одна версия (или старый плоский формат), используем её для обоих языков.
    const a = toText(data.ru);
    const b = toText(data.kk);
    const flat = a || b ? null : toText(data);
    const ru = a ?? b ?? flat;
    const kk = b ?? a ?? flat;
    if (!ru || !kk) return { text, result: null };

    return { text, result: { score, total, date: new Date(), ru, kk } };
  } catch {
    return { text, result: null };
  }
}