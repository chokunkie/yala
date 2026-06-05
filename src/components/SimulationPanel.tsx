/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Settings, 
  Info,
  Waves,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SimulationParams {
  rainfall_24h: number;
  rainfall_120h: number;
  water_level_msl: number;
  flow_rate: number;
  flooded_pumps: number;
  barriers_deployed: boolean;
  vulnerable_distress: number;
  sos_pings_count: number;
  shelter_capacity_pct: number;
}

interface SimulationPanelProps {
  initialParams: SimulationParams;
  onSimulate: (params: SimulationParams) => void;
  onRunAiPrediction: (params: SimulationParams) => Promise<void>;
  aiReport: string | null;
  aiLoading: boolean;
}

export default function SimulationPanel({
  initialParams,
  onSimulate,
  onRunAiPrediction,
  aiReport,
  aiLoading
}: SimulationPanelProps) {
  const [params, setParams] = useState<SimulationParams>(initialParams);

  const handleSliderChange = (field: keyof SimulationParams, value: number) => {
    const updated = { ...params, [field]: value };
    setParams(updated);
    onSimulate(updated); // propagate live to local calculations
  };

  const handleToggleChange = (field: keyof SimulationParams, checked: boolean) => {
    const updated = { ...params, [field]: checked };
    setParams(updated);
    onSimulate(updated);
  };

  const executePrediction = () => {
    onRunAiPrediction(params);
  };

  // Quick Presets to simulate historic flood states in Yala
  const loadPreset = (type: 'dry' | 'moderate' | 'historic_flood') => {
    let preset: SimulationParams;
    switch (type) {
      case 'dry':
        preset = {
          rainfall_24h: 12.5,
          rainfall_120h: 40.0,
          water_level_msl: 1.50,
          flow_rate: 85,
          flooded_pumps: 0,
          barriers_deployed: false,
          vulnerable_distress: 0,
          sos_pings_count: 0,
          shelter_capacity_pct: 12
        };
        break;
      case 'moderate':
        preset = {
          rainfall_24h: 120.4,
          rainfall_120h: 410.5,
          water_level_msl: 3.25,
          flow_rate: 260,
          flooded_pumps: 1,
          barriers_deployed: true,
          vulnerable_distress: 45,
          sos_pings_count: 3,
          shelter_capacity_pct: 48
        };
        break;
      case 'historic_flood':
        preset = {
          rainfall_24h: 303.6, //สูงสุดประวัติการณ์รายวัน
          rainfall_120h: 1072.0, //สะสม 5 วัน
          water_level_msl: 5.12, //ใกล้ล้นตลิ่งวิกฤต
          flow_rate: 620,
          flooded_pumps: 3,
          barriers_deployed: true,
          vulnerable_distress: 380,
          sos_pings_count: 14,
          shelter_capacity_pct: 88
        };
        break;
    }
    setParams(preset);
    onSimulate(preset);
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-widest">แผงจำลองสถานการณ์ • CRISIS ENGINE</h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 font-medium">
          <button 
            id="preset-dry-btn"
            onClick={() => loadPreset('dry')} 
            className="px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer font-light"
          >
            ปกติ
          </button>
          <button 
            id="preset-mod-btn"
            onClick={() => loadPreset('moderate')} 
            className="px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer font-light"
          >
            เตือนภัย
          </button>
          <button 
            id="preset-flood-btn"
            onClick={() => loadPreset('historic_flood')} 
            className="px-2 py-1 bg-red-950/60 text-red-300 border border-red-500/20 rounded font-normal transition-all cursor-pointer"
          >
            วิกฤต 2567
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Left column: Rainfall and Water factors */}
        <div className="flex flex-col gap-3.5">
          {/* Sliders */}
          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-950/20 border border-slate-900 rounded-lg">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">ปริมาณน้ำฝนสะสม (24 ชม.)</span>
              <span className="text-indigo-400 font-mono font-bold">{params.rainfall_24h} mm</span>
            </div>
            <input 
              id="rainfall-24h-slider"
              type="range" 
              min="0" 
              max="350" 
              step="1"
              value={params.rainfall_24h}
              onChange={(e) => handleSliderChange('rainfall_24h', Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-light mt-0.5">
              <span>ฝนเบา (&lt; 50mm)</span>
              <span className="text-red-400">สูงสุดสถิติ (303.6mm)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-950/20 border border-slate-900 rounded-lg">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">ฝนสะสมระยะยาว (5 วัน)</span>
              <span className="text-blue-400 font-mono font-bold">{params.rainfall_120h} mm</span>
            </div>
            <input 
              id="rainfall-120h-slider"
              type="range" 
              min="10" 
              max="1200" 
              step="10"
              value={params.rainfall_120h}
              onChange={(e) => handleSliderChange('rainfall_120h', Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-light mt-0.5">
              <span>ปกติ (&lt; 150mm)</span>
              <span className="text-indigo-400">วิกฤตสะสม (1,072mm)</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-950/20 border border-slate-900 rounded-lg">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">ระดับน้ำเหนือกึ่งกลาง (MSL)</span>
              <span className="text-cyan-400 font-mono font-bold">{params.water_level_msl.toFixed(2)} m</span>
            </div>
            <input 
              id="water-level-slider"
              type="range" 
              min="0.5" 
              max="6.0" 
              step="0.05"
              value={params.water_level_msl}
              onChange={(e) => handleSliderChange('water_level_msl', Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-light mt-0.5">
              <span>ต่ำเกณฑ์ (2m)</span>
              <span className="text-red-400">ล้นคันกั้นตลิ่ง (5.2m)</span>
            </div>
          </div>
        </div>

        {/* Right column: Pump status, barriers and community distressed */}
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-950/20 border border-slate-900 rounded-lg">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider">อัตราไหลแม่น้ำปัตตานี</span>
              <span className="text-teal-400 font-mono font-bold">{params.flow_rate} m³/s</span>
            </div>
            <input 
              id="flow-rate-slider"
              type="range" 
              min="20" 
              max="800" 
              value={params.flow_rate}
              onChange={(e) => handleSliderChange('flow_rate', Number(e.target.value))}
              className="w-full accent-teal-550 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-light mt-0.5">
              <span>ไหลปกติ (&lt; 150)</span>
              <span className="text-teal-400">เริ่มเอ่อล้น (&gt; 500)</span>
            </div>
          </div>

          {/* Flooded pump and barrier selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-center gap-1.5 p-2.5 border border-red-500/10 bg-red-950/5 rounded-lg shadow-xs">
              <label className="text-slate-400 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-medium">
                <ZapOff className="w-3.5 h-3.5 text-red-450 animate-pulse shrink-0" /> ระบบไฟดับ/จมน้ำ
              </label>
              <div className="flex items-center justify-between mt-1">
                <input 
                  id="flooded-pumps-slider"
                  type="number" 
                  min="0"
                  max="14"
                  value={params.flooded_pumps}
                  onChange={(e) => handleSliderChange('flooded_pumps', Math.max(0, Math.min(14, Number(e.target.value))))}
                  className="w-16 bg-slate-900/80 border border-slate-800/80 rounded text-center text-slate-100 font-mono text-xs py-1 font-semibold"
                />
                <span className="text-[8px] text-slate-550 font-mono uppercase tracking-wider">จาก 14 จุด</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1.5 p-2.5 border border-emerald-500/10 bg-emerald-950/5 rounded-lg shadow-xs">
              <label className="text-slate-400 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-medium cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-450 shrink-0" /> พนังสำเร็จรูปกั้นน้ำ
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  id="barrier-checkbox"
                  type="checkbox" 
                  checked={params.barriers_deployed}
                  onChange={(e) => handleToggleChange('barriers_deployed', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 accent-emerald-500 text-slate-950 cursor-pointer"
                />
                <span className="text-[9px] font-mono tracking-wider font-medium text-emerald-400">
                  {params.barriers_deployed ? 'DEPLOYED' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Social variables */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-between p-2 bg-slate-950/20 border border-slate-900 rounded-lg">
              <label className="text-slate-500 text-[8px] uppercase tracking-wider font-medium">กลุ่มเปราะบางติดค้าง</label>
              <input 
                id="vulnerable-distress-input"
                type="number"
                min="0"
                value={params.vulnerable_distress}
                onChange={(e) => handleSliderChange('vulnerable_distress', Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-800/80 rounded mt-1.5 py-0.5 px-2 text-slate-200 font-mono text-center text-xs font-semibold"
              />
            </div>
            <div className="flex flex-col justify-between p-2 bg-slate-950/20 border border-slate-900 rounded-lg">
              <label className="text-slate-500 text-[8px] uppercase tracking-wider font-medium">อัตราผู้เข้าพักลี้ภัย (%)</label>
              <input 
                id="shelter-capacity-input"
                type="number"
                min="0"
                max="100"
                value={params.shelter_capacity_pct}
                onChange={(e) => handleSliderChange('shelter_capacity_pct', Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-slate-800/80 rounded mt-1.5 py-0.5 px-2 text-slate-200 font-mono text-center text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row gap-3">
        {/* Execute button */}
        <button
          id="run-ai-prediction-btn"
          onClick={executePrediction}
          disabled={aiLoading}
          className="flex-1 flex items-center justify-center gap-2 border border-indigo-500/20 bg-indigo-600/90 hover:bg-indigo-500 disabled:bg-indigo-950/40 text-slate-100 hover:text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.005] active:scale-[0.995] disabled:scale-100 cursor-pointer text-xs font-medium uppercase"
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span className="tracking-wider text-[10px]">กำลังจำลองสถิติเชิงปริมาณด้วยปัญญาประดิษฐ์...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce shrink-0" />
              <span className="tracking-wide text-[10px]">วิเคราะห์ภัยคุกคามด้วยระบบปัญญาประดิษฐ์ (Local Predictive Model)</span>
            </>
          )}
        </button>
      </div>

      {/* Embedded AI Insight display */}
      <AnimatePresence>
        {aiReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-800/60 mt-1"
          >
            <div className="p-4 bg-slate-950/30 border border-indigo-500/10 rounded-xl mt-4 flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-semibold tracking-wider">เอกสารวิเคราะห์ความเสี่ยงเชิงพยากรณ์ • LOCAL AI INTEL</span>
                </div>
                <span className="text-[8px] text-indigo-400/80 font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 tracking-widest leading-none">ICT CONFIRMED</span>
              </div>
              <div className="text-slate-350 leading-relaxed text-xs font-sans text-left prose prose-invert prose-xs max-w-none font-light">
                {/* Visual rendering of Markdown report */}
                <div className="whitespace-pre-wrap">{aiReport}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
