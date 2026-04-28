'use client';

import { useState } from 'react';
import api from '@/lib/api';
import ScoreBadge from '@/components/ScoreBadge';
import TagPill from '@/components/TagPill';
import RiskBanner from '@/components/RiskBanner';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LookupResult {
  ip: string;
  country: string;
  asn: string;
  abuse_score: number;
  vt_score: number;
  ipqs_score: number;
  sources_seen: number;
  tags: string[];
  shodan_data: {
    ports: number[];
    hostnames: string[];
    cves: string[];
  };
}

export default function Lookup() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get(`/api/lookup/${ip}`);
      setResult(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to lookup IP address'
      );
    } finally {
      setLoading(false);
    }
  };

  const countryEmoji = (country: string) => {
    const countryCode = country?.substring(0, 2).toUpperCase();
    if (!countryCode) return '';
    return String.fromCodePoint(
      ...countryCode.split('').map((char) => 127397 + char.charCodeAt(0))
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">IP Lookup</h1>
        <p className="text-gray-400">Search for threat intelligence on any IP address</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Enter any IP address..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Risk Banner */}
          <RiskBanner score={result.abuse_score} />

          {/* IP Info Card */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{countryEmoji(result.country)}</span>
              <div>
                <h2 className="text-3xl font-bold text-white font-mono">
                  {result.ip}
                </h2>
                <p className="text-gray-400">{result.country}</p>
                <p className="text-sm text-gray-500">ASN: {result.asn}</p>
              </div>
            </div>
          </div>

          {/* Score Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreBadge score={result.abuse_score} label="AbuseIPDB" max={100} />
            <ScoreBadge score={result.vt_score} label="VirusTotal" max={100} />
            <ScoreBadge score={result.ipqs_score} label="IPQualityScore" max={100} />
            <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-gray-300 text-sm">Sources Seen</span>
              <span className="text-white font-semibold text-lg">
                {result.sources_seen}
              </span>
            </div>
          </div>

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {result.tags.map((tag, idx) => (
                  <TagPill key={idx} tag={tag} />
                ))}
              </div>
            </div>
          )}

          {/* Shodan Data */}
          {result.shodan_data && (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Shodan Information</h3>

              {/* Ports */}
              {result.shodan_data.ports && result.shodan_data.ports.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-3">Open Ports</p>
                  <div className="flex flex-wrap gap-2">
                    {result.shodan_data.ports.map((port) => (
                      <span
                        key={port}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      >
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CVEs */}
              {result.shodan_data.cves && result.shodan_data.cves.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-3">CVEs Found</p>
                  <div className="space-y-2">
                    {result.shodan_data.cves.map((cve) => (
                      <span
                        key={cve}
                        className="block px-3 py-2 bg-red-950 border border-red-700 rounded text-red-200 text-sm font-mono"
                      >
                        {cve}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hostnames */}
              {result.shodan_data.hostnames && result.shodan_data.hostnames.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-3">Hostnames</p>
                  <div className="space-y-2">
                    {result.shodan_data.hostnames.map((hostname) => (
                      <p key={hostname} className="text-white text-sm font-mono">
                        {hostname}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Raw JSON */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-800 transition"
            >
              <span className="text-lg font-bold text-white">Raw JSON Response</span>
              {showRawJson ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showRawJson && (
              <pre className="p-6 border-t border-gray-800 bg-gray-950 text-gray-300 text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
