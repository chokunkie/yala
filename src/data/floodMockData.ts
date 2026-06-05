/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CommunityPoint {
  id: string;
  name: string;
  subdistrict: string;
  lat: number;
  lng: number;
  riskLevel: 'high' | 'critical' | 'moderate';
  vulnerablePop: number; // block-level vulnerable populations
  historicalMaxLevel?: number; // meters
}

export interface PumpStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number; // m3/s
  isOperational: boolean;
  isEngineFlooded: boolean;
  flowRate: number; // current m3/s
}

export interface TelemetrySensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  waterLevelMsl: number; // meters relative to Mean Sea Level
  criticalLevel: number;
  warningLevel: number;
  batteryStatus: 'good' | 'low' | 'critical';
  healthStatus: 'healthy' | 'unstable' | 'offline';
  rainfall24h: number; // mm
  flowRate: number; // m3/s
}

export interface EvacuationShelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  status: 'available' | 'full' | 'closed';
  contactPhone: string;
}

// 41 At-Risk Communities in Yala (out of 44 communities, realistic distribution near Pattani River)
export const YALA_COMMUNITIES: CommunityPoint[] = [
  { id: 'C01', name: 'ชุมชนวิเทศไทยประคอง', subdistrict: 'สะเตง', lat: 6.5562, lng: 101.2818, riskLevel: 'critical', vulnerablePop: 45 },
  { id: 'C02', name: 'ชุมชนท่าสาปคาน', subdistrict: 'ท่าสาป', lat: 6.5641, lng: 101.2725, riskLevel: 'critical', vulnerablePop: 62 },
  { id: 'C03', name: 'ชุมชนตลาดเก่าร่วมใจ', subdistrict: 'สะเตง', lat: 6.5512, lng: 101.2954, riskLevel: 'critical', vulnerablePop: 120 },
  { id: 'C04', name: 'ชุมชนหลังโรงเรียนสตรี', subdistrict: 'สะเตง', lat: 6.5585, lng: 101.2912, riskLevel: 'high', vulnerablePop: 35 },
  { id: 'C05', name: 'ชุมชนจารูพัฒนา', subdistrict: 'สะเตง', lat: 6.5458, lng: 101.2995, riskLevel: 'critical', vulnerablePop: 85 },
  { id: 'C06', name: 'ชุมชนบ้านร่มสาย', subdistrict: 'สะเตงนอก', lat: 6.5398, lng: 101.2999, riskLevel: 'high', vulnerablePop: 28 },
  { id: 'C07', name: 'ชุมชนคุรุพัฒนา', subdistrict: 'สะเตง', lat: 6.5492, lng: 101.2812, riskLevel: 'moderate', vulnerablePop: 15 },
  { id: 'C08', name: 'ชุมชนสะเตงนอกร่วมใจ', subdistrict: 'สะเตงนอก', lat: 6.5350, lng: 101.3050, riskLevel: 'high', vulnerablePop: 50 },
  { id: 'C09', name: 'ชุมชนวิรัชพัฒนา', subdistrict: 'สะเตง', lat: 6.5412, lng: 101.2854, riskLevel: 'high', vulnerablePop: 40 },
  { id: 'C10', name: 'ชุมชนหน้าวัดเมืองยลา', subdistrict: 'สะเตง', lat: 6.5445, lng: 101.2801, riskLevel: 'moderate', vulnerablePop: 18 },
  { id: 'C11', name: 'ชุมชนจันทราวนาราม', subdistrict: 'สะเตงนอก', lat: 6.5298, lng: 101.3092, riskLevel: 'high', vulnerablePop: 32 },
  { id: 'C12', name: 'ชุมชนฝั่งเมืองใหม่', subdistrict: 'ท่าสาป', lat: 6.5682, lng: 101.2654, riskLevel: 'critical', vulnerablePop: 75 },
  { id: 'C13', name: 'ชุมชนบ้านเนียงพัฒนา', subdistrict: 'เปาะเส้ง', lat: 6.5212, lng: 101.2450, riskLevel: 'high', vulnerablePop: 44 },
  { id: 'C14', name: 'ชุมชนริมคลองบ้านจารู', subdistrict: 'สะเตง', lat: 6.5429, lng: 101.3021, riskLevel: 'critical', vulnerablePop: 98 },
  { id: 'C15', name: 'ชุมชนเวฬุวันก้าวหน้า', subdistrict: 'สะเตง', lat: 6.5539, lng: 101.2758, riskLevel: 'high', vulnerablePop: 29 },
  { id: 'C16', name: 'ชุมชนสันติราษฎร์', subdistrict: 'สะเตงนอก', lat: 6.5385, lng: 101.3125, riskLevel: 'moderate', vulnerablePop: 21 },
  { id: 'C17', name: 'ชุมชนคูหามุขพัฒนา', subdistrict: 'ท่าสาป', lat: 6.5695, lng: 101.2789, riskLevel: 'critical', vulnerablePop: 54 },
  { id: 'C18', name: 'ชุมชนหน้าสถานีรถไฟ', subdistrict: 'สะเตง', lat: 6.5545, lng: 101.2902, riskLevel: 'high', vulnerablePop: 38 },
  { id: 'C19', name: 'ชุมชนสวนส้มสามัคคี', subdistrict: 'สะเตงนอก', lat: 6.5460, lng: 101.3140, riskLevel: 'high', vulnerablePop: 47 },
  { id: 'C20', name: 'ชุมชนประชานุกูล', subdistrict: 'สะเตง', lat: 6.5510, lng: 101.2845, riskLevel: 'moderate', vulnerablePop: 12 },
  { id: 'C21', name: 'ชุมชนท่าสาปบ่อน้ำ', subdistrict: 'ท่าสาป', lat: 6.5612, lng: 101.2601, riskLevel: 'critical', vulnerablePop: 68 },
  { id: 'C22', name: 'ชุมชนบ้านขอมใต้', subdistrict: 'สะเตงนอก', lat: 6.5245, lng: 101.2985, riskLevel: 'high', vulnerablePop: 51 },
  { id: 'C23', name: 'ชุมชนริมแม่น้ำปัตตานี 1', subdistrict: 'สะเตง', lat: 6.5615, lng: 101.2865, riskLevel: 'critical', vulnerablePop: 112 },
  { id: 'C24', name: 'ชุมชนริมแม่น้ำปัตตานี 2', subdistrict: 'สะเตง', lat: 6.5658, lng: 101.2872, riskLevel: 'critical', vulnerablePop: 89 },
  { id: 'C25', name: 'ชุมชนตลาดผลไม้ไทย', subdistrict: 'สะเตง', lat: 6.5498, lng: 101.2931, riskLevel: 'high', vulnerablePop: 42 },
  { id: 'C26', name: 'ชุมชนบดินทร์เดชา', subdistrict: 'สะเตงนอก', lat: 6.5312, lng: 101.2895, riskLevel: 'moderate', vulnerablePop: 16 },
  { id: 'C27', name: 'ชุมชนเวชนครพัฒนา', subdistrict: 'สะเตง', lat: 6.5381, lng: 101.2825, riskLevel: 'high', vulnerablePop: 34 },
  { id: 'C28', name: 'ชุมชนสุขใจอุทิศ', subdistrict: 'สะเตงนอก', lat: 6.5485, lng: 101.3095, riskLevel: 'high', vulnerablePop: 26 },
  { id: 'C29', name: 'ชุมชนหลัง บขส.ยลา', subdistrict: 'สะเตง', lat: 6.5582, lng: 101.2991, riskLevel: 'critical', vulnerablePop: 94 },
  { id: 'C30', name: 'ชุมชนบ้านหน้าถ้ำสามัคคี', subdistrict: 'หน้าถ้ำ', lat: 6.5218, lng: 101.2289, riskLevel: 'high', vulnerablePop: 58 },
  { id: 'C31', name: 'ชุมชนพานิชยการยลา', subdistrict: 'สะเตง', lat: 6.5502, lng: 101.2882, riskLevel: 'moderate', vulnerablePop: 10 },
  { id: 'C32', name: 'ชุมชนมาลายูบางกอกใต้', subdistrict: 'สะเตง', lat: 6.5350, lng: 101.2921, riskLevel: 'high', vulnerablePop: 41 },
  { id: 'C33', name: 'ชุมชนจารูพัฒนาสันติ', subdistrict: 'สะเตง', lat: 6.5432, lng: 101.2971, riskLevel: 'critical', vulnerablePop: 77 },
  { id: 'C34', name: 'ชุมชนฝั่งเมืองเก่าพูนสุข', subdistrict: 'สะเตง', lat: 6.5528, lng: 101.2989, riskLevel: 'critical', vulnerablePop: 105 },
  { id: 'C35', name: 'ชุมชนบ้านยุโปพัฒนา', subdistrict: 'ยุโป', lat: 6.5921, lng: 101.2655, riskLevel: 'critical', vulnerablePop: 82 },
  { id: 'C36', name: 'ชุมชนตาเซะร่วมใจ', subdistrict: 'ตาเซะ', lat: 6.6112, lng: 101.3121, riskLevel: 'critical', vulnerablePop: 73 },
  { id: 'C37', name: 'ชุมชนสุขสมบูรณ์เหนือ', subdistrict: 'สะเตงนอก', lat: 6.5422, lng: 101.3190, riskLevel: 'high', vulnerablePop: 33 },
  { id: 'C38', name: 'ชุมชนริมคลองแบเมาะ', subdistrict: 'สะเตง', lat: 6.5388, lng: 101.2721, riskLevel: 'high', vulnerablePop: 49 },
  { id: 'C39', name: 'ชุมชนกูแบรายอสุริยา', subdistrict: 'สะเตง', lat: 6.5322, lng: 101.2778, riskLevel: 'moderate', vulnerablePop: 19 },
  { id: 'C40', name: 'ชุมชนบ้านพร่อนวิถี', subdistrict: 'พร่อน', lat: 6.5110, lng: 101.2612, riskLevel: 'high', vulnerablePop: 36 },
  { id: 'C41', name: 'ชุมชนบ้านลิดลพัฒนา', subdistrict: 'ลิดล', lat: 6.5188, lng: 101.2110, riskLevel: 'high', vulnerablePop: 43 }
];

