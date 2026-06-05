/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Plus, 
  Phone, 
  Users, 
  CheckCircle, 
  ShieldCheck,
  Send,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { YALA_COMMUNITIES } from '../data/floodMockData';
import { SOSReport } from './FloodMap';

interface SosCoordinatorProps {
  sosReports: SOSReport[];
  isLoggedIn: boolean;
  onAddSosReport: (report: Omit<SOSReport, 'id' | 'status'>) => Promise<void>;
  onUpdateSosStatus: (id: string, nextStatus: 'pending' | 'dispatching' | 'resolved') => Promise<void>;
  isPinningSosState: boolean;
  onTogglePinningState: () => void;
  selectedSosLat: number | null;
  selectedSosLng: number | null;
  onClearSelectedCoords: () => void;
}

export default function SosCoordinator({
  sosReports,
  isLoggedIn,
  onAddSosReport,
  onUpdateSosStatus,
  isPinningSosState,
  onTogglePinningState,
  selectedSosLat,
  selectedSosLng,
  onClearSelectedCoords
}: SosCoordinatorProps) {
  // Form States
  const [communityName, setCommunityName] = useState(YALA_COMMUNITIES[0].name);
  const [vulnerablePop, setVulnerablePop] = useState(1);
  const [category, setCategory] = useState<'rescue' | 'water_food' | 'medical_aid' | 'power_outage'>('rescue');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterPhone.trim()) {
      alert("กรุณากรอกชื่อผู้แจ้งและเบอร์โทรศัพท์ติดต่อกลับ");
      return;
    }

    // Coordinates fallback to community centroids if not manually clicked on the map
    let lat = 6.5512;
    let lng = 101.2882;
    if (selectedSosLat && selectedSosLng) {
      lat = selectedSosLat;
      lng = selectedSosLng;
    } else {
      const community = YALA_COMMUNITIES.find(c => c.name === communityName);
      if (community) {
        lat = community.lat;
        lng = community.lng;
      }
    }

    setIsSubmitting(true);
    try {
      await onAddSosReport({
        lat,
        lng,
        communityName,
        vulnerablePop,
        category,
        severity: vulnerablePop > 3 ? 'critical' : 'high',
        reporterName,
        reporterPhone,
        description
      });
      // Clear form except coordinate pinning to prevent rapid double pings
      setReporterName('');
      setReporterPhone('');
      setDescription('');
      onClearSelectedCoords();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl shadow-xl h-full">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-widest font-sans">ระบบประสานกู้ภัยอพยพ • SOS DISPATCH</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* Left Column (5/12): Add report form */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 border-r border-[#1e2338]/40 pr-0 lg:pr-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-semibold tracking-wider text-slate-350">บันทึกรายงานพิกัดฉุกเฉิน</h3>
            {isPinningSosState ? (
              <button
                id="cancel-pinning-btn"
                onClick={onTogglePinningState}
                className="bg-red-550/10 text-red-300 border border-red-500/20 px-2.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold flex items-center gap-1 cursor-pointer transition-all hover:bg-red-550/20"
              >
                <X className="w-2.5 h-2.5" /> ยกเลิก
              </button>
            ) : (
              <button
                id="start-pinning-btn"
                onClick={onTogglePinningState}
                className="bg-indigo-505/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 px-2.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold flex items-center gap-1 cursor-pointer transition-all"
                title="คลิกเพื่อเลือกตำแหน่งพิกัดบนแผนที่โดยตรง"
              >
                <Plus className="w-2.5 h-2.5 text-cyan-400" /> ปักพิกัดฉุกเฉิน
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs text-left">
            {/* Display pinning information */}
            {selectedSosLat && selectedSosLng ? (
              <div className="bg-red-500/5 border border-red-500/25 rounded-lg p-2 flex items-center justify-between text-[10px] text-red-200">
                <div className="flex items-center gap-1.5 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div>
                    <span className="font-semibold block uppercase tracking-wider text-[8px]">MAP POSITION READY:</span>
                    <span className="text-slate-400 font-mono text-[9px]">{selectedSosLat.toFixed(5)}, {selectedSosLng.toFixed(5)}</span>
                  </div>
                </div>
                <button 
                  id="clear-pinned-coord-btn"
                  type="button" 
                  onClick={onClearSelectedCoords} 
                  className="text-slate-500 hover:text-slate-300 shrink-0 font-medium p-1 cursor-pointer text-[9px] uppercase tracking-wider"
                >
                  ล้าง
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/20 p-2 rounded-lg text-slate-550 text-[9px] text-center border border-dashed border-slate-800/80 font-light leading-snug">
                ระบบระบุพิกัดอัตโนมัติตามจุดศูนย์กลางชุมชนชราภาพที่ปักไว้เป็นเป้าหมายหลัก
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">เลือกชุมชนที่ประสบภัย</label>
                <select
                  id="community-select"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 focus:border-indigo-500/60 focus:outline-hidden"
                >
                  {YALA_COMMUNITIES.map(comm => (
                    <option key={comm.id} value={comm.name} className="text-slate-850">
                      {comm.name} ({comm.subdistrict})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">ประเภทภัยพิบัติ</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 focus:border-indigo-500/60 focus:outline-hidden"
                >
                  <option value="rescue" className="text-slate-850">อพยพติดค้าง / ช่วยเหลือ</option>
                  <option value="water_food" className="text-slate-850">ขาดแคลนอาหาร / น้ำ</option>
                  <option value="medical_aid" className="text-slate-850">ยารักษาโรค / เตียงสนาม</option>
                  <option value="power_outage" className="text-slate-850">กระแสไฟฟ้าดับเป็นวงกว้าง</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">จำนวนประชาชนติดค้าง</label>
                <input
                  id="vulnerable-count-input"
                  type="number"
                  min="1"
                  max="100"
                  value={vulnerablePop}
                  onChange={(e) => setVulnerablePop(Math.max(1, Number(e.target.value)))}
                  className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 font-mono text-center focus:border-indigo-500/60 focus:outline-hidden font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">เบอร์โทรศัพท์ผู้ติดต่อ</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-500" />
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="เช่น 08x-xxxxxxx"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 pl-8 w-full focus:border-indigo-500/60 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">ชื่อผู้แจ้งเหตุฉุกเฉิน</label>
              <input
                id="reporter-name-input"
                type="text"
                placeholder="กรุณากรอกชื่อจริง-นามสกุล..."
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 focus:border-indigo-500/60 focus:outline-hidden"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">รายละเอียดความต้องการเพิ่มเติม</label>
              <textarea
                id="description-input"
                placeholder="เช่น ผู้ป่วยติดเตียงต้องการเตียงสนามเคลื่อนย้าย, น้ำเริ่มล้นกำแพงบ้าน..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-slate-900/65 border border-slate-800/80 text-slate-200 rounded p-1.5 resize-none focus:border-indigo-500/60 focus:outline-hidden"
              />
            </div>

            <button
              id="submit-sos-btn"
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center gap-2 bg-rose-600/90 hover:bg-rose-500 text-slate-100 hover:text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-rose-950/20 transition-all duration-300 cursor-pointer text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังส่งข้อมูลเข้าศูนย์ปฏิบัติการ...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span className="uppercase tracking-wider text-[9px] font-medium">บันทึกสัญญาณกู้ภัย (SUBMIT SOS SIGNAL)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (7/12): Live feed dispatch log */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-semibold tracking-wider text-slate-350 flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>รายการแจ้งเหตุเรียลไทม์ ({sosReports.filter(r => r.status !== 'resolved').length})</span>
            </h3>
            <span className="text-[8px] text-slate-500 font-mono">SYNCED WITH FIRESTORE</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] border border-slate-800/60 rounded-xl bg-slate-950/20 p-2 text-xs flex flex-col gap-2.5 custom-scrollbar font-light">
            {sosReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500 p-8">
                <ShieldCheck className="w-8 h-8 text-slate-800" />
                <span className="leading-normal text-[10px] text-slate-400">ขณะนี้ไม่มีสายโทรช่วยเหลือแจ้ง SOS ในระบบ</span>
              </div>
            ) : (
              sosReports.map(rp => {
                let badgeColor = "bg-rose-500/10 text-rose-350 border-rose-550/20";
                let catText = "ช่วยชีพ";
                
                if (rp.category === 'water_food') {
                  badgeColor = "bg-orange-500/10 text-orange-355 border-orange-550/20";
                  catText = "เสบียงอาหาร";
                } else if (rp.category === 'medical_aid') {
                  badgeColor = "bg-red-500/10 text-red-355 border-red-550/20";
                  catText = "ยารักษาโรค";
                } else if (rp.category === 'power_outage') {
                  badgeColor = "bg-yellow-500/10 text-yellow-355 border-yellow-550/20";
                  catText = "ระบบไฟดับ";
                }

                if (rp.status === 'resolved') {
                  badgeColor = "bg-slate-900 border-slate-800 text-slate-500";
                }

                return (
                  <div 
                    key={rp.id}
                    className={`p-3 border rounded-xl flex flex-col gap-2 text-left relative overflow-hidden transition-all duration-300 ${
                      rp.status === 'resolved' 
                        ? 'bg-slate-950/5 border-slate-900/60 opacity-40' 
                        : rp.status === 'dispatching'
                        ? 'bg-amber-950/5 border-amber-500/20 shadow-xs'
                        : 'bg-rose-950/5 border-rose-500/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-semibold tracking-wider ${badgeColor}`}>
                          {catText}
                        </span>
                        <span className="font-semibold text-slate-200">ชุมชน{rp.communityName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider font-semibold uppercase ${
                        rp.status === 'pending' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        rp.status === 'dispatching' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-850 text-slate-400 border border-slate-700/80'
                      }`}>
                        {rp.status}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[10px] leading-relaxed font-light">
                      {rp.description || 'ไม่ได้ระบุรายละเอียดข้อเดือดร้อนเพิ่มเติม'}
                    </p>

                    <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center text-[9px] text-slate-500 border-t border-white/[0.03] pt-2 gap-2 mt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-400 font-light">
                          <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          กลุ่มเปราะบาง: <b className="font-mono text-slate-200 font-bold">{rp.vulnerablePop} คน</b>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-405 hover:text-white transition-colors">
                          <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          {rp.reporterPhone} ({rp.reporterName})
                        </span>
                      </div>

                      {/* Operator dispatch buttons */}
                      {isLoggedIn && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end font-sans">
                          {rp.status === 'pending' && (
                            <button
                              onClick={() => onUpdateSosStatus(rp.id, 'dispatching')}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-transform hover:scale-105 active:scale-95 cursor-pointer text-[9px] uppercase tracking-wider"
                            >
                              ส่งทีมปฏิบัติงาน
                            </button>
                          )}
                          {(rp.status === 'pending' || rp.status === 'dispatching') && (
                            <button
                              onClick={() => onUpdateSosStatus(rp.id, 'resolved')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-transform hover:scale-105 active:scale-95 cursor-pointer text-[9px] uppercase tracking-wider flex items-center gap-0.5"
                            >
                              <Check className="w-2.5 h-2.5" /> เสร็จสิ้น
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
