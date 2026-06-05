/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  CommunityPoint, 
  PumpStation, 
  TelemetrySensor, 
  EvacuationShelter 
} from '../data/floodMockData';

// Custom SOS report structure from firestore
export interface SOSReport {
  id: string;
  lat: number;
  lng: number;
  communityName: string;
  vulnerablePop: number;
  category: 'rescue' | 'water_food' | 'medical_aid' | 'power_outage';
  severity: 'high' | 'critical';
  reporterName: string;
  reporterPhone: string;
  description?: string;
  status: 'pending' | 'dispatching' | 'resolved';
}

interface FloodMapProps {
  activeLayers: {
    floodRiskHeatmap: boolean;
    waterLevelPoints: boolean;
    pumpStations: boolean;
    telemetrySensors: boolean;
    evacuationShelters: boolean;
    sosReports: boolean;
  };
  pumps: PumpStation[];
  sensors: TelemetrySensor[];
  shelters: EvacuationShelter[];
  sosReports: SOSReport[];
  selectedPoint: { lat: number; lng: number; type: string; id: string } | null;
  onSelectPoint: (id: string, type: 'community' | 'pump' | 'sensor' | 'shelter' | 'sos') => void;
  onPlaceSosPin: (lat: number, lng: number) => void;
  isPinningSosState: boolean;
}