// 14 Pump Stations in Yala (some are prone to engine flooding or offline states)
export const YALA_PUMP_STATIONS: PumpStation[] = [
  { id: 'P01', name: 'สถานีสูบน้ำจารูพัฒนา (Main)', lat: 6.5438, lng: 101.3012, capacity: 6.5, isOperational: true, isEngineFlooded: false, flowRate: 4.8 },
  { id: 'P02', name: 'สถานีสูบน้ำปลายคลองแบเมาะ', lat: 6.5395, lng: 101.2711, capacity: 4.5, isOperational: true, isEngineFlooded: false, flowRate: 3.2 },
  { id: 'P03', name: 'สถานีสูบน้ำบ้านคูหามุข', lat: 6.5684, lng: 101.2785, capacity: 5.0, isOperational: false, isEngineFlooded: true, flowRate: 0.0 }, // ENGINE FLOODED
  { id: 'P04', name: 'สถานีสูบน้ำฝั่งสะเตงนอก 1', lat: 6.5332, lng: 101.3065, capacity: 3.5, isOperational: true, isEngineFlooded: false, flowRate: 2.9 },
  { id: 'P05', name: 'สถานีสูบน้ำฝั่งสะเตงนอก 2', lat: 6.5285, lng: 101.3110, capacity: 3.5, isOperational: true, isEngineFlooded: false, flowRate: 3.1 },
  { id: 'P06', name: 'สถานีสูบน้ำแก้มลิงบึงบาโด', lat: 6.5592, lng: 101.2589, capacity: 8.0, isOperational: true, isEngineFlooded: false, flowRate: 7.2 },
  { id: 'P07', name: 'สถานีประตูปิดน้ำท่าน้ำปัตตานี', lat: 6.5688, lng: 101.2885, capacity: 10.0, isOperational: false, isEngineFlooded: false, flowRate: 0.0 }, // OFFLINE / Closed
  { id: 'P08', name: 'สถานีสูบน้ำหลังตลาดเก่าร่วมใจ', lat: 6.5501, lng: 101.2965, capacity: 4.0, isOperational: true, isEngineFlooded: false, flowRate: 3.5 },
  { id: 'P09', name: 'สถานีสูบน้ำสะพานท่าสาป', lat: 6.5622, lng: 101.2718, capacity: 5.5, isOperational: true, isEngineFlooded: false, flowRate: 4.0 },
  { id: 'P10', name: 'สถานีระบายและสูบน้ำบ้านเนียง', lat: 6.5205, lng: 101.2462, capacity: 3.0, isOperational: false, isEngineFlooded: true, flowRate: 0.0 }, // ENGINE FLOODED
  { id: 'P11', name: 'สถานีช่วยสูบน้ำหลังสถานีรถไฟ', lat: 6.5555, lng: 101.2915, capacity: 2.5, isOperational: true, isEngineFlooded: false, flowRate: 1.8 },
  { id: 'P12', name: 'สถานีระบายน้ำแก้มลิงบ้านพร่อน', lat: 6.5120, lng: 101.2625, capacity: 4.0, isOperational: true, isEngineFlooded: false, flowRate: 3.0 },
  { id: 'P13', name: 'สถานีระบายและป้องกัน ยุโป 1', lat: 6.5898, lng: 101.2680, capacity: 5.0, isOperational: true, isEngineFlooded: false, flowRate: 4.2 },
  { id: 'P14', name: 'สถานีป้องกันประตูระบายน้ำ ตาเซะ', lat: 6.6125, lng: 101.3148, capacity: 6.0, isOperational: false, isEngineFlooded: false, flowRate: 0.0 } // OFFLINE maintenance
];

