/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * API: Predict Flood Risk & Generate Operations Guidance locally (Rule-based)
 * This removes dependency on Gemini API Key.
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

    // Calculate a rule-based mock score
    let ruleScore = 15;
    ruleScore += (rainfall_24h / 350) * 35;
    if (water_level_msl > 3.5) ruleScore += 20;
    if (water_level_msl > 5.0) ruleScore += 15;
    const failedPercentage = total_pumps > 0 ? (total_pumps - active_pumps) / total_pumps : 0;
    ruleScore += failedPercentage * 20;
    
    const calculatedScore = Math.min(100, Math.max(0, ruleScore));
    let calculatedStatus = "Safe";
    if (calculatedScore >= 75) calculatedStatus = "Critical";
    else if (calculatedScore >= 45) calculatedStatus = "Warning";

    const statusEmoji = calculatedStatus === 'Critical' ? '🚨' : calculatedStatus === 'Warning' ? '⚠️' : '✅';
    const statusText = calculatedStatus === 'Critical' ? 'วิกฤตสูงสุด' : calculatedStatus === 'Warning' ? 'เฝ้าระวัง' : 'ปกติ';

    // 1. Risk Analysis
    let riskAnalysis = `สถานการณ์ภาพรวมอยู่ในเกณฑ์ **${statusText}** (คะแนนความเสี่ยง: ${calculatedScore.toFixed(0)}/100) `;
    if (calculatedStatus === 'Critical') {
      riskAnalysis += `เนื่องจากระดับน้ำแม่น้ำปัตตานีสูงวิกฤต (${water_level_msl} ม.) ร่วมกับปริมาณน้ำฝนสะสมสูงถึง ${rainfall_24h} มม. และพบปัญหาสถานีสูบน้ำชำรุด/น้ำท่วมดับ ${flooded_pumps} จุด`;
    } else if (calculatedStatus === 'Warning') {
      riskAnalysis += `พบสัญญาณเฝ้าระวังจากปริมาณฝนสะสมในพื้นที่ และปริมาณสัญญาณร้องขอช่วยเหลือ SOS (${sos_pings_count} จุด)`;
    } else {
      riskAnalysis += `ระดับน้ำฝนและระดับน้ำในแม่น้ำอยู่ในระดับควบคุม ปริมาณฝนสะสมทั่วไปต่ำกว่าเกณฑ์วิกฤต`;
    }

    // 2. Impacts (3 Main points)
    let impactPoints = '';
    if (rainfall_24h > 150 || water_level_msl > 4.2) {
      impactPoints += `1. 🌊 **อุทกภัยริมตลิ่งล้นคันกั้นน้ำ**: แม่น้ำปัตตานีมีระดับน้ำล้นตลิ่งในเขตลุ่มต่ำ ชุมชนตลาดเก่าและชุมชนริมน้ำได้รับผลกระทบ\n`;
    } else {
      impactPoints += `1. 💧 **ระดับน้ำไหลเอ่อล้นระดับระบายปกติ**: น้ำในลุ่มแม่น้ำระบายช้าลง แต่อยู่ในเกณฑ์บริหารจัดการน้ำปกติ\n`;
    }
    if (flooded_pumps > 0) {
      impactPoints += `2. 🔌 **สถานีสูบน้ำหลักชำรุด**: มีสถานีเครื่องยนต์น้ำท่วมขังหลักดับจำนวน ${flooded_pumps} จุด ส่งผลกระทบต่อประสิทธิภาพการระบายน้ำ\n`;
    } else {
      impactPoints += `2. ⚙️ **ระบบระบายน้ำพร้อมใช้งาน**: สถานีสูบน้ำและเครื่องสูบน้ำแบบเคลื่อนที่ทำงานเต็มประสิทธิภาพ\n`;
    }
    if (vulnerable_distress > 0) {
      impactPoints += `3. 👥 **ผู้ประสบภัยกลุ่มเปราะบาง**: พบกลุ่มเปราะบางติดค้างในพื้นที่เสี่ยงภัยสีแดง จำนวน ${vulnerable_distress} ราย ต้องการการอพยพด่วน\n`;
    } else {
      impactPoints += `3. 🛡️ **ความปลอดภัยชุมชน**: ไม่มีกลุ่มเปราะบางตกค้างในพื้นที่อันตราย\n`;
    }

    // 3. Response Guidelines
    let responseGuidelines = '';
    if (calculatedStatus === 'Critical') {
      responseGuidelines += `🚨 **ระดมกำลังกู้ภัยด่วน**: จัดทีมเผชิญเหตุเข้าช่วยเหลือกลุ่มเปราะบางจำนวน ${vulnerable_distress} รายในเขตเสี่ยงภัยทันที\n`;
      responseGuidelines += `⚙️ **แก้ไขระบบระบายน้ำ**: เร่งซ่อมแซมสถานีสูบน้ำที่ดับ ${flooded_pumps} จุด และติดตั้งเครื่องสูบน้ำเสริมระบบโมบายทดแทน\n`;
      responseGuidelines += `🏘️ **เปิดศูนย์อพยพสำรอง**: ยกระดับความจุศูนย์อพยพหลัก (ปัจจุบันใช้งาน ${shelter_capacity_pct}%) และเปิดศูนย์อพยพสำรองเพิ่ม\n`;
    } else {
      responseGuidelines += `📈 **เฝ้าระวังระดับน้ำ**: ติดตามข้อมูล Telemetry ของระดับน้ำแม่น้ำปัตตานีอย่างต่อเนื่องทุกชั่วโมง\n`;
      responseGuidelines += `🛡️ **เตรียมความพร้อมแนวกั้นน้ำ**: ตรวจสอบการติดตั้ง Flood Barrier และเตรียมกระสอบทรายสำรองในจุดวิกฤต\n`;
      responseGuidelines += `📞 **ประสานงานสายด่วน SOS**: ตรวจเช็คข้อมูลพิน SOS ทั้งหมด ${sos_pings_count} จุด เพื่อส่งความช่วยเหลือทั่วไป\n`;
    }

    // 4. Forecast (24-48 Hours)
    let forecast = '';
    if (rainfall_24h > 150) {
      forecast += `คาดการณ์ว่าในอีก 24-48 ชั่วโมงข้างหน้า หากยังมีปริมาณฝนสะสมเกิน 100 มม. ระดับน้ำปัตตานีจะสูงขึ้นอีก 0.3-0.5 เมตร ส่งผลให้พื้นที่ลุ่มต่ำตลาดเก่า ยะลา มีน้ำท่วมขังสูงขึ้น ขอให้เตรียมแผนอพยพประชาชนเพิ่มเติม`;
    } else {
      forecast += `คาดการณ์ระดับน้ำในอีก 24-48 ชั่วโมงข้างหน้ามีแนวโน้มทรงตัวหรือลดลงเล็กน้อยตามการชะลอตัวของกลุ่มฝนในพื้นที่ตอนบน แต่อยู่ในสภาวะเฝ้าระวังเป็นปกติ`;
    }

    const reportText = `### 📊 รายงานวิเคราะห์ระบบจำลองสถานการณ์อุทกภัยยะลา (Local Model)

---

#### 1. ${statusEmoji} ระดับความเสี่ยงภาพรวม (Overall Risk Index)
* **สถานะความเสี่ยง**: \`${statusText}\`
* **ระดับคะแนนความเสี่ยง**: **${calculatedScore.toFixed(0)} / 100**
* **บทวิเคราะห์**: ${riskAnalysis}

---

#### 2. 📈 ผลกระทบหลัก 3 จุดวิกฤต (3 Main Impacts)
${impactPoints}
---

#### 3. 🛡️ แนวทางตอบสนองสายด่วนระบบ (Operational Guidelines)
${responseGuidelines}
---

#### 4. 🔮 พยากรณ์ล่วงหน้า 24-48 ชม. (Next 24-48 Hours Forecast)
* ${forecast}

*หมายเหตุ: ข้อมูลการประเมินและการทำนายนี้ประเมินผ่าน Rule-based Engine ภายในท้องถิ่นเพื่อรองรับการประมวลผลออฟไลน์โดยไม่ต้องรันผ่านระบบ API*`;

    res.json({
      success: true,
      report: reportText,
      calculatedScore,
      calculatedStatus
    });
  } catch (error) {
    console.error("Local calculation server error: ", error);
    res.status(500).json({
      success: false,
      error: "ระบบคำนวณจำลองสถานการณ์อุทกภัยขัดข้อง"
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
