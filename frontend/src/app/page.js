'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ScoreBadge from '@/components/ScoreBadge';
import TagPill from '@/components/TagPill';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StatCard {
  label: string;
  value: number | string;
  icon?: string;
}

interface IPData {
  ip: string;
  country: string;
  abuse_score: number;
  vt_score: number;
  ipqs_score: number;
  tags: string[];
  sources_seen: number;
}

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [recentIPs, setRecentIPs] = useState<IPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getAbuseScoreColor = (score: number) => {
    if (score < 25) return 'text-green-400 bg-green-950';
    if (score < 75) return 'text-yellow-400 bg-yellow-950';
    return 'text-red-400 bg-red-950';
  };

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
            {stats?.top_countries?.[0]?.country || 'N/A'}
          </p>
        </div>
      </div>

      {/* Chart */}
      {stats?.top_countries && stats.top_countries.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">
            Top 10 Countries by IP Count
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

      {/* Recent Lookups Table */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Recent Lookups</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400">
                <th className="text-left py-3 px-4">IP</th>
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-center py-3 px-4">Abuse Score</th>
                <th className="text-center py-3 px-4">VT Score</th>
                <th className="text-center py-3 px-4">IPQS Score</th>
                <th className="text-center py-3 px-4">Sources Seen</th>
                <th className="text-left py-3 px-4">Tags</th>
              </tr>
            </thead>
            <tbody>
              {recentIPs.slice(0, 10).map((ip, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4 font-mono text-blue-400">{ip.ip}</td>
                  <td className="py-3 px-4">{ip.country}</td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${getAbuseScoreColor(
                      ip.abuse_score
                    )}`}
                  >
                    {ip.abuse_score.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ip.vt_score?.toFixed(0) || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {ip.ipqs_score?.toFixed(0) || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">{ip.sources_seen}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {ip.tags?.map((tag, tidx) => (
                        <TagPill key={tidx} tag={tag} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