// 11 Telemetry Water level & Rainfall Sensors
export const YALA_TELEMETRY_SENSORS: TelemetrySensor[] = [
  { id: 'T01', name: 'เซนเซอร์สะพานท่าสาป (River MSL 1)', lat: 6.5632, lng: 101.2735, waterLevelMsl: 4.85, criticalLevel: 5.20, warningLevel: 4.50, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 303.6, flowRate: 450 },
  { id: 'T02', name: 'เซนเซอร์ตลาดเก่าปากคลองพัฒนา', lat: 6.5518, lng: 101.2974, waterLevelMsl: 4.30, criticalLevel: 4.00, warningLevel: 3.50, batteryStatus: 'low', healthStatus: 'unstable', rainfall24h: 289.0, flowRate: 120 }, // Overflowed!
  { id: 'T03', name: 'เซนเซอร์ชุมชนจารูพัฒนาริมฝั่ง', lat: 6.5442, lng: 101.3005, waterLevelMsl: 4.15, criticalLevel: 3.90, warningLevel: 3.40, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 295.5, flowRate: 110 }, // Critical!
  { id: 'T04', name: 'เซนเซอร์ระดับคลองแบเมาะหัวสะพาน', lat: 6.5391, lng: 101.2758, waterLevelMsl: 3.10, criticalLevel: 3.50, warningLevel: 2.90, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 240.2, flowRate: 85 },
  { id: 'T05', name: 'เซนเซอร์บึงน้ำสวนสาธารณะสนามช้าง', lat: 6.5532, lng: 101.2798, waterLevelMsl: 1.85, criticalLevel: 2.30, warningLevel: 1.80, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 210.0, flowRate: 45 },
  { id: 'T06', name: 'เซนเซอร์คลองชลประทานสะเตงนอก', lat: 6.5342, lng: 101.3072, waterLevelMsl: 2.45, criticalLevel: 2.80, warningLevel: 2.30, batteryStatus: 'critical', healthStatus: 'unstable', rainfall24h: 265.8, flowRate: 70 },
  { id: 'T07', name: 'เซนเซอร์ปตร.น้ำคลองบาโด (Inflow)', lat: 6.5574, lng: 101.2541, waterLevelMsl: 3.65, criticalLevel: 3.80, warningLevel: 3.20, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 301.2, flowRate: 210 },
  { id: 'T08', name: 'เซนเซอร์ระดับน้ำเปาะเส้ง-ลิดล', lat: 6.5200, lng: 101.2421, waterLevelMsl: 5.12, criticalLevel: 4.80, warningLevel: 4.20, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 303.6, flowRate: 350 }, // Over critical!
  { id: 'T09', name: 'เซนเซอร์หน้าประตูและพนังยุโป', lat: 6.5891, lng: 101.2619, waterLevelMsl: 4.98, criticalLevel: 5.10, warningLevel: 4.40, batteryStatus: 'low', healthStatus: 'healthy', rainfall24h: 285.4, flowRate: 390 },
  { id: 'T10', name: 'เซนเซอร์แก้มลิงบึงตาเซะ', lat: 6.6141, lng: 101.3110, waterLevelMsl: 2.90, criticalLevel: 3.40, warningLevel: 2.80, batteryStatus: 'good', healthStatus: 'healthy', rainfall24h: 278.0, flowRate: 156 },
  { id: 'T11', name: 'เซนเซอร์ปตร.คลองกูแบรายอ', lat: 6.5310, lng: 101.2762, waterLevelMsl: 3.25, criticalLevel: 3.60, warningLevel: 3.00, batteryStatus: 'good', healthStatus: 'offline', rainfall24h: 299.1, flowRate: 0 } // OFFLINE sensor
];

