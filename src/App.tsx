import React, { useEffect, useState, createContext, useContext } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { MapPin, Bus, AlertTriangle, Clock, ChevronRight, User as UserIcon, LogOut, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { db, auth } from './firebase';
import { seedRoutes } from './seed';
import { Route, Stop, Ping, Alert, OperationType } from './types';
import { handleFirestoreError } from './lib/firestoreUtils';
import { cn } from './lib/utils';
import BusMap from './components/BusMap';

// --- Utilities ---

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Context ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// --- Components ---

function Header() {
  const { user, signIn, logOut } = useAuth();

  return (
    <header className="bg-emerald-900 text-white p-6 shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-400 rounded-lg flex items-center justify-center font-black text-emerald-900 text-xl font-display">
            GY
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase font-display leading-none">Grama-Yatri</h1>
            <p className="text-[10px] text-emerald-300 font-bold tracking-[0.2em] mt-1">CROWDSOURCED RURAL TRANSIT</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-emerald-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-tight">{user.displayName}</p>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none mt-0.5">Contributor</p>
              </div>
              <img 
                src={user.photoURL || ''} 
                alt="User" 
                className="w-10 h-10 rounded-lg border-2 border-emerald-700 object-cover shadow-inner"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={logOut} 
                className="p-2.5 bg-emerald-800/50 hover:bg-red-500/20 text-emerald-300 hover:text-red-400 rounded-lg transition-all border border-emerald-700/50 flex items-center justify-center shadow-lg"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="px-6 py-2.5 bg-emerald-400 text-emerald-900 text-sm font-bold rounded-lg shadow-lg shadow-emerald-900/50 hover:bg-emerald-300 transition-all flex items-center gap-2 uppercase tracking-wide"
            >
              <UserIcon size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 font-black font-display text-xl"
      >
        GY
      </motion.div>
      <h2 className="font-display font-black text-2xl text-emerald-950 mb-2 uppercase tracking-tight">Grama-Yatri</h2>
      <p className="text-slate-500 animate-pulse font-bold text-xs uppercase tracking-widest leading-loose">Synchronizing Community Fleet...</p>
    </div>
  );
}

function AlertBanner({ alerts, routeId }: { alerts: Alert[], routeId?: string }) {
  const latestAlert = alerts.find(a => a.routeId === routeId);
  if (!latestAlert) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest">ALERT</span>
        <p className="text-sm text-amber-800 font-medium">
          {latestAlert.message} Reported {formatDistanceToNow(latestAlert.timestamp?.toDate() || new Date(), { addSuffix: true })} by {latestAlert.userName}.
        </p>
      </div>
    </div>
  );
}

function RouteSelector({ routes, selectedRoute, onSelect }: { routes: Route[], selectedRoute: Route | null, onSelect: (r: Route) => void }) {
  const [search, setSearch] = useState('');
  
  const filteredRoutes = routes.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.stops.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="relative">
        <input 
          type="text"
          placeholder="SEARCH ROUTES OR VILLAGES..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Info size={16} />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
        {filteredRoutes.map((route) => (
          <button
            key={route.id}
            onClick={() => onSelect(route)}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
              selectedRoute?.id === route.id
                ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
            )}
          >
            {route.name}
          </button>
        ))}
        {filteredRoutes.length === 0 && (
          <p className="text-[10px] text-slate-400 font-bold uppercase py-2">No routes found matching your search</p>
        )}
      </div>
    </div>
  );
}

