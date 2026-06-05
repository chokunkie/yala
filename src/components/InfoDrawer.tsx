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
      className="w-full md:w-80 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 text-xs text-left text-slate-300 shadow-2xl relative"
    >
      {/* Title section */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex flex-col">
          <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider leading-none mb-1">Detailed Analytics</span>
          <h3 className="text-sm font-bold text-slate-100">{data.title}</h3>
        </div>
        <button 
          id="close-drawer-btn"
          onClick={onClose} 
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Details */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] md:max-h-[380px] pr-1 custom-scrollbar">
        {/* Geographic location headers */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-450 shrink-0" />
          <div className="flex flex-col font-mono text-[10px]">
            <span className="text-slate-100 leading-tight">{data.name}</span>
            <span className="text-slate-500 mt-0.5">{data.lat.toFixed(5)}, {data.lng.toFixed(5)}</span>
          </div>
        </div>

        {/* Dynamic info body based on selection */}
        {selectedType === 'community' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">พิกัดตำบล</span>
                <span className="font-semibold text-slate-200">ต. {data.subdistrict}</span>
              </div>
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ดัชนีระดับเสี่ยง</span>
                <span className={`font-semibold capitalize ${
                  data.riskLevel === 'critical' ? 'text-red-400 animate-pulse' : 'text-orange-400'
                }`}>
                  {data.riskLevel}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/25 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                <span className="font-semibold text-slate-200">สถิติประชากรเป้าหมาย</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                เนื่องจากชุมชนนี้ตั้งอยู่ขนานไปกับ<b>แม่น้ำปัตตานี</b> จึงมีประชากรกลุ่มเปราะบาง (ผู้สูงอายุ, ผู้ป่วยติดเตียง) รวมกลุ่มที่ต้องได้รับการช่วยเหลือด่วนทั้งหมด <span className="font-bold text-red-400">{data.vulnerablePop} ครัวเรือน</span> หากระดับน้ำ MSL หนาน้ำสะสมขึ้นแตะเส้นตลิ่ง
              </p>
            </div>
          </div>
        )}

        {selectedType === 'pump' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">แรงสูบลมสูงสุด</span>
                <span className="font-semibold text-slate-200">{data.capacity} m³/s</span>
              </div>
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ระบายปัจจุบัน</span>
                <span className="font-bold text-emerald-400 font-mono">{data.flowRate} m³/s</span>
              </div>
            </div>

            <div className="bg-slate-950/25 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">สถานะเครือข่ายสูบ:</span>
                <span className={`font-bold ${data.isEngineFlooded ? 'text-red-400' : data.isOperational ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {data.isEngineFlooded ? '⚠️ ดับ (FLOODED)' : data.isOperational ? 'กำลังระบายน้ำ (RUNNING)' : 'ปิดกำลังไฟ'}
                </span>
              </div>
            </div>

            {/* Operator control for pumps */}
            <div className="border-t border-slate-850/80 pt-3 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">แผงควบคุมสถานีสูบน้ำ (เฉพาะเจ้าหน้าที่)</span>
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  {data.isEngineFlooded ? (
                    <button
                      onClick={handleRepairPumpEngine}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold font-sans cursor-pointer transition-transform duration-75 active:scale-95"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>กู้ระบบเครื่องยนต์ (Dry & Start Pump)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleTogglePumpState}
                      className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-lg font-bold font-sans cursor-pointer transition-transform duration-75 active:scale-95 ${
                        data.isOperational 
                          ? 'bg-red-950 text-red-300 border border-red-800' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{data.isOperational ? 'สั่งหยุดปั๊มสูบ (Shut Down)' : 'เปิดกำลังสถานีสูบ (Start Pump)'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950/60 p-2.5 rounded text-[10px] text-slate-500 text-center leading-normal">
                  🔒 กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้กำกับสถานี<br />เพื่อปลดล็อกการสั่งระบายเครื่องสูบน้ำ
                </div>
              )}
            </div>
          </div>
        )}

        {selectedType === 'sensor' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ระดับตลิ่งวิกฤต</span>
                <span className="font-semibold text-red-400">{data.criticalLevel.toFixed(2)} ม.</span>
              </div>
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ระดับน้ำปัจจุบัน</span>
                <span className={`font-mono font-bold ${
                  data.waterLevelMsl >= data.criticalLevel ? 'text-red-500 animate-pulse' :
                  data.waterLevelMsl >= data.warningLevel ? 'text-amber-500' : 'text-slate-200'
                }`}>
                  {data.waterLevelMsl.toFixed(2)} ม.
                </span>
              </div>
            </div>

            <div className="bg-slate-950/25 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center bg-slate-950/30 p-1.5 rounded">
                <span className="text-slate-400">ปริมาณฝนสะสม (24h):</span>
                <span className="font-bold text-blue-400">{data.rainfall24h} mm</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/30 p-1.5 rounded">
                <span className="text-slate-400">สถานะฮาร์ดแวร์:</span>
                <span className={`font-semibold capitalize text-[10px] rounded px-1.5 py-0.2 ${
                  data.healthStatus === 'healthy' ? 'bg-emerald-900/30 text-emerald-400' :
                  data.healthStatus === 'unstable' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {data.healthStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'shelter' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ความจุสูงสุด</span>
                <span className="font-semibold text-slate-200">{data.capacity} คน</span>
              </div>
              <div className="bg-slate-950/25 p-2 rounded">
                <span className="text-[9px] text-slate-500 block uppercase mb-0.5">ผู้พักลี้ภัยค้างคืน</span>
                <span className="font-bold text-indigo-400 font-mono">{data.occupied} คน</span>
              </div>
            </div>

            <div className="bg-slate-950/25 p-3 rounded-lg border border-slate-800 text-xs">
              <div>ความตึงตัวลี้ภัย: <span className="font-bold">{((data.occupied / data.capacity) * 100).toFixed(0)}%</span></div>
              <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                ติดต่อศูนย์โทรประสานสายตรง: <b>{data.contactPhone}</b>
              </div>
            </div>

            {/* Operator controls for shelters */}
            <div className="border-t border-slate-850/80 pt-3 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">ประสานศูนย์อพยพ (เฉพาะเจ้าหน้าที่)</span>
              {isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAdjustShelterOccupancy(20)}
                    disabled={data.occupied >= data.capacity}
                    className="flex items-center justify-center gap-1 p-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-transform duration-75 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer text-[10px]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>เพิ่มอพยพ (+20)</span>
                  </button>

                  <button
                    onClick={() => handleAdjustShelterOccupancy(-20)}
                    disabled={data.occupied <= 0}
                    className="flex items-center justify-center gap-1 p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-transform duration-75 active:scale-95 disabled:bg-slate-850 disabled:text-slate-600 cursor-pointer text-[10px]"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>ลดอพยพ (-20)</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-2.5 rounded text-[10px] text-slate-500 text-center leading-normal">
                  🔒 กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้กำกับศูนย์เพื่อแก้ไขความหนาแน่นผู้พักพิง
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Boundary footer metadata */}
      <div className="border-t border-slate-850 pt-2 text-[9px] text-slate-500 text-center leading-normal">
        * ข้อมูลอ้างอิงและประสานงานทางเทคนิคได้รับการบันทึกเวลาจริง และตรวจสอบสถาปัตยกรรมความปลอดภัยร่วมกับ ปภ.ยะลา
      </div>
    </motion.div>
  );
}
