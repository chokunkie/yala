/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Settings, 
  Activity, 
  Home, 
  ChevronRight, 
  AlertOctagon, 
  ShieldAlert, 
  Waves,
  Zap,
  CheckCircle,
  Wrench,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  CommunityPoint, 
  PumpStation, 
  TelemetrySensor, 
  EvacuationShelter 
} from '../data/floodMockData';

interface InfoDrawerProps {
  selectedId: string | null;
  selectedType: 'community' | 'pump' | 'sensor' | 'shelter' | 'sos' | null;
  onClose: () => void;
  pumps: PumpStation[];
  sensors: TelemetrySensor[];
  shelters: EvacuationShelter[];
  isLoggedIn: boolean;
  onUpdatePump: (id: string, updates: Partial<PumpStation>) => Promise<void>;
  onUpdateShelter: (id: string, updates: Partial<EvacuationShelter>) => Promise<void>;
}

export default function InfoDrawer({
  selectedId,
  selectedType,
  onClose,
  pumps,
  sensors,
  shelters,
  isLoggedIn,
  onUpdatePump,
  onUpdateShelter
}: InfoDrawerProps) {
  const [data, setData] = useState<any>(null);

  // Load and subscribe detail dynamically
  useEffect(() => {
    if (!selectedId || !selectedType) {
      setData(null);
      return;
    }

    if (selectedType === 'community') {
      import('../data/floodMockData').then(({ YALA_COMMUNITIES }) => {
        const comm = YALA_COMMUNITIES.find(c => c.id === selectedId);
        setData(comm ? { ...comm, title: 'จุดพื้นที่เสี่ยงชุมชนภัยพิบัติ' } : null);
      });
    } else if (selectedType === 'pump') {
      const pm = pumps.find(p => p.id === selectedId);
      setData(pm ? { ...pm, title: 'สถานีสูบระบายน้ำบรรเทาอุทกภัย' } : null);
    } else if (selectedType === 'sensor') {
      const sn = sensors.find(s => s.id === selectedId);
      setData(sn ? { ...sn, title: 'Telemetry เซนเซอร์วัดระดับน้ำและน้ำฝน' } : null);
    } else if (selectedType === 'shelter') {
      const sh = shelters.find(s => s.id === selectedId);
      setData(sh ? { ...sh, title: 'ศูนย์พักพิงและอพยพผู้ประสบอุทกภัยยะลา' } : null);
    }
  }, [selectedId, selectedType, pumps, sensors, shelters]);

  if (!selectedId || !data) return null;

  const handleTogglePumpState = async () => {
    if (selectedType !== 'pump') return;
    const nextState = !data.isOperational;
    await onUpdatePump(data.id, {
      isOperational: nextState,
      flowRate: nextState ? Number((data.capacity * 0.8).toFixed(1)) : 0
    });
  };

  const handleRepairPumpEngine = async () => {
    if (selectedType !== 'pump') return;
    await onUpdatePump(data.id, {
      isEngineFlooded: false,
      isOperational: true,
      flowRate: Number((data.capacity * 0.7).toFixed(1))
    });
  };

  const handleAdjustShelterOccupancy = async (change: number) => {
    if (selectedType !== 'shelter') return;
    const nextOccupants = Math.max(0, Math.min(data.capacity, data.occupied + change));
    await onUpdateShelter(data.id, {
      occupied: nextOccupants,
      status: nextOccupants >= data.capacity ? 'full' : 'available'
    });
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className="w-full md:w-80 shrink-0 minimal-card p-4.5 flex flex-col gap-5 text-xs text-left text-slate-350 shadow-2xl relative border-white/[0.05]"
    >
      {/* Title section */}
      <div className="flex items-start justify-between border-b border-white/[0.04] pb-3">
        <div className="flex flex-col">
          <span className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest leading-none mb-1.5">Detailed Analytics</span>
          <h3 className="text-xs font-semibold text-slate-200">{data.title}</h3>
        </div>
        <button 
          id="close-drawer-btn"
          onClick={onClose} 
          className="p-1 hover:bg-white/[0.04] rounded text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Details */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[300px] md:max-h-[380px] pr-1 custom-scrollbar">
        {/* Geographic location headers */}
        <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] flex items-center gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-455 shrink-0" />
          <div className="flex flex-col font-mono text-[9px] leading-tight">
            <span className="text-slate-200 font-semibold">{data.name}</span>
            <span className="text-slate-500 mt-1">{data.lat.toFixed(5)}, {data.lng.toFixed(5)}</span>
          </div>
        </div>

        {/* Dynamic info body based on selection */}
        {selectedType === 'community' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">พิกัดตำบล</span>
                <span className="font-medium text-slate-300">ต. {data.subdistrict}</span>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">ดัชนีระดับเสี่ยง</span>
                <span className={`font-mono font-medium uppercase tracking-wider ${
                  data.riskLevel === 'critical' ? 'text-rose-455' : 'text-amber-450'
                }`}>
                  {data.riskLevel}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                <span className="font-mono text-[9px] font-semibold text-slate-300 uppercase tracking-wider">ประชากรเป้าหมาย</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                เนื่องจากชุมชนนี้ตั้งอยู่ขนานไปกับ<b>แม่น้ำปัตตานี</b> จึงมีประชากรกลุ่มเปราะบาง (ผู้สูงอายุ, ผู้ป่วยติดเตียง) รวมกลุ่มที่ต้องได้รับการช่วยเหลือด่วนทั้งหมด <span className="font-mono font-semibold text-rose-400">{data.vulnerablePop} ครัวเรือน</span> หากระดับน้ำ MSL หนาน้ำสะสมขึ้นแตะเส้นตลิ่ง
              </p>
            </div>
          </div>
        )}

        {selectedType === 'pump' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">แรงสูบสูงสุด</span>
                <span className="font-medium text-slate-350">{data.capacity} m³/s</span>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">ระบายปัจจุบัน</span>
                <span className="font-bold text-emerald-400 font-mono">{data.flowRate} m³/s</span>
              </div>
            </div>

            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">สถานะปั๊มสูบ:</span>
                <span className={`font-mono font-semibold text-[9.5px] uppercase tracking-wider ${data.isEngineFlooded ? 'text-rose-455 animate-pulse' : data.isOperational ? 'text-emerald-450' : 'text-slate-500'}`}>
                  {data.isEngineFlooded ? '⚠️ FLOODED' : data.isOperational ? 'RUNNING' : 'SHUT DOWN'}
                </span>
              </div>
            </div>

            {/* Operator control for pumps */}
            <div className="border-t border-white/[0.04] pt-3.5 flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-semibold">แผงควบคุมปั๊ม / PUMP CONTROL</span>
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  {data.isEngineFlooded ? (
                    <button
                      onClick={handleRepairPumpEngine}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono text-[9px] uppercase tracking-wider cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>REPAIR ENGINE</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleTogglePumpState}
                      className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-lg font-semibold font-mono text-[9px] uppercase tracking-wider cursor-pointer ${
                        data.isOperational 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{data.isOperational ? 'SHUT DOWN PUMP' : 'START PUMP'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg text-[8px] text-slate-550 text-center font-mono uppercase tracking-wider leading-snug">
                  🔒 AUTHENTICATION REQUIRED FOR OPERATIONAL DISPATCH
                </div>
              )}
            </div>
          </div>
        )}

        {selectedType === 'sensor' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">ระดับตลิ่งวิกฤต</span>
                <span className="font-semibold text-rose-455">{data.criticalLevel.toFixed(2)} ม.</span>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-550 font-mono block uppercase mb-1">ระดับน้ำปัจจุบัน</span>
                <span className={`font-mono font-bold ${
                  data.waterLevelMsl >= data.criticalLevel ? 'text-rose-500 animate-pulse' :
                  data.waterLevelMsl >= data.warningLevel ? 'text-amber-500' : 'text-slate-200'
                }`}>
                  {data.waterLevelMsl.toFixed(2)} ม.
                </span>
              </div>
            </div>

            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] flex flex-col gap-2.5">
              <div className="flex justify-between items-center bg-[#0b0c10]/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-slate-400">ปริมาณฝนสะสม (24h):</span>
                <span className="font-bold text-blue-400 font-mono">{data.rainfall24h} mm</span>
              </div>
              <div className="flex justify-between items-center bg-[#0b0c10]/20 p-2 rounded-lg border border-white/[0.02]">
                <span className="text-slate-400">สถานะอุปกรณ์:</span>
                <span className={`font-mono font-semibold text-[8px] rounded px-1.5 py-0.2 uppercase tracking-wider border ${
                  data.healthStatus === 'healthy' ? 'bg-emerald-500/5 text-emerald-355 border-emerald-500/15' :
                  data.healthStatus === 'unstable' ? 'bg-amber-500/5 text-amber-355 border-amber-500/15' : 'bg-slate-800 text-slate-400 border-slate-700/80'
                }`}>
                  {data.healthStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'shelter' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">ความจุสูงสุด</span>
                <span className="font-semibold text-slate-350">{data.capacity} คน</span>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-lg">
                <span className="text-[8px] text-slate-500 font-mono block uppercase mb-1">ผู้เข้าพักในศูนย์</span>
                <span className="font-bold text-indigo-400 font-mono">{data.occupied} คน</span>
              </div>
            </div>

            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">อัตราการใช้งาน:</span>
                <span className="font-bold text-slate-200 font-mono">{((data.occupied / data.capacity) * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-normal border-t border-white/[0.03] pt-2">
                ประสานสายตรง: <span className="font-mono font-semibold text-slate-200">{data.contactPhone}</span>
              </div>
            </div>

            {/* Operator controls for shelters */}
            <div className="border-t border-white/[0.04] pt-3.5 flex flex-col gap-2.5">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-semibold">ศูนย์อพยพ / SHELTER CAPACITY</span>
              {isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => handleAdjustShelterOccupancy(20)}
                    disabled={data.occupied >= data.capacity}
                    className="flex items-center justify-center gap-1 p-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold cursor-pointer text-[9px] font-mono uppercase tracking-wider"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ADD (+20)</span>
                  </button>

                  <button
                    onClick={() => handleAdjustShelterOccupancy(-20)}
                    disabled={data.occupied <= 0}
                    className="flex items-center justify-center gap-1 p-2 rounded bg-white/[0.02] hover:bg-white/[0.05] text-slate-350 border border-white/[0.05] font-semibold cursor-pointer text-[9px] font-mono uppercase tracking-wider"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>REDUCE (-20)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg text-[8px] text-slate-550 text-center font-mono uppercase tracking-wider leading-snug">
                  🔒 AUTHENTICATION REQUIRED TO ADJUST DENSITY
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Boundary footer metadata */}
      <div className="border-t border-white/[0.04] pt-2.5 text-[8px] text-slate-500 text-center leading-normal font-mono uppercase tracking-wider">
        DISASTER OPERATION DATABASE SYNC • ACTIVE
      </div>
    </motion.div>
  );
}
