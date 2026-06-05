/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client strictly using @google/genai SDK on the server-side lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/**
 * API: Predict Flood Risk & Generate Operations Guidance via Gemini
 */
app.post("/api/predict", async (req, res) => {
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
      shelter_capacity_pct
    } = req.body;

    // Build structured prompt for Gemini 3.5 Flash in Thai language
    const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านอุทกภัยและผู้บัญชาการศูนย์ควบคุมข้อมูลภัยพิบัติน้ำท่วม (Disaster Operation Center) ประจำจังหวัดยะลา 
โปรดวิเคราะห์สถานการณ์น้ำท่วมและคาดการณ์ความเสี่ยงจากข้อมูล Telemetry, โครงสร้างพื้นฐาน และสถานการณ์ประชาชนต่อไปนี้:

[ข้อมูลปริมาณน้ำฝน]
- ปริมาณน้ำฝนสะสม 24 ชั่วโมงล่าสุด: ${rainfall_24h} mm (ค่าสูงสุดประวัติการณ์ของพื้นที่คือ 303.6 mm/day)
- ปริมาณน้ำฝนสะสม 5 วัน (120 ชั่วโมง): ${rainfall_120h} mm (ค่าวิกฤตสะสมคือ 1,072 mm)

[ข้อมูลระดับน้ำและการไหลร่ว]
- ระดับน้ำเฉลี่ยปัจจุบันเทียบกับระดับน้ำทะเลปานกลาง (Water Level MSL): ${water_level_msl} เมตร (ปกติไม่ควรเกิน 3.5 เมตร, ระดับวิกฤตพนังกั้นน้ำล้นคือ 5.2 เมตร)
- อัตราการไหลของแม่น้ำปัตตานี ณ จุดวัดหลัก: ${flow_rate} ลบ.ม./วินาที

[ระบบระบายน้ำและปั๊มสูบน้ำ]
- จำนวนสถานีสูบน้ำที่เดินเครื่องอยู่: ${active_pumps} จากทั้งหมด ${total_pumps} สถานี
- สถานีระบายน้ำที่ถูกน้ำท่วมเครื่องยนต์หลักจนดับ (Engine Flooded): ${flooded_pumps} สถานี
- มีการติดตั้งแนวพนังป้องกันน้ำท่วมเคลื่อนที่แบบบล็อกสำเร็จรูป (Flood Barrier Wall Deployment): ${barriers_deployed ? 'ติดตั้งสมบูรณ์' : 'ยังไม่ได้ติดตั้งหรือชำรุดบางจุด'}

[ความมั่นคงทางสังคมและการอพยพ]
- จำนวนประชาชนกลุ่มเปราะบาง (ผู้ป่วยติดเตียง, เด็ก, คนชรา) ที่อยู่ในโซนอันตรายสีแดง: ${vulnerable_distress} คน
- จำนวนสัญญาณ SOS จากประชาชนที่มีรหัสพินบนแผนที่: ${sos_pings_count} จุด
- อัตราการใช้งานศูนย์อพยพหลักทั้ง 7 แห่ง: ${shelter_capacity_pct}% ของความจุทั้งหมด

---
โปรดสรุปและวิเคราะห์ผลลัพธ์เป็นข้อๆ ภาษาไทยแบบเป็นทางการ เข้าใจง่าย กระชับ เหมาะสำหรับขึ้นหน้าจอผู้บริหารระดับสูง (Executive Level):
1. [ระดับความเสี่ยงภาพรวม] ประเมินคะแนนความเสี่ยง (Flood Risk Score) 0-100 พร้อมระบุสถานะ (Safe / Warning / Critical) พร้อมเหตุผลหลัก
2. [ผลกระทบหลัก 3 จุด] แนะนำวิเคราะห์ชุมชนที่เสี่ยงหนัก (จากข้อมูล ยะลามี 41 ชุมชนเสี่ยง) และประเด็นเรื่องเครื่องสูบน้ำล่มและฝนตกหนัก
3. [แนวทางตอบสนองสายด่วนระบบ] สั่งการเร่งด่วน 3-4 ข้อ (เช่น การขยับเครื่องสูบน้ำสำรอง, สั่งการทีมกู้ภัยไปเคลียร์พิน SOS ในตำแหน่งเปราะบาง, แผนขยายศูนย์อพยพที่เต็ม)
4. [พยากรณ์ล่วงหน้า 24-48 ชม.] วิเคราะห์แนวโน้มระดับน้ำหากปริมาณฝนเพิ่มขึ้นหรือลดลงและแนวโน้มแม่น้ำล้นตลิ่ง

ขอคำตอบในรูปแบบ Markdown ที่สวยงาม จัดหมวดหมู่ชัดเจน สะดุดตา และใช้สี/สัญลักษณ์อิโมจิให้เข้ากับศูนย์บัญชาการ เช่น 🚨 📈 🌊 🛡️ 👤
`;

    const response = await getGeminiClient().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reportText = response.text || "ขอโทษด้วย ระบบไม่สามารถประเมินผลได้จากข้อผิดพลาดภายในเครื่อง";
    
    // Calculate a rule-based mock score as a fallback/co-verifier
    let ruleScore = 20;
    if (rainfall_24h > 100) ruleScore += 20;
    if (rainfall_24h > 250) ruleScore += 15;
    if (water_level_msl > 4.0) ruleScore += 20;
    if (flooded_pumps > 0) ruleScore += 15;
    if (sos_pings_count > 5) ruleScore += 10;
    ruleScore = Math.min(ruleScore, 100);

    let ruleStatus = "Safe";
    if (ruleScore > 70) ruleStatus = "Critical";
    else if (ruleScore > 40) ruleStatus = "Warning";

    res.json({
      success: true,
      report: reportText,
      calculatedScore: ruleScore,
      calculatedStatus: ruleStatus
    });
  } catch (error) {
    console.error("Gemini server error: ", error);
    res.status(500).json({
      success: false,
      error: "หน่วยประมวลผลวิเคราะห์ด้วยปัญญาประดิษฐ์ (AI Prediction) ขัดข้องชั่วคราว"
    });
  }
});

// Configure Vite or Static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as Express middleware");
  } else {
    // Production Mode serving compiled SPA build
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static files from: ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Flood Disaster Operation Center (GIS server) running on http://localhost:${PORT}`);
  });
}

startServer();