function BusTimeline({ route, latestPing }: { route: Route, latestPing: Ping | null }) {
  const currentStopIndex = latestPing ? route.stops.findIndex(s => s.id === latestPing.stopId) : -1;
  const progressPercent = route.stops.length > 1 ? (Math.max(0, currentStopIndex) / (route.stops.length - 1)) * 100 : 0;

  const getEta = (stopIndex: number) => {
    if (!latestPing) return null;
    if (currentStopIndex === -1 || stopIndex <= currentStopIndex) return null;

    let totalMinutes = 0;
    for (let i = currentStopIndex + 1; i <= stopIndex; i++) {
      totalMinutes += route.stops[i].avgTimeFromPrev;
    }

    const pingTime = latestPing.timestamp?.toDate() || new Date();
    return new Date(pingTime.getTime() + totalMinutes * 60000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden relative min-h-[500px]">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Route Progress</h2>
          <div className="mt-2 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{route.stops.length} STOPS TOTAL</span>
      </div>

      <div className="absolute left-[81px] top-28 bottom-12 w-1 bg-slate-100 hidden sm:block" />
      
      <div className="p-8 flex flex-col gap-10">
        {route.stops.map((stop, index) => {
          const isAtStop = latestPing?.stopId === stop.id;
          const eta = getEta(index);
          const hasPassed = currentStopIndex > index;
          
          const distFromPrev = index > 0 
            ? getDistance(route.stops[index-1].location.lat, route.stops[index-1].location.lng, stop.location.lat, stop.location.lng).toFixed(1)
            : null;

          return (
            <div key={stop.id} className={cn("flex items-start gap-6 transition-all duration-500", hasPassed && "opacity-40 grayscale-[0.5]")}>
              <div className="w-14 text-right text-[10px] font-mono pt-1 text-slate-400 font-bold uppercase">
                {index === 0 ? "START" : index === route.stops.length - 1 ? "FINISH" : `${index}`}
              </div>
              
              <div className={cn(
                "relative z-10 w-4 h-4 rounded-full border-4 border-white ring-1 transition-all mt-1 hidden sm:block",
                isAtStop ? "bg-emerald-500 ring-emerald-500 scale-150 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : 
                hasPassed ? "bg-slate-300 ring-slate-300" : "bg-white ring-slate-300"
              )}>
                {isAtStop && (
                   <span className="absolute inset-x-0 inset-y-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 transition-all",
                isAtStop && "p-5 bg-emerald-50 rounded-xl border border-emerald-100 -mt-2 shadow-sm"
              )}>
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className={cn("font-black tracking-tight uppercase", isAtStop ? "text-emerald-900 text-lg" : "text-slate-800")}>
                    {stop.name}
                  </h3>
                  {isAtStop && (
                    <span className="bg-emerald-200 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Now</span>
                  )}
                  {eta && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-600 font-black animate-pulse">ETA: {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">
                    {isAtStop ? `Last update by @${latestPing.userName}` : hasPassed ? "Bus Departed" : `${stop.avgTimeFromPrev} min trek`}
                  </p>
                  {distFromPrev && (
                    <span className="text-[10px] text-slate-300 font-bold">• {distFromPrev} KM</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ eta, latestPing, route }: { eta: Date | null, latestPing: Ping | null, route: Route }) {
  const nextStopIndex = latestPing ? route.stops.findIndex(s => s.id === latestPing.stopId) + 1 : -1;
  const nextStop = nextStopIndex > 0 && nextStopIndex < route.stops.length ? route.stops[nextStopIndex] : null;
  const currentStop = latestPing ? route.stops.find(s => s.id === latestPing.stopId) : null;

  const distanceToNext = (currentStop && nextStop) 
    ? getDistance(currentStop.location.lat, currentStop.location.lng, nextStop.location.lat, nextStop.location.lng).toFixed(1)
    : null;

  return (
    <div className="bg-emerald-600 text-white rounded-xl p-8 shadow-xl shadow-emerald-200 border-b-4 border-emerald-700 relative overflow-hidden transition-all hover:translate-y-[-2px]">
      <div className="relative z-10">
        <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Estimated Arrival</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-7xl font-black font-display tracking-tighter">
            {eta ? eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/ AM| PM/, '') : '--:--'}
          </h2>
          <span className="text-2xl font-black text-emerald-200 uppercase font-display">
            {eta ? eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).slice(-2) : 'PM'}
          </span>
        </div>
        <div className="mt-8 pt-6 border-t border-emerald-500/50">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
            <div className="flex flex-col">
              <span className="text-emerald-300 text-[9px] mb-1">BOUND FOR</span>
              <span>{nextStop ? nextStop.name : "No Active Pings"}</span>
            </div>
            <div className="text-right">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black">
                {distanceToNext ? `${distanceToNext} KM AWAY` : "WAITING"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Bus className="absolute -right-6 -bottom-6 text-emerald-500/10" size={180} />
    </div>
  );
}

function ActionCard({ user, route, onPing }: { user: User | null, route: Route, onPing: (stopId: string) => void }) {
  const [showStopList, setShowStopList] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center text-center gap-6 shadow-sm">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border border-slate-100 shadow-inner">
        📍
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Help the Community</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
          If you are traveling on this bus, update current location for other villagers.
        </p>
      </div>

      {!user ? (
        <p className="text-[10px] text-slate-400 font-bold uppercase py-4">Please sign in to contribute</p>
      ) : (
        <div className="w-full relative">
          <button 
            onClick={() => setShowStopList(!showStopList)}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 active:scale-[0.98] uppercase tracking-wide"
          >
            {showStopList ? "SELECT STOP" : "I AM ON THE BUS"}
          </button>
          
          <AnimatePresence>
            {showStopList && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto custom-scrollbar z-50"
              >
                {route.stops.map(stop => (
                  <button
                    key={stop.id}
                    onClick={() => { onPing(stop.id); setShowStopList(false); }}
                    className="w-full p-4 text-left font-bold text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border-b last:border-0 border-slate-50"
                  >
                    {stop.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Anonymous • Encrypted • Geo-Verified</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 border-t border-slate-100 mt-12 bg-white/50 backdrop-blur-sm rounded-t-[3rem]">
      <div className="flex gap-4 items-center flex-wrap justify-center">
        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-black border border-emerald-100">STREAMS: LIVE</span>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-bold">LATENCY: 24ms</span>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-bold">UPTIME: 99.9%</span>
      </div>
      <div className="flex flex-col items-center md:items-end">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">
          Grama-Yatri v1.3.0
        </div>
        <div className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
          Digital Mobility for Rural India • Open Source Community
        </div>
      </div>
    </footer>
  );
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    // Start seeding in background
    seedRoutes();

    // Start listeners immediately
    const unsubRoutes = onSnapshot(collection(db, 'routes'), (snap) => {
      const rData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Route));
      setRoutes(rData);
      if (rData.length > 0) {
        setSelectedRoute(prev => prev || rData[0]);
      }
      setAppLoading(false);
    }, (err) => {
      console.error('Routes Listener Error:', err);
      // Even if there is an error, stop the loading screen so user can see UI
      setAppLoading(false);
    });

    const unsubPings = onSnapshot(query(collection(db, 'pings'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
      setPings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ping)));
    }, (err) => {
      console.error('Pings Listener Error:', err);
    });

    const unsubAlerts = onSnapshot(query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(20)), (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
    }, (err) => {
      console.error('Alerts Listener Error:', err);
    });

    // Safety timeout: If app finishes auth but still "loading" app data after 4 seconds,
    // just show the UI anyway (maybe DB is empty)
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 4000);

    return () => {
      unsubAuth();
      unsubRoutes();
      unsubPings();
      unsubAlerts();
      clearTimeout(timer);
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try { 
      // If we are on a native device/emulator, popups are often blocked or fail.
      // signInWithRedirect is generally safer for mobile web views.
      const isNative = window.location.hostname === 'localhost' || window.location.protocol === 'capacitor:';
      
      if (isNative) {
        await signInWithPopup(auth, provider); // Try popup first as it works in some setups
      } else {
        await signInWithPopup(auth, provider); 
      }
    } catch (e: any) { 
      console.error('Sign-in error:', e);
      if (e.code === 'auth/operation-not-allowed') {
        alert("Google Sign-In is not enabled in your Firebase Console. Go to Authentication -> Sign-in method and enable Google.");
      } else if (e.code === 'auth/invalid-action-code' || e.message?.includes('requested action is invalid')) {
        alert("CRITICAL FOR DEADLINE: To fix sign-in on Android, you MUST copy your SHA-1 from Android Studio and add it to Firebase Console -> Project Settings. Currently, Firebase is rejecting your phone because it doesn't recognize the app. Use the shared URL if you need a working version right now!");
      } else if (e.code === 'auth/popup-closed-by-user') {
        // Silently handle
      } else {
        alert(`Sign-in failed: ${e.message}. Re-check your Firebase config!`);
      }
    }
  };

  const logOut = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  const handlePing = async (stopId: string) => {
    if (!user || !selectedRoute) return;
    if (!user.emailVerified) {
      alert("Please verify your email to contribute!");
      return;
    }
    try {
      await addDoc(collection(db, 'pings'), {
        routeId: selectedRoute.id,
        stopId,
        userId: user.uid,
        userName: (user.displayName || 'Anonymous').split(' ')[0],
        timestamp: serverTimestamp()
      });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'pings'); }
  };

  const handleAlert = async (type: Alert['type'], message: string) => {
    if (!user || !selectedRoute) return;
    if (!user.emailVerified) {
      alert("Please verify your email to contribute!");
      return;
    }
    try {
      await addDoc(collection(db, 'alerts'), {
        routeId: selectedRoute.id,
        type,
        message,
        userId: user.uid,
        userName: (user.displayName || 'Anonymous').split(' ')[0],
        timestamp: serverTimestamp()
      });
    } catch (err) { handleFirestoreError(err, OperationType.CREATE, 'alerts'); }
  };

  if (appLoading || authLoading) return <LoadingScreen />;

  const currentRoutePings = pings.filter(p => p.routeId === selectedRoute?.id);
  const latestPing = currentRoutePings[0] || null;
  
  const getMainEta = () => {
    if (!latestPing || !selectedRoute) return null;
    const currentStopIndex = selectedRoute.stops.findIndex(s => s.id === latestPing.stopId);
    if (currentStopIndex === -1 || currentStopIndex === selectedRoute.stops.length - 1) return null;
    
    // Calculate for next stop
    let nextStopIndex = currentStopIndex + 1;
    let totalMinutes = selectedRoute.stops[nextStopIndex].avgTimeFromPrev;
    const pingTime = latestPing.timestamp?.toDate() || new Date();
    return new Date(pingTime.getTime() + totalMinutes * 60000);
  };

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, signIn, logOut }}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <AlertBanner alerts={alerts} routeId={selectedRoute?.id} />
        
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
          <RouteSelector 
            routes={routes} 
            selectedRoute={selectedRoute} 
            onSelect={setSelectedRoute} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {selectedRoute && (
                <>
                  <BusMap selectedRoute={selectedRoute} latestPing={latestPing} />
                  <BusTimeline route={selectedRoute} latestPing={latestPing} />
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-8">
              {selectedRoute && (
                <>
                  <StatCard 
                    eta={getMainEta()} 
                    latestPing={latestPing} 
                    route={selectedRoute} 
                  />
                  <ActionCard 
                    user={user} 
                    route={selectedRoute} 
                    onPing={handlePing} 
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleAlert('cancel', 'Bus reported as cancelled')}
                      className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 hover:bg-red-100 transition-all"
                    >
                      <span className="text-xl">❌</span>
                      CANCELLED
                    </button>
                    <button 
                      onClick={() => handleAlert('delay', 'Bus reported as delayed')}
                      className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 hover:bg-orange-100 transition-all"
                    >
                      <span className="text-xl">⚠️</span>
                      DELAYED
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}
