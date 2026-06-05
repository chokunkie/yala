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
    <div className="minimal-card p-5 flex flex-col gap-6 h-full text-left">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <h2 className="text-[10px] font-mono font-medium tracking-widest text-slate-300 uppercase">ระบบประสานกู้ภัยอพยพ / SOS DISPATCH</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column (5/12): Add report form */}
        <div className="lg:col-span-5 flex flex-col gap-4 border-r border-white/[0.04] pr-0 lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] uppercase font-mono font-semibold tracking-wider text-slate-400">บันทึกรายงานพิกัดฉุกเฉิน / NEW LOG</h3>
            {isPinningSosState ? (
              <button
                id="cancel-pinning-btn"
                onClick={onTogglePinningState}
                className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider cursor-pointer transition-all hover:bg-rose-500/20"
              >
                <X className="w-2.5 h-2.5 inline mr-1" /> CANCEL
              </button>
            ) : (
              <button
                id="start-pinning-btn"
                onClick={onTogglePinningState}
                className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                title="คลิกเพื่อเลือกตำแหน่งพิกัดบนแผนที่โดยตรง"
              >
                <Plus className="w-2.5 h-2.5 text-indigo-400 inline mr-1" /> PIN MAP
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs text-left">
            {/* Display pinning information */}
            {selectedSosLat && selectedSosLng ? (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 flex items-center justify-between text-[9px] text-rose-200">
                <div className="flex items-center gap-2 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-rose-455 shrink-0" />
                  <div>
                    <span className="font-semibold block uppercase tracking-wider text-[8px] text-rose-400">MAP POSITION SELECTED:</span>
                    <span className="text-slate-400 font-mono">{selectedSosLat.toFixed(5)}, {selectedSosLng.toFixed(5)}</span>
                  </div>
                </div>
                <button 
                  id="clear-pinned-coord-btn"
                  type="button" 
                  onClick={onClearSelectedCoords} 
                  className="text-slate-500 hover:text-slate-350 shrink-0 font-mono p-1 cursor-pointer text-[8px] uppercase tracking-wider"
                >
                  CLEAR
                </button>
              </div>
            ) : (
              <div className="bg-white/[0.01] p-2.5 rounded-lg text-slate-550 text-[8px] text-center border border-dashed border-white/[0.04] font-mono uppercase tracking-wider leading-snug">
                AUTO-RESOLVING TO COMMUNITY CENTROID
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">เลือกชุมชนที่ประสบภัย</label>
                <select
                  id="community-select"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 focus:border-indigo-500/50 focus:outline-hidden"
                >
                  {YALA_COMMUNITIES.map(comm => (
                    <option key={comm.id} value={comm.name} className="bg-[#0b0c10] text-slate-300">
                      {comm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">ประเภทภัยพิบัติ</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 focus:border-indigo-500/50 focus:outline-hidden"
                >
                  <option value="rescue" className="bg-[#0b0c10] text-slate-300">อพยพติดค้าง</option>
                  <option value="water_food" className="bg-[#0b0c10] text-slate-300">ขาดแคลนเสบียง</option>
                  <option value="medical_aid" className="bg-[#0b0c10] text-slate-300">ยารักษาโรค</option>
                  <option value="power_outage" className="bg-[#0b0c10] text-slate-300">กระแสไฟฟ้าดับ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">จำนวนคนติดค้าง</label>
                <input
                  id="vulnerable-count-input"
                  type="number"
                  min="1"
                  max="100"
                  value={vulnerablePop}
                  onChange={(e) => setVulnerablePop(Math.max(1, Number(e.target.value)))}
                  className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 font-mono text-center focus:border-indigo-500/50 focus:outline-hidden font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">เบอร์โทรศัพท์</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-3 h-3 text-slate-500" />
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="08x-xxxxxxx"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 pl-9 w-full focus:border-indigo-500/50 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">ชื่อผู้แจ้งเหตุ</label>
              <input
                id="reporter-name-input"
                type="text"
                placeholder="กรุณากรอกชื่อจริง-นามสกุล..."
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 focus:border-indigo-500/50 focus:outline-hidden"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-[8px] font-mono uppercase tracking-wider font-semibold">รายละเอียดความช่วยเหลือเพิ่มเติม</label>
              <textarea
                id="description-input"
                placeholder="รายละเอียดเพิ่มเติม..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="bg-white/[0.02] border border-white/[0.06] text-slate-200 rounded-lg p-2 resize-none focus:border-indigo-500/50 focus:outline-hidden"
              />
            </div>

            <button
              id="submit-sos-btn"
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center gap-2 border border-rose-500/10 bg-rose-600/10 hover:bg-rose-650 disabled:bg-rose-950/20 text-rose-350 hover:text-white font-mono py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-[9px] uppercase tracking-wider font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>SUBMIT SOS SIGNAL</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (7/12): Live feed dispatch log */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-mono font-semibold tracking-wider text-slate-400 flex items-center gap-2 uppercase">
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>เหตุเรียลไทม์ / LIVE MONITOR ({sosReports.filter(r => r.status !== 'resolved').length})</span>
            </h3>
            <span className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">SYNCED</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] border border-white/[0.04] rounded-xl bg-white/[0.01] p-3 text-xs flex flex-col gap-3 custom-scrollbar">
            {sosReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500 p-8">
                <ShieldCheck className="w-7 h-7 text-slate-700" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">NO ACTIVE SOS REPORTS</span>
              </div>
            ) : (
              sosReports.map(rp => {
                let badgeColor = "bg-rose-500/5 text-rose-350 border-rose-500/15";
                let catText = "ช่วยชีพ";
                
                if (rp.category === 'water_food') {
                  badgeColor = "bg-amber-500/5 text-amber-350 border-amber-500/15";
                  catText = "เสบียงอาหาร";
                } else if (rp.category === 'medical_aid') {
                  badgeColor = "bg-red-500/5 text-red-350 border-red-500/15";
                  catText = "ยารักษาโรค";
                } else if (rp.category === 'power_outage') {
                  badgeColor = "bg-cyan-500/5 text-cyan-350 border-cyan-500/15";
                  catText = "กระแสไฟดับ";
                }

                if (rp.status === 'resolved') {
                  badgeColor = "bg-[#0b0c10]/20 border-white/[0.02] text-slate-550";
                }

                return (
                  <div 
                    key={rp.id}
                    className={`p-3.5 border rounded-xl flex flex-col gap-2.5 text-left relative overflow-hidden transition-all duration-200 ${
                      rp.status === 'resolved' 
                        ? 'bg-white/[0.01] border-white/[0.02] opacity-30' 
                        : rp.status === 'dispatching'
                        ? 'bg-amber-500/5 border-amber-500/15'
                        : 'bg-rose-500/5 border-rose-500/15'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-medium uppercase border ${badgeColor}`}>
                          {catText}
                        </span>
                        <span className="font-semibold text-slate-200">ชุมชน{rp.communityName}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono tracking-wider font-semibold uppercase ${
                        rp.status === 'pending' ? 'text-rose-455' :
                        rp.status === 'dispatching' ? 'text-amber-400' :
                        'text-slate-500'
                      }`}>
                        {rp.status}
                      </span>
                    </div>

                    <p className="text-slate-350 text-[10px] leading-relaxed font-light">
                      {rp.description || 'ไม่ได้ระบุรายละเอียดข้อเดือดร้อนเพิ่มเติม'}
                    </p>

                    <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center text-[8.5px] text-slate-500 border-t border-white/[0.03] pt-2 gap-2 mt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-400 font-mono">
                          <Users className="w-3 h-3 text-slate-500 shrink-0" />
                          เปราะบาง: <b className="font-mono text-slate-200 font-bold">{rp.vulnerablePop} คน</b>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-455">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          {rp.reporterPhone} ({rp.reporterName})
                        </span>
                      </div>

                      {/* Operator dispatch buttons */}
                      {isLoggedIn && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end font-mono">
                          {rp.status === 'pending' && (
                            <button
                              onClick={() => onUpdateSosStatus(rp.id, 'dispatching')}
                              className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer text-[8px] uppercase tracking-wider"
                            >
                              DISPATCH
                            </button>
                          )}
                          {(rp.status === 'pending' || rp.status === 'dispatching') && (
                            <button
                              onClick={() => onUpdateSosStatus(rp.id, 'resolved')}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer text-[8px] uppercase tracking-wider flex items-center gap-0.5"
                            >
                              <Check className="w-2.5 h-2.5 inline" /> RESOLVE
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
