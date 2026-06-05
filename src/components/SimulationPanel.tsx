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
    <div className="minimal-card p-5 flex flex-col gap-6 text-left">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          <h2 className="text-[10px] font-mono font-medium tracking-widest text-slate-300 uppercase">จำลองสถานการณ์ / CRISIS SIMULATOR</h2>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.04] text-[9px] text-slate-400 font-mono">
          <button 
            id="preset-dry-btn"
            onClick={() => loadPreset('dry')} 
            className="px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-slate-250 transition-all cursor-pointer font-light"
          >
            DRY
          </button>
          <button 
            id="preset-mod-btn"
            onClick={() => loadPreset('moderate')} 
            className="px-2 py-0.5 rounded hover:bg-white/[0.04] hover:text-slate-255 transition-all cursor-pointer font-light"
          >
            WARN
          </button>
          <button 
            id="preset-flood-btn"
            onClick={() => loadPreset('historic_flood')} 
            className="px-2 py-0.5 bg-rose-500/10 text-rose-350 border border-rose-500/20 rounded font-normal transition-all cursor-pointer"
          >
            CRIT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Left column: Rainfall and Water factors */}
        <div className="flex flex-col gap-4">
          {/* Sliders */}
          <div className="flex flex-col gap-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase">ปริมาณน้ำฝนสะสม (24 ชม.)</span>
              <span className="text-indigo-400 font-mono font-semibold">{params.rainfall_24h} mm</span>
            </div>
            <input 
              id="rainfall-24h-slider"
              type="range" 
              min="0" 
              max="350" 
              step="1"
              value={params.rainfall_24h}
              style={{ color: '#6366f1' }}
              onChange={(e) => handleSliderChange('rainfall_24h', Number(e.target.value))}
              className="w-full cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
              <span>MIN</span>
              <span>HISTORIC PEAK (303.6mm)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase">ปริมาณน้ำฝนสะสม (5 วัน)</span>
              <span className="text-sky-400 font-mono font-semibold">{params.rainfall_120h} mm</span>
            </div>
            <input 
              id="rainfall-120h-slider"
              type="range" 
              min="10" 
              max="1200" 
              step="10"
              value={params.rainfall_120h}
              style={{ color: '#38bdf8' }}
              onChange={(e) => handleSliderChange('rainfall_120h', Number(e.target.value))}
              className="w-full cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
              <span>MIN</span>
              <span>CRITICAL (1,072mm)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase">ระดับน้ำเทียบทะเลปานกลาง (MSL)</span>
              <span className="text-cyan-400 font-mono font-semibold">{params.water_level_msl.toFixed(2)} m</span>
            </div>
            <input 
              id="water-level-slider"
              type="range" 
              min="0.5" 
              max="6.0" 
              step="0.05"
              value={params.water_level_msl}
              style={{ color: '#22d3ee' }}
              onChange={(e) => handleSliderChange('water_level_msl', Number(e.target.value))}
              className="w-full cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
              <span>MIN (0.5m)</span>
              <span>CRIT FLOOD (5.2m)</span>
            </div>
          </div>
        </div>

        {/* Right column: Pump status, barriers and community distressed */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase">อัตราไหลแม่น้ำปัตตานี</span>
              <span className="text-teal-400 font-mono font-semibold">{params.flow_rate} m³/s</span>
            </div>
            <input 
              id="flow-rate-slider"
              type="range" 
              min="20" 
              max="800" 
              value={params.flow_rate}
              style={{ color: '#2dd4bf' }}
              onChange={(e) => handleSliderChange('flow_rate', Number(e.target.value))}
              className="w-full cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-0.5">
              <span>MIN</span>
              <span>RIVER SPILL (&gt; 500)</span>
            </div>
          </div>

          {/* Flooded pump and barrier selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
              <label className="text-slate-400 flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider font-semibold">
                <ZapOff className="w-3.5 h-3.5 text-rose-455 shrink-0" /> ปั๊มจมน้ำ/ดับ
              </label>
              <div className="flex items-center justify-between mt-2.5">
                <input 
                  id="flooded-pumps-slider"
                  type="number" 
                  min="0"
                  max="14"
                  value={params.flooded_pumps}
                  onChange={(e) => handleSliderChange('flooded_pumps', Math.max(0, Math.min(14, Number(e.target.value))))}
                  className="w-14 bg-white/[0.02] border border-white/[0.06] rounded-md text-center text-slate-200 font-mono text-xs py-1"
                />
                <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">/ 14 จุด</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
              <label className="text-slate-400 flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-455 shrink-0" /> พนังสำเร็จรูป
              </label>
              <div className="flex items-center gap-2 mt-2.5">
                <input 
                  id="barrier-checkbox"
                  type="checkbox" 
                  checked={params.barriers_deployed}
                  onChange={(e) => handleToggleChange('barriers_deployed', e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/[0.1] accent-emerald-500 text-slate-900 cursor-pointer"
                />
                <span className="text-[8.5px] font-mono tracking-wider font-semibold text-emerald-455 uppercase">
                  {params.barriers_deployed ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Social variables */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
              <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">ผู้ป่วยติดเตียง/เปราะบาง</label>
              <input 
                id="vulnerable-distress-input"
                type="number"
                min="0"
                value={params.vulnerable_distress}
                onChange={(e) => handleSliderChange('vulnerable_distress', Number(e.target.value))}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-md mt-2 py-1 px-2 text-slate-250 font-mono text-center text-xs"
              />
            </div>
            <div className="flex flex-col justify-between p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
              <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">การครองที่ศูนย์ลี้ภัย (%)</label>
              <input 
                id="shelter-capacity-input"
                type="number"
                min="0"
                max="100"
                value={params.shelter_capacity_pct}
                onChange={(e) => handleSliderChange('shelter_capacity_pct', Number(e.target.value))}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-md mt-2 py-1 px-2 text-slate-255 font-mono text-center text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.04] pt-4.5">
        {/* Execute button */}
        <button
          id="run-ai-prediction-btn"
          onClick={executePrediction}
          disabled={aiLoading}
          className="w-full flex items-center justify-center gap-2 border border-indigo-500/10 bg-indigo-600/10 hover:bg-indigo-650 disabled:bg-indigo-950/20 text-indigo-300 hover:text-white px-5 py-2.5 rounded-xl shadow-lg transition-all duration-200 cursor-pointer text-xs font-mono uppercase tracking-wider"
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>กำลังประมวลผลโมเดลจำลองภัยพิบัติ...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>วิเคราะห์ภัยคุกคามด้วยระบบ AI (Run Gemini Index)</span>
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
            className="overflow-hidden border-t border-white/[0.04] mt-1"
          >
            <div className="p-4 bg-white/[0.01] border border-indigo-500/10 rounded-xl mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner text-left">
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[9px] uppercase tracking-widest font-semibold">Gemini Intelligence Report</span>
                </div>
                <span className="text-[7.5px] text-indigo-400/90 font-mono px-2 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/15 tracking-widest">VERIFIED</span>
              </div>
              <div className="text-slate-300 leading-relaxed text-xs font-sans prose prose-invert prose-xs max-w-none font-light">
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