export default function FloodMap({
  activeLayers,
  pumps,
  sensors,
  shelters,
  sosReports,
  selectedPoint,
  onSelectPoint,
  onPlaceSosPin,
  isPinningSosState
}: FloodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer groups to easily clear/re-add when toggled
  const layersRef = useRef<{
    heatmap: L.LayerGroup;
    waterPoints: L.LayerGroup;
    pumps: L.LayerGroup;
    sensors: L.LayerGroup;
    shelters: L.LayerGroup;
    sos: L.LayerGroup;
    yalaBoundary: L.LayerGroup;
  }>({
    heatmap: L.layerGroup(),
    waterPoints: L.layerGroup(),
    pumps: L.layerGroup(),
    sensors: L.layerGroup(),
    shelters: L.layerGroup(),
    sos: L.layerGroup(),
    yalaBoundary: L.layerGroup()
  });

  // Track if map has been initialized
  const [mapReady, setMapReady] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Yala City
    const yalaCenter: L.LatLngExpression = [6.5512, 101.2882];
    
    // Create Leaflet Map with zoom limits
    const map = L.map(mapContainerRef.current, {
      center: yalaCenter,
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false // custom placement below
    });

    mapInstanceRef.current = map;

    // Standard high-tech Leaflet tile layer (CartoDB Dark Matter)
    const cartoDbDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });
    cartoDbDark.addTo(map);

    // Add standard controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Setup layers
    layersRef.current.heatmap.addTo(map);
    layersRef.current.waterPoints.addTo(map);
    layersRef.current.pumps.addTo(map);
    layersRef.current.sensors.addTo(map);
    layersRef.current.shelters.addTo(map);
    layersRef.current.sos.addTo(map);
    layersRef.current.yalaBoundary.addTo(map);

    // Draw Yala administrative/river zone circle boundary for GIS aesthetic
    const boundaryCircle = L.circle(yalaCenter, {
      color: '#f472b6',
      fillColor: '#ec4899',
      fillOpacity: 0.03,
      radius: 4600,
      weight: 1.5,
      dashArray: '5, 8'
    });
    boundaryCircle.bindPopup("<div class='text-xs font-sans text-slate-800 font-semibold'>ขอบเขตศูนย์ควบคุมอุทกภัยแม่น้ำปัตตานี (ศอป.)</div>");
    layersRef.current.yalaBoundary.addLayer(boundaryCircle);

    // Setup click listener for SOS manual pinning
    map.on('click', (e: L.LeafletMouseEvent) => {
      // Use local ref/state check inside event
      if (mapContainerRef.current?.dataset.pinning === 'true') {
        const { lat, lng } = e.latlng;
        onPlaceSosPin(lat, lng);
      }
    });

    setMapReady(true);
  }, []);

  // Sync pinning state to DOM dataset so Leaflet event can read it dynamically
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.dataset.pinning = isPinningSosState ? 'true' : 'false';
    }
  }, [isPinningSosState]);

  // Handle pan to selected point
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedPoint) return;
    mapInstanceRef.current.setView([selectedPoint.lat, selectedPoint.lng], 15, {
      animate: true,
      duration: 1.0
    });
  }, [selectedPoint, mapReady]);

  // Render & Re-draw layers dynamically whenever data or active toggles transition
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const layers = layersRef.current;

    // ====== 1. FLOOD RISK HEATMAP ======
    layers.heatmap.clearLayers();
    if (activeLayers.floodRiskHeatmap) {
      // Draw simulated heatmap circles with glowing effects
      // Hardcoded points to match the 41 at-risk communities
      import('../data/floodMockData').then(({ YALA_COMMUNITIES }) => {
        YALA_COMMUNITIES.forEach(comm => {
          let color = '#ef4444'; // critical
          let radius = 280;
          let opacity = 0.35;

          if (comm.riskLevel === 'high') {
            color = '#f97316';
            radius = 200;
            opacity = 0.28;
          } else if (comm.riskLevel === 'moderate') {
            color = '#eab308';
            radius = 140;
            opacity = 0.20;
          }

          const circle = L.circle([comm.lat, comm.lng], {
            stroke: false,
            fillColor: color,
            fillOpacity: opacity,
            radius: radius
          });

          // Bind details
          circle.bindPopup(`
            <div class="font-sans text-slate-900 p-1">
              <div class="font-semibold text-sm border-b pb-1 border-slate-200 mb-1">🏡 ${comm.name}</div>
              <div class="text-xs space-y-1">
                <div>ต.<b>${comm.subdistrict}</b>, จ.ยะลา</div>
                <div>ประชากรกลุ่มเป้าหมาย: <span class="font-semibold text-blue-600">${comm.vulnerablePop} ครัวเรือน</span></div>
                <div>ระดับความเสี่ยง: <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  comm.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 
                  comm.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                }">${comm.riskLevel === 'critical' ? 'วิกฤต (Critical)' : comm.riskLevel === 'high' ? 'เฝ้าระวังสูง (High)' : 'ปานกลาง'}</span></div>
              </div>
            </div>
          `);

          circle.on('click', () => {
            onSelectPoint(comm.id, 'community');
          });

          layers.heatmap.addLayer(circle);
        });
      });
    }

    // ====== 2. WATER LEVEL POINTS (High risk indicators) ======
    layers.waterPoints.clearLayers();
    if (activeLayers.waterLevelPoints) {
      // Glowing alert icons for locations that exceed flood critical capacity
      // We will place beautiful small pulse markers at places where critical risk resides
      sensors.forEach(sens => {
        if (sens.waterLevelMsl >= sens.warningLevel) {
          const isCritical = sens.waterLevelMsl >= sens.criticalLevel;
          
          const icon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div class="relative flex items-center justify-center w-8 h-8">
                <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping ${isCritical ? 'bg-red-500' : 'bg-amber-400'}"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 ${isCritical ? 'bg-red-600 border border-white' : 'bg-amber-500 border border-white'}"></span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const mslDiff = (sens.waterLevelMsl - sens.criticalLevel).toFixed(2);
          const marker = L.marker([sens.lat, sens.lng], { icon });
          marker.bindPopup(`
            <div class="font-sans text-slate-900 p-1">
              <div class="font-bold text-xs text-red-600 mb-1">⚠️ จุดดัชนีระดับน้ำสะสมล้นตลิ่ง</div>
              <div class="text-xs space-y-1">
                <div class="font-semibold">${sens.name}</div>
                <div>ระดับน้ำ: <span class="font-semibold text-red-600">${sens.waterLevelMsl} ม. (MSL)</span></div>
                <div>ล้นสูงกว่าคันกั้นน้ำ: <span class="font-semibold text-red-700">+${Math.max(0, Number(mslDiff))} ม.</span></div>
              </div>
            </div>
          `);
          layers.waterPoints.addLayer(marker);
        }
      });
    }

    // ====== 3. PUMP STATIONS LAYER ======
    layers.pumps.clearLayers();
    if (activeLayers.pumpStations) {
      pumps.forEach(pump => {
        let statusColor = "bg-emerald-500";
        let pulseClass = "";
        let strokeColor = "border-slate-800";
        let statusLabel = "ปกติ (Operational)";

        if (pump.isEngineFlooded) {
          statusColor = "bg-red-500";
          pulseClass = "animate-pulse";
          strokeColor = "border-red-200";
          statusLabel = "⚠️ เครื่องสูบน้ำจมน้ำ/ล่ม";
        } else if (!pump.isOperational) {
          statusColor = "bg-amber-400";
          statusLabel = "ปิดการทำงาน/รอสั่งการ";
        } else {
          pulseClass = "animate-ping opacity-25";
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 ${strokeColor} shadow-lg shadow-black/80">
            ${pump.isOperational && !pump.isEngineFlooded ? `
              <span class="absolute inline-flex w-full h-full rounded-full bg-emerald-400 ${pulseClass}"></span>
            ` : ''}
            <div class="w-3.5 h-3.5 rounded-full ${statusColor}"></div>
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-100">P</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([pump.lat, pump.lng], { icon });
        marker.bindPopup(`
          <div class="font-sans text-slate-900 p-1 min-w-[200px]">
            <div class="font-semibold text-sm border-b pb-1 border-slate-200 mb-1">🌀 ${pump.name}</div>
            <div class="text-xs space-y-1">
              <div>ความจุระบายสูงสุด: <span class="font-medium">${pump.capacity} m³/s</span></div>
              <div>การทำงานปัจจุบัน: <span class="font-semibold ${pump.isOperational && !pump.isEngineFlooded ? 'text-emerald-600' : 'text-red-600'}">${pump.flowRate} m³/s</span></div>
              <div class="pt-1">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  pump.isEngineFlooded ? 'bg-red-100 text-red-700' : 
                  pump.isOperational ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }">${statusLabel}</span>
              </div>
            </div>
          </div>
        `);
        
        marker.on('click', () => {
          onSelectPoint(pump.id, 'pump');
        });

        layers.pumps.addLayer(marker);
      });
    }

    // ====== 4. TELEMETRY SENSORS LAYER ======
    layers.sensors.clearLayers();
    if (activeLayers.telemetrySensors) {
      sensors.forEach(sens => {
        let healthColor = "bg-sky-400";
        if (sens.healthStatus === 'offline') healthColor = "bg-slate-500";
        else if (sens.healthStatus === 'unstable') healthColor = "bg-yellow-400 animate-pulse";

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-sky-500 shadow-md">
            <div class="w-3 h-3 rounded-full ${healthColor}"></div>
            <span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-950 text-[8px] font-bold text-sky-100 border border-sky-500">T</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([sens.lat, sens.lng], { icon });
        
        const isAlert = sens.waterLevelMsl >= sens.warningLevel;
        const colorClass = sens.waterLevelMsl >= sens.criticalLevel ? 'text-red-600 font-bold' : isAlert ? 'text-yellow-600 font-bold' : 'text-slate-600';

        marker.bindPopup(`
          <div class="font-sans text-slate-900 p-1 min-w-[210px]">
            <div class="font-semibold text-xs text-sky-700 mb-0.5">📡 Telemetry Sensor Data</div>
            <div class="font-bold text-sm border-b pb-1 border-slate-200 mb-1">${sens.name}</div>
            <div class="text-xs space-y-1">
              <div>ระดับน้ำในทางน้ำ: <span class="${colorClass}">${sens.waterLevelMsl} ม. (MSL)</span></div>
              <div>ค่าเตือนภัยวิกฤต: <span>${sens.warningLevel} / ${sens.criticalLevel} ม.</span></div>
              <div>ฝนสะสม (24h): <span class="font-semibold text-blue-600">${sens.rainfall24h} mm</span></div>
              <div>แบตเตอรี่: <span class="capitalize">${sens.batteryStatus} (${sens.healthStatus})</span></div>
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectPoint(sens.id, 'sensor');
        });

        layers.sensors.addLayer(marker);
      });
    }

    // ====== 5. EVACUATION SHELTERS ======
    layers.shelters.clearLayers();
    if (activeLayers.evacuationShelters) {
      shelters.forEach(she => {
        let badgeColor = "bg-indigo-600";
        let statusText = "ศูนย์เปิด - พร้อมรับ";
        if (she.status === 'full') {
          badgeColor = "bg-red-600";
          statusText = "เต็มหนาแน่น (Full)";
        } else if (she.status === 'closed') {
          badgeColor = "bg-slate-600";
          statusText = "ปิดชั่วคราว";
        }

        const occupancyPct = ((she.occupied / she.capacity) * 100).toFixed(0);

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded bg-slate-900 border-2 border-indigo-500 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" class="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span class="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded bg-indigo-950 text-[8px] font-bold text-indigo-200 border border-indigo-500">H</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([she.lat, she.lng], { icon });

        marker.bindPopup(`
          <div class="font-sans text-slate-900 p-1 min-w-[200px]">
            <div class="font-semibold text-sm border-b pb-1 border-slate-200 mb-1">🏠 ${she.name}</div>
            <div class="text-xs space-y-1">
              <div>ความจุรองรับได้: <span class="font-semibold">${she.capacity} คน</span></div>
              <div>เข้าพักแล้ว: <span class="font-semibold text-indigo-700">${she.occupied} คน (${occupancyPct}%)</span></div>
              <div>สายด่วน: <span class="font-mono text-slate-700">${she.contactPhone}</span></div>
              <div class="pt-1">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${badgeColor}">${statusText}</span>
              </div>
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectPoint(she.id, 'shelter');
        });

        layers.shelters.addLayer(marker);
      });
    }

    // ====== 6. SOS EMERGENCY REPORTS ======
    layers.sos.clearLayers();
    if (activeLayers.sosReports) {
      sosReports.forEach(rp => {
        let catLabel = "ขอความช่วยเหลือ";
        let iconColor = "bg-rose-600";
        let ringColor = "bg-rose-400";

        if (rp.category === 'water_food') {
          catLabel = "ต้องการน้ำ/อาหาร";
          iconColor = "bg-orange-500";
          ringColor = "bg-orange-300";
        } else if (rp.category === 'medical_aid') {
          catLabel = "กู้ชีพ/ยารักษาโรค";
          iconColor = "bg-red-600";
          ringColor = "bg-red-300";
        } else if (rp.category === 'power_outage') {
          catLabel = "ไฟกู้ภัย/ไฟตัด";
          iconColor = "bg-yellow-500";
          ringColor = "bg-yellow-300";
        }

        const isResolved = rp.status === 'resolved';
        if (isResolved) {
          iconColor = "bg-slate-400";
          ringColor = "bg-slate-300";
          catLabel += " (ช่วยเหลือแล้ว)";
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping ${ringColor}"></span>
            <div class="relative flex h-5 w-5 items-center justify-center rounded-full ${iconColor} border border-white text-[9px] font-extrabold text-white shadow">
              !
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker animate-bounce',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([rp.lat, rp.lng], { icon });

        marker.bindPopup(`
          <div class="font-sans text-slate-900 p-1.5 min-w-[220px]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="flex h-2 w-2 rounded-full ${rp.status === 'pending' ? 'bg-red-500 animate-ping' : rp.status === 'dispatching' ? 'bg-amber-400' : 'bg-slate-400'}"></span>
              <span class="text-[10px] font-bold uppercase tracking-wider ${rp.status === 'pending' ? 'text-red-600' : rp.status === 'dispatching' ? 'text-amber-600' : 'text-slate-500'}">
                STATUS: ${rp.status}
              </span>
            </div>
            <div class="font-bold text-sm text-slate-900 mb-1">📍 ชุมชน ${rp.communityName}</div>
            <div class="text-xs space-y-1 mb-1.5 border-b pb-1 border-slate-100">
              <div>ประเภท: <span class="font-semibold text-rose-600">${catLabel}</span></div>
              <div>กลุ่มเปราะบางติดค้าง: <span class="font-bold text-red-600">${rp.vulnerablePop} ราย</span></div>
              <div>ผู้แจ้ง: <span>${rp.reporterName}</span></div>
              <div>โทรศัพท์: <span class="font-mono text-slate-700">${rp.reporterPhone}</span></div>
              ${rp.description ? `<div class="bg-red-50 p-1 rounded inline-block text-slate-800 text-[10px]"><b>รายละเอียด:</b> ${rp.description}</div>` : ''}
            </div>
            <div class="text-[9px] text-slate-400 text-right">คลิกขวาหรือแดชบอร์ดด้านข้างเพื่อเคลียร์ภัย</div>
          </div>
        `);

        marker.on('click', () => {
          onSelectPoint(rp.id, 'sos');
        });

        layers.sos.addLayer(marker);
      });
    }

  }, [activeLayers, pumps, sensors, shelters, sosReports, mapReady]);

  // CSS fallback style inline to ensure visibility
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0f060b]">
      {/* Background container for leaflet */}
      <div 
        ref={mapContainerRef} 
        id="gis-leaflet-canvas" 
        className={`w-full h-full relative cursor-crosshair z-0 ${isPinningSosState ? 'border-2 border-red-500/50' : ''}`}
      />

      {/* Manual Pinning Helper overlay */}
      {isPinningSosState && (
        <div className="absolute top-4 left-4 z-100 bg-red-950/90 border border-red-500/60 px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 text-red-200 animate-pulse text-xs max-w-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
          <span>โหมดปักพิน SOS: แตะหน้าจอแผนที่จุดใดก็ได้เพื่อปักความช่วยเหลือฉุกเฉิน</span>
        </div>
      )}

      {/* Map watermark indicators */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1 pointer-events-none select-none">
        <div className="text-[10px] font-mono text-cyan-400/80 bg-slate-950/80 px-2 py-1 rounded border border-slate-800/60 backdrop-blur-xs flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>GIS PLATFORM (ยะลา-ศอป. V.1)</span>
        </div>
      </div>
    </div>
  );
}
