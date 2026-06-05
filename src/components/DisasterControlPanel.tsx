/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Layers, 
  MapPin, 
  Settings, 
  Radio, 
  Home, 
  HelpCircle,
  Activity,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface DisasterControlPanelProps {
  activeLayers: {
    floodRiskHeatmap: boolean;
    waterLevelPoints: boolean;
    pumpStations: boolean;
    telemetrySensors: boolean;
    evacuationShelters: boolean;
    sosReports: boolean;
  };
  onToggleLayer: (layer: string) => void;
  calculatedScore: number;
  calculatedStatus: string;
  rainfallCurrent: number;
  openSheltersCount: number;
  distressVulnerableCount: number;
  pumpSuccessRate: number;
}

export default function DisasterControlPanel({
  activeLayers,
  onToggleLayer,
  calculatedScore,
  calculatedStatus,
  rainfallCurrent,
  openSheltersCount,
  distressVulnerableCount,
  pumpSuccessRate
}: DisasterControlPanelProps) {

  // Simple simulated rainfall history for Yala municipality
  const rainHistoryData = [
    { day: 'วันแรก', rainfall: 45 },
    { day: 'วันที่ 2', rainfall: 120 },
    { day: 'วันที่ 3', rainfall: 280 },
    { day: 'วันที่ 4', rainfall: 303.6 }, // peak
    { day: 'วันที่ 5', rainfall: rainfallCurrent },
  ];

  return (
    <div className="flex flex-col gap-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 backdrop-blur-xl shadow-2xl h-full custom-scrollbar overflow-y-auto">
      {/* Risk Metrics Banner */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h2 className="text-[10px] font-semibold text-slate-350 uppercase tracking-widest font-mono">แผงควบคุมหลัก • DEC PANEL</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.04] shadow-inner">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-450"></span>
          </span>
          <span className="text-[8px] font-mono font-medium text-slate-500 tracking-wider">LIVE DATA</span>
        </div>
      </div>

      {/* Main Status Metrics */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Risk meter */}
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 hover:border-white/[0.08]">
          <div className={`absolute top-0 left-0 h-[1.5px] w-full ${
            calculatedStatus === 'Critical' ? 'bg-rose-500' :
            calculatedStatus === 'Warning' ? 'bg-amber-500' :
            'bg-emerald-500'
          }`} />
          <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider mb-1 font-medium">Risk INDEX</span>
          <span className="text-2xl font-light tracking-tight text-white font-mono leading-none">
            {calculatedScore.toFixed(0)}<span className="text-[10px] text-slate-650 font-light">/100</span>
          </span>
          <span className={`text-[8px] font-semibold px-2 py-0.5 mt-2.5 rounded-sm block uppercase tracking-wider ${
            calculatedStatus === 'Critical' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
            calculatedStatus === 'Warning' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
            'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
          }`}>
            {calculatedStatus === 'Critical' ? 'วิกฤตสูงสุด' : calculatedStatus === 'Warning' ? 'เฝ้าระวัง' : 'ปกติ'}
          </span>
        </div>

        {/* Rain Metrics */}
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col justify-between transition-all duration-300 hover:border-white/[0.08]">
          <div>
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block mb-1 font-medium">น้ำฝน 24 ชม.</span>
            <span className="text-xl font-light font-mono text-slate-100">{rainfallCurrent.toFixed(1)} <span className="text-[10px] text-slate-550 font-light">mm</span></span>
          </div>
          <div className="text-[8.5px] text-slate-500 leading-none flex items-center gap-1.5 pt-2 border-t border-white/[0.03] mt-2.5">
            {rainfallCurrent > 200 ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-455 animate-pulse" />
                <span className="text-rose-400 font-medium">ล้นคันกั้นตลิ่ง</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-450" />
                <span className="text-emerald-400 font-medium">ต่ำกว่าระดับควบคุม</span>
              </>
            )}
          </div>
        </div>

        {/* Vulnerables distressed */}
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col justify-between transition-all duration-300 hover:border-white/[0.08]">
          <div>
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block mb-1 font-medium">ร้องขอช่วยเหลือ</span>
            <span className="text-xl font-light font-mono text-rose-300">{distressVulnerableCount} <span className="text-[10px] text-slate-550 font-light">ราย</span></span>
          </div>
          <span className="text-[8px] text-slate-500 block leading-tight pt-1.5 border-t border-white/[0.03] mt-2 font-mono">ผู้ประสบภัยในระบบ</span>
        </div>

        {/* Pump efficiency */}
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col justify-between transition-all duration-300 hover:border-white/[0.08]">
          <div>
            <span className="text-[8.5px] text-slate-500 uppercase font-mono tracking-wider block mb-1 font-medium">กำลังการระบายน้ำ</span>
            <span className="text-xl font-light font-mono text-emerald-300">{pumpSuccessRate.toFixed(0)}% <span className="text-[10px] text-slate-550 font-light">กำลัง</span></span>
          </div>
          <span className="text-[8px] text-slate-500 block leading-tight pt-1.5 border-t border-white/[0.03] mt-2 font-mono">อัตราสถานีใช้งานได้</span>
        </div>
      </div>

      {/* Map Layer Controls */}
      <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-xl flex flex-col gap-3.5">
        <h3 className="text-[10px] font-semibold text-slate-350 flex items-center gap-2 mb-1 pb-1.5 border-b border-white/[0.04]">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tracking-wider uppercase font-mono">เปิด/ปิด เลเยอร์แผนที่ • LAYERS</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Layer toggles */}
          <button
            id="layer-heatmap-toggle"
            onClick={() => onToggleLayer('floodRiskHeatmap')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.floodRiskHeatmap 
                ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${activeLayers.floodRiskHeatmap ? 'text-rose-455 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">ความเสี่ยงท่วมขัง</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">Heatmap</span>
            </div>
          </button>

          <button
            id="layer-water-toggle"
            onClick={() => onToggleLayer('waterLevelPoints')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.waterLevelPoints 
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 shrink-0 ${activeLayers.waterLevelPoints ? 'text-amber-455' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">ระดับน้ำแม่น้ำ</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">Water level</span>
            </div>
          </button>

          <button
            id="layer-pump-toggle"
            onClick={() => onToggleLayer('pumpStations')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.pumpStations 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <Settings className={`w-3.5 h-3.5 shrink-0 ${activeLayers.pumpStations ? 'text-emerald-455 animate-spin-slow' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">สถานีสูบระบาย</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">Pumps</span>
            </div>
          </button>

          <button
            id="layer-sensor-toggle"
            onClick={() => onToggleLayer('telemetrySensors')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.telemetrySensors 
                ? 'bg-sky-500/5 border-sky-500/20 text-sky-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 shrink-0 ${activeLayers.telemetrySensors ? 'text-sky-455' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">ระบบ Telemetry</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">Sensors</span>
            </div>
          </button>

          <button
            id="layer-shelter-toggle"
            onClick={() => onToggleLayer('evacuationShelters')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.evacuationShelters 
                ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <Home className={`w-3.5 h-3.5 shrink-0 ${activeLayers.evacuationShelters ? 'text-indigo-455' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">ศูนย์ลี้ภัยอพยพ</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">Shelters</span>
            </div>
          </button>

          <button
            id="layer-sos-toggle"
            onClick={() => onToggleLayer('sosReports')}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
              activeLayers.sosReports 
                ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' 
                : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:bg-white/[0.03] hover:border-white/[0.08]'
            }`}
          >
            <HelpCircle className={`w-3.5 h-3.5 shrink-0 ${activeLayers.sosReports ? 'text-rose-455 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-medium tracking-wide">จุดขอช่วยเหลือ</span>
              <span className="text-[7px] text-slate-555 font-mono mt-0.5">SOS Pin</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Graphing Rainfall History */}
      <div className="bg-[#0b0c10]/30 p-4 border border-white/[0.03] rounded-xl flex flex-col justify-between min-h-[160px] mt-auto">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[9px] text-slate-400 font-mono font-medium tracking-wider uppercase">กราฟฝนสะสม / Rainfall History</span>
          <span className="text-[8px] bg-white/[0.03] px-1.5 py-0.5 rounded text-indigo-400 font-mono font-semibold">Max 303.6 mm</span>
        </div>
        <div className="w-full h-20 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Background grids */}
            <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Area Path */}
            <path
              d={`
                M 0 100
                L 0 ${100 - (rainHistoryData[0].rainfall / 350) * 85}
                L 75 ${100 - (rainHistoryData[1].rainfall / 350) * 85}
                L 150 ${100 - (rainHistoryData[2].rainfall / 350) * 85}
                L 225 ${100 - (rainHistoryData[3].rainfall / 350) * 85}
                L 300 ${100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 85}
                L 300 100
                Z
              `}
              fill="url(#chartGrad)"
            />

            {/* Stroke Line */}
            <path
              d={`
                M 0 ${100 - (rainHistoryData[0].rainfall / 350) * 85}
                L 75 ${100 - (rainHistoryData[1].rainfall / 350) * 85}
                L 150 ${100 - (rainHistoryData[2].rainfall / 350) * 85}
                L 225 ${100 - (rainHistoryData[3].rainfall / 350) * 85}
                L 300 ${100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 85}
              `}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
            />

            {/* Glowing dots at data checkpoints */}
            <circle cx="0" cy={100 - (rainHistoryData[0].rainfall / 350) * 85} r="2" fill="#818cf8" />
            <circle cx="75" cy={100 - (rainHistoryData[1].rainfall / 350) * 85} r="2" fill="#818cf8" />
            <circle cx="150" cy={100 - (rainHistoryData[2].rainfall / 350) * 85} r="2" fill="#818cf8" />
            <circle cx="225" cy={100 - (rainHistoryData[3].rainfall / 350) * 85} r="2" fill="#f43f5e" />
            <circle cx="300" cy={100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 85} r="2" fill="#818cf8" />
          </svg>
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[7px] text-slate-500 font-mono tracking-wide px-1 mt-2">
          <span>DAY 1</span>
          <span>DAY 2</span>
          <span>DAY 3</span>
          <span className="text-rose-400 font-semibold">DAY 4 (CRIT)</span>
          <span>CURRENT</span>
        </div>

        <span className="text-[7.5px] text-slate-550 border-t border-white/[0.03] pt-2 text-center block mt-2 font-mono">
          Yala Flood Warning System Historical Criteria
        </span>
      </div>
    </div>
  );
}