// 7 Evacuation Shelters in Yala (Capacity limits and real occupation counts)
export const YALA_SHELTERS: EvacuationShelter[] = [
  { id: 'S01', name: 'ศูนย์พักพิงโรงเรียนเทศบาล 4 (ตลาดเก่า)', lat: 6.5515, lng: 101.2922, capacity: 450, occupied: 412, status: 'available', contactPhone: '073-212111' },
  { id: 'S02', name: 'ศูนย์พักพิงวิทยาลัยเทคนิคยลา', lat: 6.5415, lng: 101.2891, capacity: 800, occupied: 792, status: 'available', contactPhone: '073-221312' }, // Near capacity
  { id: 'S03', name: 'ศูนย์ช่วยเหลือและพักพิงวัดเมืองยลา', lat: 6.5448, lng: 101.2792, capacity: 350, occupied: 350, status: 'full', contactPhone: '073-214432' },  // FULL
  { id: 'S04', name: 'ศูนย์อพยพ อบต.ท่าสาป (หลังใหม่)', lat: 6.5621, lng: 101.2685, capacity: 500, occupied: 420, status: 'available', contactPhone: '073-255410' },
  { id: 'S05', name: 'ศูนย์พักพิงชั่วคราวโรงเรียนบ้านยุโป', lat: 6.5912, lng: 101.2642, capacity: 250, occupied: 245, status: 'available', contactPhone: '081-1234456' },
  { id: 'S06', name: 'ศูนย์อพยพวัดเวฬุวัน-สารสาธิต', lat: 6.5541, lng: 101.2721, capacity: 300, occupied: 120, status: 'available', contactPhone: '073-219905' },
  { id: 'S07', name: 'ศูนย์พักระบายอพยพ เทศบาลตำบลตาเซะ', lat: 6.6110, lng: 101.3101, capacity: 200, occupied: 200, status: 'full', contactPhone: '089-7654321' } // FULL
];

// Simple bounding coordinates to generate GeoJSON boundaries around Yala Municipality
export const getYalaBoundaryGeoJSON = () => {
  // A circular-type polygonal boundary around Yala city for Leaflet display
  return {
    type: 'Feature',
    properties: {
      name: 'เขตเทศบาลนครยลาและพื้นที่รอบแม่น้ำปัตตานี',
      province: 'ยลา'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [101.2600, 6.5700],
          [101.2800, 6.5750],
          [101.3000, 6.5720],
          [101.3150, 6.5600],
          [101.3250, 6.5400],
          [101.3150, 6.5200],
          [101.3000, 6.5100],
          [101.2800, 6.5150],
          [101.2600, 6.5100],
          [101.2400, 6.5200],
          [101.2300, 6.5400],
          [101.2420, 6.5600],
          [101.2600, 6.5700]
        ]
      ]
    }
  };
};
