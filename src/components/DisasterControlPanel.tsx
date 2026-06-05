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
    <div className="flex flex-col gap-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-xl h-full">
      {/* Risk Metrics Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-widest">แผงควบคุมหลัก • DEC PANEL</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/5 shadow-inner">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          <span className="text-[9px] font-mono font-medium text-slate-400 tracking-wider">LIVE DATA</span>
        </div>
      </div>

      {/* Main Status Metrics */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Risk meter */}
        <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
          <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mb-1 font-medium">Risk INDEX</span>
          <span className="text-2xl font-light tracking-tight text-white font-mono leading-none">
            {calculatedScore.toFixed(0)}<span className="text-xs text-slate-500 font-light">/100</span>
          </span>
          <span className={`text-[9px] font-semibold px-2 py-0.5 mt-2.5 rounded-full block uppercase tracking-wider ${
            calculatedStatus === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            calculatedStatus === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {calculatedStatus === 'Critical' ? 'วิกฤตสูงสุด' : calculatedStatus === 'Warning' ? 'เฝ้าระวัง' : 'ปกติเฝ้าระวัง'}
          </span>
        </div>

        {/* Rain Metrics */}
        <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block mb-1 font-medium">น้ำฝน 24 ชม.</span>
            <span className="text-xl font-light font-mono text-slate-100">{rainfallCurrent.toFixed(1)} <span className="text-xs text-slate-400 font-light">mm</span></span>
          </div>
          <div className="text-[9px] text-slate-400/90 leading-none flex items-center gap-1.5 pt-2 border-t border-slate-900 mt-2.5">
            {rainfallCurrent > 200 ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 font-medium">ล้นคันกั้นตลิ่ง</span>
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
        <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block mb-1 font-medium">ร้องขอช่วยเหลือ</span>
            <span className="text-xl font-light font-mono text-rose-400">{distressVulnerableCount} <span className="text-xs text-slate-500 font-light">ราย</span></span>
          </div>
          <span className="text-[9px] text-slate-500 block leading-tight pt-1.5 border-t border-slate-900 mt-2 font-light">ผู้ประสบภัยในระบบ</span>
        </div>

        {/* Pump efficiency */}
        <div className="bg-slate-950/20 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block mb-1 font-medium">กำลังการระบายน้ำ</span>
            <span className="text-xl font-light font-mono text-emerald-400">{pumpSuccessRate.toFixed(0)}% <span className="text-xs text-slate-500 font-light">กำลัง</span></span>
          </div>
          <span className="text-[9px] text-slate-500 block leading-tight pt-1.5 border-t border-slate-900 mt-2 font-light">อัตราสถานีใช้งานได้</span>
        </div>
      </div>

      {/* Map Layer Controls */}
      <div className="bg-slate-950/10 p-4 border border-slate-800/45 rounded-xl flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2 mb-1 pb-1.5 border-b border-slate-800/60">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tracking-wider uppercase text-[10px]">เปิด/ปิด เลเยอร์แผนที่ (Map Layers)</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Layer toggles */}
          <button
            id="layer-heatmap-toggle"
            onClick={() => onToggleLayer('floodRiskHeatmap')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.floodRiskHeatmap 
                ? 'bg-red-500/5 border-red-500/35 text-red-300 shadow-[0_2px_10px_rgba(239,68,68,0.05)]' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">ความเสี่ยงท่วมขัง</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">ริมน้ำตลิ่งต่ำ</span>
            </div>
          </button>

          <button
            id="layer-water-toggle"
            onClick={() => onToggleLayer('waterLevelPoints')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.waterLevelPoints 
                ? 'bg-amber-500/5 border-amber-500/35 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.05)]' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">ระดับน้ำแม่น้ำ</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">สถานีเตือนภัยหลัก</span>
            </div>
          </button>

          <button
            id="layer-pump-toggle"
            onClick={() => onToggleLayer('pumpStations')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.pumpStations 
                ? 'bg-emerald-500/5 border-emerald-500/35 text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.05)]' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-spin-slow" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">สถานีสูบระบาย</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">แสดง 14 จุดสูบ</span>
            </div>
          </button>

          <button
            id="layer-sensor-toggle"
            onClick={() => onToggleLayer('telemetrySensors')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.telemetrySensors 
                ? 'bg-sky-500/5 border-sky-500/35 text-sky-300 shadow-[0_2px_10px_rgba(14,165,233,0.05)]' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-450 shrink-0" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">ระบบ Telemetry</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">พินอัปเดตอัตโนมัติ</span>
            </div>
          </button>

          <button
            id="layer-shelter-toggle"
            onClick={() => onToggleLayer('evacuationShelters')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.evacuationShelters 
                ? 'bg-indigo-500/5 border-indigo-500/35 text-indigo-300 shadow-[0_2px_10px_rgba(99,102,241,0.05)]' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">ศูนย์ศึกษาอพยพ</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">อัตราพักและเบอร์</span>
            </div>
          </button>

          <button
            id="layer-sos-toggle"
            onClick={() => onToggleLayer('sosReports')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
              activeLayers.sosReports 
                ? 'bg-rose-500/5 border-rose-500/35 text-rose-300 shadow-[0_2px_10px_rgba(244,63,94,0.05)] animate-pulse' 
                : 'bg-transparent border-slate-800/50 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-450 shrink-0" />
            <div className="flex flex-col select-none">
              <span className="text-[10px] leading-tight font-medium">SOS สัญญาณเดือด</span>
              <span className="text-[8px] text-slate-500 font-light mt-0.5">พินรายงานเรียลไทม์</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Graphing Rainfall History */}
      <div className="bg-slate-950/40 p-3 border border-slate-800/60 rounded-xl flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider block">สถิติปริมาณน้ำฝนสะสม รายชั่วโมง (5 วัน)</span>
          <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-blue-400 font-mono">สูงสุด 303.6 mm</span>
        </div>
        <div className="w-full h-24 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Background grids */}
            <line x1="0" y1="25" x2="300" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="300" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Area Path */}
            <path
              d={`
                M 0 100
                L 0 ${100 - (rainHistoryData[0].rainfall / 350) * 80}
                L 75 ${100 - (rainHistoryData[1].rainfall / 350) * 80}
                L 150 ${100 - (rainHistoryData[2].rainfall / 350) * 80}
                L 225 ${100 - (rainHistoryData[3].rainfall / 350) * 80}
                L 300 ${100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 80}
                L 300 100
                Z
              `}
              fill="url(#chartGrad)"
            />

            {/* Stroke Line */}
            <path
              d={`
                M 0 ${100 - (rainHistoryData[0].rainfall / 350) * 80}
                L 75 ${100 - (rainHistoryData[1].rainfall / 350) * 80}
                L 150 ${100 - (rainHistoryData[2].rainfall / 350) * 80}
                L 225 ${100 - (rainHistoryData[3].rainfall / 350) * 80}
                L 300 ${100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 80}
              `}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />

            {/* Glowing dots at data checkpoints */}
            <circle cx="0" cy={100 - (rainHistoryData[0].rainfall / 350) * 80} r="3" fill="#60a5fa" />
            <circle cx="75" cy={100 - (rainHistoryData[1].rainfall / 350) * 80} r="3" fill="#60a5fa" />
            <circle cx="150" cy={100 - (rainHistoryData[2].rainfall / 350) * 80} r="3" fill="#60a5fa" />
            <circle cx="225" cy={100 - (rainHistoryData[3].rainfall / 350) * 80} r="3" fill="#f43f5e" className="animate-ping" />
            <circle cx="300" cy={100 - (Math.min(350, rainHistoryData[4].rainfall) / 350) * 80} r="3" fill="#3b82f6" />
          </svg>
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[8px] text-slate-500 font-medium px-1 mt-1">
          <span>เริ่มวันแรก</span>
          <span>วันที่ 2</span>
          <span>วันที่ 3</span>
          <span className="text-red-400">วันที่ 4 (วิกฤต)</span>
          <span>ปัจจุบัน</span>
        </div>

        <span className="text-[8px] text-slate-500 border-t border-slate-900 pt-1.5 text-center block mt-2">
          ข้อมูลย้อนหลังอิงตามเกณฑ์พยากรณ์อุทกภัยคาบยาว เทศบาลเมืองยะลา
        </span>
      </div>
    </div>
  );
}
