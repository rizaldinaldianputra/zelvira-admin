'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api.client';
import { toast } from 'sonner';
import {
  Shield, Plus, KeyRound, Ban, RefreshCw, History, Copy, Check, Power, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AiAgent {
  id: number;
  agentId: string;
  name: string;
  description: string;
  isActive: boolean;
  hasActiveKey: boolean;
  tokenPrefix: string | null;
  permissions: string[];
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface AuditLog {
  id: number;
  agentId: string;
  endpoint: string;
  httpMethod: string;
  responseStatus: number;
  ipAddress: string;
  durationMs: number;
  createdAt: string;
}

export default function AiAgentsPage() {
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedKey, setRevealedKey] = useState<{ agentId: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newAgentId, setNewAgentId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPerms, setNewPerms] = useState('products.read,categories.read,media.read');

  const [logsModal, setLogsModal] = useState<{ agent: AiAgent; logs: AuditLog[] } | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AiAgent[]>('/v1/admin/ai-agents');
      setAgents(Array.isArray(res) ? res : []);
    } catch (e: any) {
      toast.error(e?.message || 'Gagal memuat daftar AI Agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await apiClient.post('/v1/admin/ai-agents', {
        agentId: newAgentId,
        name: newName,
        description: newDesc,
        permissions: newPerms.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setNewAgentId('');
      setNewName('');
      setNewDesc('');
      if (res?.apiKey) {
        setRevealedKey({ agentId: res.agentId, key: res.apiKey });
      }
      toast.success('AI Agent berhasil dibuat');
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuat AI Agent');
    }
  };

  const handleRotateKey = async (agent: AiAgent) => {
    if (!confirm(`Rotate API Key untuk ${agent.agentId}? Token lama akan langsung dicabut.`)) return;
    try {
      const res: any = await apiClient.post(`/v1/admin/ai-agents/${agent.id}/rotate-key`, {});
      if (res?.apiKey) {
        setRevealedKey({ agentId: agent.agentId, key: res.apiKey });
      }
      toast.success('API Key berhasil di-rotate');
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal rotate key');
    }
  };

  const handleRevokeKey = async (agent: AiAgent) => {
    if (!confirm(`Revoke API Key aktif untuk ${agent.agentId}?`)) return;
    try {
      await apiClient.post(`/v1/admin/ai-agents/${agent.id}/revoke-key`, {});
      toast.success('API Key dicabut');
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal revoke key');
    }
  };

  const handleToggleActive = async (agent: AiAgent) => {
    try {
      await apiClient.patch(`/v1/admin/ai-agents/${agent.id}`, { isActive: !agent.isActive });
      toast.success(`Agent ${!agent.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengubah status agent');
    }
  };

  const handleViewLogs = async (agent: AiAgent) => {
    try {
      const res: any = await apiClient.get(`/v1/admin/ai-agents/${agent.id}/logs?page=0&size=30`);
      setLogsModal({ agent, logs: res?.content || [] });
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memuat audit log');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-pink-500" /> AI Agents Management
          </h1>
          <p className="text-sm text-slate-500">
            Kelola profil Hermes AI Agent, API Key unik, permission read-only, dan audit log akses.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Buat AI Agent
        </Button>
      </div>

      {revealedKey && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              API Key Baru untuk {revealedKey.agentId} (Ditampilkan 1x saja — segera simpan!)
            </span>
            <button onClick={() => setRevealedKey(null)} className="text-xs font-bold text-slate-500 hover:underline">
              Tutup
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200">
            <code className="text-sm font-mono flex-1 break-all text-slate-900 dark:text-white">{revealedKey.key}</code>
            <Button size="sm" variant="outline" onClick={() => copyKey(revealedKey.key)}>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900 dark:text-white">{agent.name}</span>
                    <code className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">
                      {agent.agentId}
                    </code>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        agent.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{agent.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(agent)}>
                    <Power className="w-3.5 h-3.5 mr-1" /> {agent.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRotateKey(agent)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Rotate Key
                  </Button>
                  {agent.hasActiveKey && (
                    <Button size="sm" variant="outline" className="text-rose-600" onClick={() => handleRevokeKey(agent)}>
                      <Ban className="w-3.5 h-3.5 mr-1" /> Revoke
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleViewLogs(agent)}>
                    <History className="w-3.5 h-3.5 mr-1" /> Audit Logs
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  Prefix: <code className="font-mono">{agent.tokenPrefix || 'Belum ada key aktif'}</code>
                </span>
                <span>
                  Terakhir digunakan: {agent.lastUsedAt ? new Date(agent.lastUsedAt).toLocaleString('id-ID') : 'Belum pernah'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {agent.permissions.map((p) => (
                  <span key={p} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-black">Buat AI Agent Baru</h2>
            <Input placeholder="Agent ID (contoh: hermes-analyst)" value={newAgentId} onChange={(e) => setNewAgentId(e.target.value)} required />
            <Input placeholder="Nama Agent" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            <Input placeholder="Deskripsi" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Input placeholder="Permissions (pisahkan koma)" value={newPerms} onChange={(e) => setNewPerms(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button type="submit" className="bg-pink-600 text-white">Simpan & Generate Key</Button>
            </div>
          </form>
        </div>
      )}

      {logsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Audit Logs: {logsModal.agent.agentId}</h2>
              <Button size="sm" variant="ghost" onClick={() => setLogsModal(null)}>Tutup</Button>
            </div>
            {logsModal.logs.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada aktivitas akses.</p>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                {logsModal.logs.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span>{l.httpMethod} {l.endpoint}</span>
                    <span>Status: {l.responseStatus} | {l.durationMs}ms | {l.ipAddress}</span>
                    <span className="text-slate-400">{new Date(l.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
