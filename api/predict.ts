import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      rainfall_24h,
      rainfall_120h,
      water_level_msl,
      flow_rate,
      active_pumps,
      total_pumps,
      flooded_pumps,
      barriers_deployed,
      vulnerable_distress,
      sos_pings_count,
      shelter_capacity_pct,
    } = req.body;

    const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านอุทกภัยและผู้บัญชาการศูนย์ควบคุมข้อมูลภัยพิบัติน้ำท่วม (Disaster Operation Center) ประจำจังหวัดยะลา 
โปรดวิเคราะห์สถานการณ์น้ำท่วมและคาดการณ์ความเสี่ยงจากข้อมูล Telemetry, โครงสร้างพื้นฐาน และสถานการณ์ประชาชนต่อไปนี้:

[ข้อมูลปริมาณน้ำฝน]
- ปริมาณน้ำฝนสะสม 24 ชั่วโมงล่าสุด: ${rainfall_24h} mm
- ปริมาณน้ำฝนสะสม 5 วัน (120 ชั่วโมง): ${rainfall_120h} mm

[ข้อมูลระดับน้ำและการไหล]
- ระดับน้ำ (MSL): ${water_level_msl} เมตร (วิกฤตที่ 5.2 ม.)
- อัตราการไหลของแม่น้ำปัตตานี: ${flow_rate} ลบ.ม./วินาที

[ระบบระบายน้ำ]
- สถานีสูบน้ำที่เดินเครื่อง: ${active_pumps} จาก ${total_pumps} สถานี
- สถานีที่น้ำท่วมเครื่องดับ: ${flooded_pumps} สถานี
- แนวพนังกั้นน้ำ: ${barriers_deployed ? 'ติดตั้งสมบูรณ์' : 'ยังไม่ได้ติดตั้ง'}

[ความมั่นคงทางสังคม]
- กลุ่มเปราะบางในโซนอันตราย: ${vulnerable_distress} คน
- สัญญาณ SOS: ${sos_pings_count} จุด
- อัตราการใช้งานศูนย์อพยพ: ${shelter_capacity_pct}%

---
สรุปและวิเคราะห์เป็น Markdown ภาษาไทย กระชับ เหมาะสำหรับผู้บริหาร:
1. ระดับความเสี่ยงภาพรวม (คะแนน 0-100, สถานะ Safe/Warning/Critical)
2. ผลกระทบหลัก 3 จุด
3. แนวทางตอบสนองเร่งด่วน 3-4 ข้อ
4. พยากรณ์ล่วงหน้า 24-48 ชม.

ใช้ emoji เหมาะสม เช่น 🚨 📈 🌊 🛡️`;

    const response = await getGeminiClient().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reportText = response.text ?? 'ไม่สามารถประเมินผลได้';

    // Rule-based score as fallback indicator
    let ruleScore = 20;
    if (rainfall_24h > 100) ruleScore += 20;
    if (rainfall_24h > 250) ruleScore += 15;
    if (water_level_msl > 4.0) ruleScore += 20;
    if (flooded_pumps > 0) ruleScore += 15;
    if (sos_pings_count > 5) ruleScore += 10;
    ruleScore = Math.min(ruleScore, 100);

    const calculatedStatus = ruleScore > 70 ? 'Critical' : ruleScore > 40 ? 'Warning' : 'Safe';

    res.status(200).json({ success: true, report: reportText, calculatedScore: ruleScore, calculatedStatus });
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ success: false, error: 'ระบบ AI ขัดข้องชั่วคราว' });
  }
}
