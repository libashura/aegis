'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../lib/api.js';
import { Globe, TrendingUp } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import('../../components/WorldMap'), {
  ssr: false,
  loading: () => <div className="text-gray-400 text-center py-12">Loading map...</div>,
});

export default function Map() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load threat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const countryEmoji = (country) => {
    if (!country || country.length < 2) return '🌍';
    const countryCode = country.substring(0, 2).toUpperCase();
    return String.fromCodePoint(
      ...countryCode.split('').map((char) => 127397 + char.charCodeAt(0))
    );
  };

  const getIntensityColor = (count, max) => {
    const intensity = count / max;
    if (intensity >= 0.8) return 'bg-red-900 border-red-700';
    if (intensity >= 0.6) return 'bg-orange-900 border-orange-700';
    if (intensity >= 0.4) return 'bg-yellow-900 border-yellow-700';
    if (intensity >= 0.2) return 'bg-blue-900 border-blue-700';
    return 'bg-green-900 border-green-700';
  };

  const getIntensityBorder = (count, max) => {
    const intensity = count / max;
    if (intensity >= 0.8) return 'shadow-lg shadow-red-500';
    if (intensity >= 0.6) return 'shadow-lg shadow-orange-500';
    if (intensity >= 0.4) return 'shadow-lg shadow-yellow-500';
    if (intensity >= 0.2) return 'shadow-lg shadow-blue-500';
    return 'shadow-lg shadow-green-500';
  };

  const maxCount = Math.max(...(stats?.top_countries?.map(c => c.count) || [1]));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          Global Threat Map
        </h1>
        <p className="text-gray-400">Geographic distribution of detected threats</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total Threats Tracked</p>
          <p className="text-3xl font-bold text-white">
            {stats?.total_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Countries Affected</p>
          <p className="text-3xl font-bold text-blue-400">
            {stats?.top_countries?.length || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">High Risk IPs</p>
          <p className="text-3xl font-bold text-red-400">
            {stats?.high_risk_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Highest Activity</p>
          <p className="text-3xl font-bold text-white">
            {stats?.top_countries?.[0]?.country || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.top_countries?.[0]?.count || 0} threats
          </p>
        </div>
      </div>

      {/* Interactive World Map */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-400" />
          Interactive Global Threat Distribution
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Red circles indicate high threat activity. Hover over circles to see country details.
        </p>
        <WorldMap threatData={stats?.top_countries} />
      </div>

      {/* Color Legend */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Threat Intensity Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 border-2 border-red-700 rounded-full"></div>
            <span className="text-gray-300 text-sm">Critical (80-100%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-900 border-2 border-orange-700 rounded-full"></div>
            <span className="text-gray-300 text-sm">High (60-80%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-900 border-2 border-yellow-700 rounded-full"></div>
            <span className="text-gray-300 text-sm">Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 border-2 border-blue-700 rounded-full"></div>
            <span className="text-gray-300 text-sm">Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-900 border-2 border-green-700 rounded-full"></div>
            <span className="text-gray-300 text-sm">Minimal (0-20%)</span>
          </div>
        </div>
      </div>

      {/* Country Heat Map Grid */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          Threat Heat Map by Country
        </h2>
        
        {stats?.top_countries && stats.top_countries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {stats.top_countries.map((item) => (
              <div
                key={item.country}
                className={`rounded-lg p-4 text-center border-2 transition-all ${getIntensityColor(
                  item.count,
                  maxCount
                )} ${getIntensityBorder(item.count, maxCount)}`}
              >
                <div className="text-4xl mb-2">{countryEmoji(item.country)}</div>
                <p className="font-bold text-white mb-1">{item.country}</p>
                <p className="text-sm text-gray-300 font-semibold">{item.count}</p>
                <p className="text-xs text-gray-400 mt-1">threat{item.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No threat data available yet</p>
        )}
      </div>

      {/* Statistics Table */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Detailed Country Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-center py-3 px-4">Threats Detected</th>
                <th className="text-center py-3 px-4">Percentage</th>
                <th className="text-left py-3 px-4">Threat Level</th>
              </tr>
            </thead>
            <tbody>
              {stats?.top_countries?.map((item, idx) => {
                const percentage = ((item.count / (stats?.total_ips || 1)) * 100).toFixed(1);
                const threatLevel =
                  percentage >= 20 ? 'Critical' :
                  percentage >= 15 ? 'High' :
                  percentage >= 10 ? 'Medium' :
                  percentage >= 5 ? 'Low' : 'Minimal';
                
                const threatColor =
                  threatLevel === 'Critical' ? 'text-red-400' :
                  threatLevel === 'High' ? 'text-orange-400' :
                  threatLevel === 'Medium' ? 'text-yellow-400' :
                  threatLevel === 'Low' ? 'text-blue-400' : 'text-green-400';

                return (
                  <tr
                    key={item.country}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="mr-2">{countryEmoji(item.country)}</span>
                      <span className="font-semibold text-white">{item.country}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {item.count}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {percentage}%
                    </td>
                    <td className={`py-3 px-4 font-semibold ${threatColor}`}>
                      {threatLevel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
    {
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          Global Threat Map
        </h1>
        <p className="text-gray-400">Geographic distribution of detected threats</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total Threats Tracked</p>
          <p className="text-3xl font-bold text-white">
            {stats?.total_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Countries Affected</p>
          <p className="text-3xl font-bold text-blue-400">
            {stats?.top_countries?.length || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">High Risk IPs</p>
          <p className="text-3xl font-bold text-red-400">
            {stats?.high_risk_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Highest Activity</p>
          <p className="text-3xl font-bold text-white">
            {stats?.top_countries?.[0]?.country || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.top_countries?.[0]?.count || 0} threats
          </p>
        </div>
      </div>

      {/* Country Heat Map Grid */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          Threat Heat Map by Country
        </h2>
        
        {stats?.top_countries && stats.top_countries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {stats.top_countries.map((item) => (
              <div
                key={item.country}
                className={`rounded-lg p-4 text-center border-2 transition-all ${getIntensityColor(
                  item.count,
                  maxCount
                )} ${getIntensityBorder(item.count, maxCount)}`}
              >
                <div className="text-4xl mb-2">{countryEmoji(item.country)}</div>
                <p className="font-bold text-white mb-1">{item.country}</p>
                <p className="text-sm text-gray-300 font-semibold">{item.count}</p>
                <p className="text-xs text-gray-400 mt-1">threat{item.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No threat data available yet</p>
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">Threat Intensity Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 border-2 border-red-700 rounded"></div>
            <span className="text-gray-300 text-sm">Critical (80-100%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-900 border-2 border-orange-700 rounded"></div>
            <span className="text-gray-300 text-sm">High (60-80%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-900 border-2 border-yellow-700 rounded"></div>
            <span className="text-gray-300 text-sm">Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 border-2 border-blue-700 rounded"></div>
            <span className="text-gray-300 text-sm">Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-900 border-2 border-green-700 rounded"></div>
            <span className="text-gray-300 text-sm">Minimal (0-20%)</span>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Detailed Country Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-center py-3 px-4">Threats Detected</th>
                <th className="text-center py-3 px-4">Percentage</th>
                <th className="text-left py-3 px-4">Threat Level</th>
              </tr>
            </thead>
            <tbody>
              {stats?.top_countries?.map((item, idx) => {
                const percentage = ((item.count / (stats?.total_ips || 1)) * 100).toFixed(1);
                const threatLevel =
                  percentage >= 20 ? 'Critical' :
                  percentage >= 15 ? 'High' :
                  percentage >= 10 ? 'Medium' :
                  percentage >= 5 ? 'Low' : 'Minimal';
                
                const threatColor =
                  threatLevel === 'Critical' ? 'text-red-400' :
                  threatLevel === 'High' ? 'text-orange-400' :
                  threatLevel === 'Medium' ? 'text-yellow-400' :
                  threatLevel === 'Low' ? 'text-blue-400' : 'text-green-400';

                return (
                  <tr
                    key={item.country}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="mr-2">{countryEmoji(item.country)}</span>
                      <span className="font-semibold text-white">{item.country}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      {item.count}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {percentage}%
                    </td>
                    <td className={`py-3 px-4 font-semibold ${threatColor}`}>
                      {threatLevel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    }

