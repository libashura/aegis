'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import TagPill from '../components/TagPill.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recentIPs, setRecentIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/stats');
        setStats(response.data);
        setRecentIPs(response.data.recent_ips || []);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  const getAbuseScoreColor = (score) => {
    if (score < 25) return 'text-green-400 bg-green-950';
    if (score < 75) return 'text-yellow-400 bg-yellow-950';
    return 'text-red-400 bg-red-950';
  };

  const countryEmoji = (country) => {
    if (!country || country.length < 2) return '🌍';
    const countryCode = country.substring(0, 2).toUpperCase();
    return String.fromCodePoint(
      ...countryCode.split('').map((char) => 127397 + char.charCodeAt(0))
    );
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Monitor threat intelligence across all sources</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total IPs Tracked</p>
          <p className="text-4xl font-bold text-white">
            {stats?.total_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">High Risk IPs</p>
          <p className="text-4xl font-bold text-red-400">
            {stats?.high_risk_ips || 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Most Active Threat Country</p>
          <p className="text-2xl font-bold text-white">
            {stats?.top_countries?.[0]?.country ? 
              `${countryEmoji(stats.top_countries[0].country)} ${stats.top_countries[0].country}` 
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {stats?.top_countries && stats.top_countries.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">
              Top Countries by IP Count
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.top_countries.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart */}
        {stats?.top_countries && stats.top_countries.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">
              IP Distribution by Country
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.top_countries.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, count }) => `${country} (${count})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.top_countries.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Lookups Table */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Recent IP Lookups ({recentIPs.length})</h2>
        {recentIPs.length === 0 ? (
          <p className="text-gray-400">No recent lookups yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left py-3 px-4">IP Address</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-center py-3 px-4">ASN</th>
                  <th className="text-center py-3 px-4">Abuse Score</th>
                  <th className="text-center py-3 px-4">VT Score</th>
                  <th className="text-center py-3 px-4">IPQS Score</th>
                  <th className="text-center py-3 px-4">Sources</th>
                  <th className="text-left py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentIPs.map((ip) => (
                  <tr
                    key={ip.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="py-3 px-4 font-mono text-blue-400">{ip.ip}</td>
                    <td className="py-3 px-4">
                      <span className="mr-2">{countryEmoji(ip.country)}</span>
                      {ip.country || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">{ip.asn}</td>
                    <td
                      className={`py-3 px-4 text-center font-semibold ${getAbuseScoreColor(
                        ip.abuse_score
                      )}`}
                    >
                      {ip.abuse_score?.toFixed(0) || '0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ip.vt_score?.toFixed(1) || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ip.ipqs_score?.toFixed(0) || '-'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {ip.sources_seen}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(ip.last_updated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
