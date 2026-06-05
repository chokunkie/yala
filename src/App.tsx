/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './services/firebase';
import { 
  YALA_PUMP_STATIONS, 
  YALA_TELEMETRY_SENSORS, 
  YALA_SHELTERS, 
  PumpStation, 
  TelemetrySensor, 
  EvacuationShelter 
} from './data/floodMockData';

// Layout Components
import FloodMap, { SOSReport } from './components/FloodMap';
import AuthStatus from './components/AuthStatus';
import DisasterControlPanel from './components/DisasterControlPanel';
import SimulationPanel, { SimulationParams } from './components/SimulationPanel';
import SosCoordinator from './components/SosCoordinator';
import InfoDrawer from './components/InfoDrawer';

// Icons
import { 
  Radio, 
  Grid, 
  Clock, 
  Sparkles,
  Waves, 
  Activity,
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Real-time Firestore synchronizing collections
  const [pumps, setPumps] = useState<PumpStation[]>([]);
  const [sensors] = useState<TelemetrySensor[]>(YALA_TELEMETRY_SENSORS); // static telemetry model for visualization
  const [shelters, setShelters] = useState<EvacuationShelter[]>([]);
  const [sosReports, setSosReports] = useState<SOSReport[]>([]);

  // Simulation state variables
  const [simParams, setSimParams] = useState<SimulationParams>({
    rainfall_24h: 303.6, // Yala historic peak
    rainfall_120h: 1072.0, // Cumulative 5 days
    water_level_msl: 4.85,
    flow_rate: 450,
    flooded_pumps: 2,
    barriers_deployed: true,
    vulnerable_distress: 120,
    sos_pings_count: 5,
    shelter_capacity_pct: 78
  });

  // UI Selection & Interactivity States
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number; type: string; id: string } | null>(null);
  const [isPinningSos, setIsPinningSos] = useState(false);
  const [pinnedLat, setPinnedLat] = useState<number | null>(null);
  const [pinnedLng, setPinnedLng] = useState<number | null>(null);

  // Active Map Layers
  const [activeLayers, setActiveLayers] = useState({
    floodRiskHeatmap: true,
    waterLevelPoints: true,
    pumpStations: true,
    telemetrySensors: true,
    evacuationShelters: true,
    sosReports: true
  });

  // AI Generation States
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // System clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // 2. Real-time Clock interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' ICT');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Database Seeding & Real-time Streams Setup
  useEffect(() => {
    // Automatically Seed database with mock data if tables are empty
    const bootstrapData = async () => {
      try {
        // A. Pump Stations
        const pumpSnap = await getDocs(collection(db, 'pump_stations'));
        if (pumpSnap.empty) {
          console.log("Seeding empty pump_stations table in Firestore...");
          const batch = writeBatch(db);
          YALA_PUMP_STATIONS.forEach(station => {
            const docRef = doc(db, 'pump_stations', station.id);
            batch.set(docRef, {
              ...station,
              updatedAt: new Date().toISOString()
            });
          });
          await batch.commit();
        }

        // B. Evacuation Shelters
        const shelterSnap = await getDocs(collection(db, 'evacuation_shelters'));
        if (shelterSnap.empty) {
          console.log("Seeding empty evacuation_shelters table in Firestore...");
          const batch = writeBatch(db);
          YALA_SHELTERS.forEach(shelter => {
            const docRef = doc(db, 'evacuation_shelters', shelter.id);
            batch.set(docRef, shelter);
          });
          await batch.commit();
        }
      } catch (err) {
        console.error("Bootstrapping data failed:", err);
      }
    };
    bootstrapData();

    // Setup direct onSnapshot listeners for real-time multiplayer updates
    const unsubPumps = onSnapshot(collection(db, 'pump_stations'), (snapshot) => {
      const pList: PumpStation[] = [];
      snapshot.forEach(doc => {
        pList.push(doc.data() as PumpStation);
      });
      // Sort to preserve original list order
      setPumps(pList.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pump_stations');
    });

    const unsubShelters = onSnapshot(collection(db, 'evacuation_shelters'), (snapshot) => {
      const sList: EvacuationShelter[] = [];
      snapshot.forEach(doc => {
        sList.push(doc.data() as EvacuationShelter);
      });
      setShelters(sList.sort((a, b) => a.id.localeCompare(b.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'evacuation_shelters');
    });

    const unsubSOS = onSnapshot(collection(db, 'sos_reports'), (snapshot) => {
      const sosList: SOSReport[] = [];
      snapshot.forEach(doc => {
        const item = doc.data();
        sosList.push({
          id: doc.id,
          ...item
        } as SOSReport);
      });
      // Sort newest SOS counts first
      setSosReports(sosList.sort((a, b) => b.id.localeCompare(a.id)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sos_reports');
    });

    return () => {
      unsubPumps();
      unsubShelters();
      unsubSOS();
    };
  }, []);

  // Update calculated metrics whenever sliders change
  const handleToggleLayer = (layerName: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName as keyof typeof prev]
    }));
  };

  // 4. Trigger Server-side AI Gemini Analysis
  const handleRunAiPrediction = async (params: SimulationParams) => {
    setAiLoading(true);
    setAiReport(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await response.json();
      if (data.success) {
        setAiReport(data.report);
      } else {
        alert(data.error || "วิเคราะห์ล้มเหลว");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์วิเคราะห์");
    } finally {
      setAiLoading(false);
    }
  };

  // 5. Place custom SOS pin on the map
  const handleSelectMapCoords = (lat: number, lng: number) => {
    setPinnedLat(lat);
    setPinnedLng(lng);
    setIsPinningSos(false); // turn off pin selection overlay
  };

  const handleAddSosReport = async (newReport: Omit<SOSReport, 'id' | 'status'>) => {
    const customId = 'SOS_' + Date.now();
    const docRef = doc(db, 'sos_reports', customId);
    try {
      await setDoc(docRef, {
        ...newReport,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `sos_reports/${customId}`);
    }
  };

  const handleUpdateSosStatus = async (id: string, nextStatus: 'pending' | 'dispatching' | 'resolved') => {
    const docRef = doc(db, 'sos_reports', id);
    try {
      await updateDoc(docRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sos_reports/${id}`);
    }
  };

  // 6. Inline modifications of water pumps / shelters
  const handleUpdatePumpStation = async (id: string, updates: Partial<PumpStation>) => {
    const docRef = doc(db, 'pump_stations', id);
    try {
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pump_stations/${id}`);
    }
  };

  const handleUpdateEvacuationShelter = async (id: string, updates: Partial<EvacuationShelter>) => {
    const docRef = doc(db, 'evacuation_shelters', id);
    try {
      await updateDoc(docRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `evacuation_shelters/${id}`);
    }
  };

  const handleSelectPointFromMap = (id: string, type: 'community' | 'pump' | 'sensor' | 'shelter' | 'sos') => {
    // Find point coordinates
    let lat = 6.5512;
    let lng = 101.2882;

    if (type === 'community') {
      import('./data/floodMockData').then(({ YALA_COMMUNITIES }) => {
        const item = YALA_COMMUNITIES.find(c => c.id === id);
        if (item) setSelectedPoint({ lat: item.lat, lng: item.lng, type, id });
      });
    } else if (type === 'pump') {
      const item = pumps.find(p => p.id === id);
      if (item) setSelectedPoint({ lat: item.lat, lng: item.lng, type, id });
    } else if (type === 'sensor') {
      const item = sensors.find(s => s.id === id);
      if (item) setSelectedPoint({ lat: item.lat, lng: item.lng, type, id });
    } else if (type === 'shelter') {
      const item = shelters.find(s => s.id === id);
      if (item) setSelectedPoint({ lat: item.lat, lng: item.lng, type, id });
    } else if (type === 'sos') {
      const item = sosReports.find(s => s.id === id);
      if (item) setSelectedPoint({ lat: item.lat, lng: item.lng, type, id });
    }
  };

  // Dynamic Rule-based scoring strictly on the client side
  const calculateDerivedRisk = () => {
    let score = 15;
    // Rainfall factor
    score += (simParams.rainfall_24h / 350) * 35;
    // Water level factor
    if (simParams.water_level_msl > 3.5) score += 20;
    if (simParams.water_level_msl > 5.0) score += 15;
    // Pump failures factor
    const failedPercentage = (pumps.filter(p => !p.isOperational).length / 14);
    score += failedPercentage * 20;
    
    const finalScore = Math.min(100, Math.max(0, score));
    let status = 'Safe';
    if (finalScore >= 75) status = 'Critical';
    else if (finalScore >= 45) status = 'Warning';

    return { score: finalScore, status };
  };

  const currentRisk = calculateDerivedRisk();

  // Aggregate statistics
  const activePumpsCount = pumps.filter(p => p.isOperational && !p.isEngineFlooded).length;
  const floodedPumpsCount = pumps.filter(p => p.isEngineFlooded).length;
  const occupiedShelterSlots = shelters.reduce((acc, current) => acc + current.occupied, 0);
  const totalShelterLimit = shelters.reduce((acc, current) => acc + current.capacity, 0) || 1;
  const shelterSuccessRatio = Number(((occupiedShelterSlots / totalShelterLimit) * 100).toFixed(0));

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header Navigation HUD */}
      <header className="border-b border-white/[0.04] bg-[#08090c]/85 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-[1000] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="border border-white/[0.04] bg-white/[0.01] p-2 rounded-lg text-indigo-400">
            <Waves className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-xs font-bold tracking-wider text-slate-100 flex items-center gap-2 leading-none uppercase font-mono">
              <span>ศูนย์วิเคราะห์อุทกภัยยะลา / YALA FLOOD GIS</span>
              <span className="text-[7.5px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded tracking-widest font-mono">PROTOTYPE</span>
            </h1>
            <span className="text-[10px] text-slate-500 mt-1 font-medium font-mono uppercase tracking-wide">AI PREDICTIVE DECISION SUPPORT HUB</span>
          </div>
        </div>

        {/* Status markers & Auth */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time ICT */}
          <div className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.04] px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{currentTime || '12:00:00 ICT'}</span>
          </div>

          <AuthStatus />
        </div>
      </header>

      {/* 2. Main GIS Workplace Layout */}
      <main className="flex-1 p-5 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left side rails (4/12): Analytics and simulation parameters */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <DisasterControlPanel 
            activeLayers={activeLayers}
            onToggleLayer={handleToggleLayer}
            calculatedScore={currentRisk.score}
            calculatedStatus={currentRisk.status}
            rainfallCurrent={simParams.rainfall_24h}
            openSheltersCount={shelters.length}
            distressVulnerableCount={sosReports.filter(r => r.status !== 'resolved').reduce((acc, curr) => acc + curr.vulnerablePop, 0)}
            pumpSuccessRate={((activePumpsCount) / 14) * 100}
          />

          <SimulationPanel 
            initialParams={simParams}
            onSimulate={(p) => setSimParams(p)}
            onRunAiPrediction={handleRunAiPrediction}
            aiReport={aiReport}
            aiLoading={aiLoading}
          />
        </div>

        {/* Center Canvas area (8/12 - reduced if right drawer is open): Map and alerts */}
        <div className="xl:col-span-8 flex flex-col lg:flex-row gap-6 items-stretch">
          
          <div className="flex-1 flex flex-col gap-6">
            {/* Interactive MAP */}
            <div className="h-[400px] lg:h-[500px] w-full shrink-0 border border-white/[0.04] rounded-2xl overflow-hidden shadow-2xl relative bg-[#0b0c10]/40">
              <FloodMap 
                activeLayers={activeLayers}
                pumps={pumps}
                sensors={sensors}
                shelters={shelters}
                sosReports={sosReports}
                selectedPoint={selectedPoint}
                onSelectPoint={handleSelectPointFromMap}
                onPlaceSosPin={handleSelectMapCoords}
                isPinningSosState={isPinningSos}
              />
            </div>

            {/* Citizen SOS Emergency Feed Coordinator */}
            <div className="flex-1 min-h-[300px]">
              <SosCoordinator 
                sosReports={sosReports}
                isLoggedIn={!!currentUser}
                onAddSosReport={handleAddSosReport}
                onUpdateSosStatus={handleUpdateSosStatus}
                isPinningSosState={isPinningSos}
                onTogglePinningState={() => setIsPinningSos(!isPinningSos)}
                selectedSosLat={pinnedLat}
                selectedSosLng={pinnedLng}
                onClearSelectedCoords={() => { setPinnedLat(null); setPinnedLng(null); }}
              />
            </div>
          </div>

          {/* Right Floating Drawer Details Panel */}
          <AnimatePresence>
            {selectedPoint && (
              <InfoDrawer 
                selectedId={selectedPoint.id}
                selectedType={selectedPoint.type as any}
                onClose={() => setSelectedPoint(null)}
                pumps={pumps}
                sensors={sensors}
                shelters={shelters}
                isLoggedIn={!!currentUser}
                onUpdatePump={handleUpdatePumpStation}
                onUpdateShelter={handleUpdateEvacuationShelter}
              />
            )}
          </AnimatePresence>

        </div>

      </main>

      {/* 3. Operational Footer HUD */}
      <footer className="border-t border-white/[0.04] bg-[#08090c]/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 font-mono tracking-widest uppercase gap-3">
        <div className="flex items-center gap-2">
          <Grid className="w-3.5 h-3.5 text-indigo-400" />
          <span>ระบบศูนย์บัญชาการข้อมูลและสนับสนุนการตัดสินใจอุทกภัยอัจฉริยะ (ศอป.ยะลา)</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>FIRESTORE: ACTIVE</span>
          <span className="text-slate-755">•</span>
          <span>GEMINI MODEL: 3.5 FLASH</span>
        </div>
      </footer>
    </div>
  );
}
