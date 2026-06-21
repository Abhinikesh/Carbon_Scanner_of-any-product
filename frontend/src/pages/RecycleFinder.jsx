import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Sliders, Recycle, FileText, CheckCircle2,
  AlertTriangle, Trash2, Clock, ExternalLink, Compass, Loader2, Info
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function RecycleFinder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('query');
  const urlScanId = searchParams.get('scanId');

  const { refreshUser } = useAuth();
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Disposal Lookup States
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Nearby Centers States
  const [locationQuery, setLocationQuery] = useState('');
  const [locationDisplayName, setLocationDisplayName] = useState('');
  const [coordinates, setCoordinates] = useState(null); // { lat, lon }
  const [radius, setRadius] = useState(3000); // meters (1000m to 10000m)
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersError, setCentersError] = useState(null);

  // Trigger search on mount if url parameters exist
  useEffect(() => {
    if (urlScanId) {
      handleLookup({ scanId: urlScanId });
    } else if (urlQuery) {
      // Decode and clean category query string if needed
      const cleanQuery = urlQuery.replace(/_/g, ' ');
      setLookupQuery(cleanQuery);
      handleLookup({ query: urlQuery });
    }
  }, [urlQuery, urlScanId]);

  // Lookup Disposal Guide
  const handleLookup = async (params) => {
    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await api.post('/recycle/lookup', params);
      if (res.data && res.data.success) {
        setLookupResult(res.data);
        
        // Handle new badges celebration
        if (res.data.newBadges && res.data.newBadges.length > 0) {
          const list = res.data.newBadges;
          setUnlockedBadges(prev => [...prev, ...list]);
          setTimeout(() => {
            setUnlockedBadges(prev => prev.filter(b => !list.some(nb => nb.key === b.key)));
          }, 5000);
        }
        await refreshUser();
      } else {
        setLookupError('Failed to lookup disposal instructions.');
      }
    } catch (err) {
      console.error('[RecycleFinder] Lookup error:', err);
      setLookupError(err.response?.data?.message || err.message || 'Error looking up disposal instructions.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    handleLookup({ query: lookupQuery.trim() });
  };

  // Resolve Location and Find Centers
  const handleGeocode = async (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setCentersLoading(true);
    setCentersError(null);
    setCenters([]);
    try {
      const res = await api.get(`/recycle/geocode?q=${encodeURIComponent(locationQuery)}`);
      if (res.data && res.data.success) {
        const { lat, lon, displayName } = res.data;
        setLocationDisplayName(displayName);
        setCoordinates({ lat, lon });
        await fetchCenters(lat, lon, radius);
      } else {
        setCentersError(res.data?.message || 'Location not found.');
        setCentersLoading(false);
      }
    } catch (err) {
      console.error('[RecycleFinder] Geocode error:', err);
      setCentersError(err.response?.data?.message || err.message || 'Failed to locate address.');
      setCentersLoading(false);
    }
  };

  // Fetch Nearby Centers using OSM Overpass Proxy
  const fetchCenters = async (lat, lon, r) => {
    setCentersLoading(true);
    setCentersError(null);
    try {
      const res = await api.get(`/recycle/centers?lat=${lat}&lon=${lon}&radius=${r}`);
      if (res.data && res.data.success) {
        setCenters(res.data.centers || []);
        if (res.data.note) {
          setCentersError(res.data.note); // Set friendly warning if Overpass was down
        }
      } else {
        setCentersError(res.data?.message || 'Failed to search recycling facilities.');
      }
    } catch (err) {
      console.error('[RecycleFinder] Centers fetch error:', err);
      setCentersError(err.response?.data?.message || err.message || 'Error getting recycling centers.');
    } finally {
      setCentersLoading(false);
    }
  };

  // Refetch centers when slider stops dragging
  const handleRadiusRelease = () => {
    if (coordinates) {
      fetchCenters(coordinates.lat, coordinates.lon, radius);
    }
  };

  // Helper to format category title for matching icons
  const getCategoryIcon = (key) => {
    switch (key) {
      case 'organic_food_waste':
        return <Compass className="w-5 h-5 text-emerald-600" />;
      case 'hazardous_chemicals':
      case 'batteries':
      case 'light_bulbs_cfl':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Recycle className="w-5 h-5 text-forest" />;
    }
  };

  return (
    <div className="px-6 md:px-10 pt-8 pb-10 bg-paper min-h-screen">
      <header className="mb-6">
        <h1 className="text-[32px] font-bold text-ink leading-tight mb-1 font-display">Recycle Finder</h1>
        <p className="text-gray-500 text-sm font-body">Find eco-safe disposal guides and locate nearby community recycling centers.</p>
      </header>

      {/* Celebratory badge unlock banner */}
      {unlockedBadges.length > 0 && (
        <div className="flex flex-col gap-2 mb-6 max-w-xl">
          {unlockedBadges.map((badge) => (
            <div
              key={badge.key}
              className="bg-forest border border-emerald-500 rounded-xl p-4 text-white shadow-lg animate-bounce flex items-center gap-3 animate-pulse"
            >
              <span className="text-3xl">{badge.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs uppercase tracking-wider text-green-400 font-display">🏆 Badge Unlocked!</p>
                <p className="font-bold text-sm font-display">{badge.label}</p>
                <p className="text-[10px] text-gray-200 font-body">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Waste Disposal Lookup */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-mist rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-ink mb-4 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest" /> Disposal Guide Search
            </h2>
            <form onSubmit={handleLookupSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. plastic bottle, old battery, pizza box..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-mist rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20 font-body placeholder:text-gray-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="bg-forest hover:bg-forest-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors font-body flex items-center justify-center min-w-[90px] disabled:opacity-70 cursor-pointer"
              >
                {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            {lookupError && <ErrorBanner message={lookupError} />}

            {/* Disposal Lookup Results */}
            {lookupResult && !lookupLoading && (
              <div className="mt-6 border-t border-mist pt-6">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-forest/5 flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(lookupResult.categoryKey)}
                      </div>
                      <h3 className="text-lg font-bold text-ink capitalize font-display">
                        {lookupResult.label || lookupResult.categoryKey?.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    {lookupResult.matchedFrom === 'scan' && (
                      <span className="text-[10px] bg-green-50 text-forest border border-green-100 px-2 py-0.5 rounded-full font-bold font-body uppercase">
                        Matched from scan
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border font-body ${
                      lookupResult.recyclable
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                        : 'text-gray-600 bg-gray-50 border-gray-200'
                    }`}>
                      {lookupResult.recyclable ? '♻️ Recyclable' : '🗑️ General Waste'}
                    </span>

                    {lookupResult.hazardous && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-100 font-body flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Hazardous
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-mist rounded-xl p-4 mt-2">
                  <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider font-display">
                    Recommended Disposal Steps
                  </h4>
                  <ul className="space-y-3">
                    {lookupResult.instructions && lookupResult.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed font-body">
                        <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!lookupResult && !lookupLoading && !lookupError && (
              <EmptyState
                icon={Recycle}
                title="Disposal Lookup"
                description="Enter an item above to look up how to correctly sort, clean, and recycle it in compliance with waste management rules."
              />
            )}
          </div>
        </div>

        {/* Right Column: Nearby Centers Finder */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-mist rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-ink mb-4 font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest" /> Nearby Recycling Centers
            </h2>
            <form onSubmit={handleGeocode} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter city or address (e.g. Munich, Germany)..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-mist rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20 font-body placeholder:text-gray-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={centersLoading}
                className="bg-forest hover:bg-forest-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors font-body flex items-center justify-center min-w-[90px] disabled:opacity-70 cursor-pointer"
              >
                {centersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
              </button>
            </form>

            {/* Range Slider for Radius */}
            {coordinates && (
              <div className="bg-gray-50 border border-mist rounded-xl p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 font-display flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-forest" /> Search Radius
                  </span>
                  <span className="text-xs font-mono font-bold text-forest bg-forest/5 px-2 py-0.5 rounded">
                    {(radius / 1000).toFixed(1)} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  onMouseUp={handleRadiusRelease}
                  onTouchEnd={handleRadiusRelease}
                  className="w-full accent-forest cursor-pointer h-1.5 bg-mist rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>1.0 km</span>
                  <span>5.0 km</span>
                  <span>10.0 km</span>
                </div>
              </div>
            )}

            {centersError && <ErrorBanner message={centersError} />}

            {/* Resolved Address Banner */}
            {locationDisplayName && (
              <div className="mb-4 bg-gray-50 border border-mist/50 p-2.5 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-gray-600 font-body leading-normal">
                  <span className="font-bold text-ink">Searching around:</span> {locationDisplayName}
                </div>
              </div>
            )}

            {/* Centers List */}
            {centersLoading ? (
              <Spinner size="medium" />
            ) : centers.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {centers.map((center, index) => (
                  <div key={index} className="border border-mist hover:border-forest/30 bg-white p-4 rounded-xl shadow-sm transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-ink font-display line-clamp-1">{center.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded flex-shrink-0">
                        {center.distanceKm} km
                      </span>
                    </div>

                    {center.openingHours && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-body">
                        <Clock className="w-3 h-3 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{center.openingHours}</span>
                      </div>
                    )}

                    {center.acceptedMaterials && center.acceptedMaterials.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {center.acceptedMaterials.map((mat) => (
                          <span key={mat} className="text-[9px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                            {mat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-forest hover:text-forest-dark flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Get Directions
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : !centersLoading && coordinates ? (
              <EmptyState
                icon={MapPin}
                title="No centers found"
                description="Try expanding the search radius slider to cover a wider area."
              />
            ) : (
              <EmptyState
                icon={Compass}
                title="Find Recycling Centers"
                description="Enter your address or city above to discover nearest recycling drop-offs and municipal centers."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
