import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getClients, createClient, connectClient, disconnectClient, deleteClient } from '../services/api';
import { useSocket } from '../utils/socket';

const STATUS_COLORS = {
  connected: '#25d366', disconnected: '#999', qr_ready: '#ff9500',
  initializing: '#007aff', auth_failure: '#ff3b30'
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [qrModal, setQrModal] = useState(null); // { clientId, qr }

  const load = useCallback(async () => {
    try {
      const { data } = await getClients();
      setClients(data.clients);
    } catch (e) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Listen to socket events for all client IDs
  const allClientIds = clients.map(c => c.clientId);

  useSocket(allClientIds[0], {
    qr: ({ clientId, qr }) => {
      setQrModal({ clientId, qr });
      setClients(prev => prev.map(c => c.clientId === clientId ? { ...c, status: 'qr_ready', qrCode: qr } : c));
    },
    ready: ({ clientId }) => {
      toast.success('WhatsApp connected!');
      setQrModal(null);
      setClients(prev => prev.map(c => c.clientId === clientId ? { ...c, status: 'connected', qrCode: null } : c));
    },
    disconnected: ({ clientId }) => {
      setClients(prev => prev.map(c => c.clientId === clientId ? { ...c, status: 'disconnected' } : c));
    },
    auth_failure: ({ clientId }) => {
      toast.error('WhatsApp auth failed for client');
      setClients(prev => prev.map(c => c.clientId === clientId ? { ...c, status: 'auth_failure' } : c));
    }
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await createClient(newName.trim());
      setClients(prev => [data.client, ...prev]);
      setNewName('');
      toast.success('Client created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const handleConnect = async (client) => {
    try {
      await connectClient(client._id);
      toast.info('Initializing WhatsApp... Watch for QR code');
      setClients(prev => prev.map(c => c._id === client._id ? { ...c, status: 'initializing' } : c));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection failed');
    }
  };

  const handleDisconnect = async (client) => {
    try {
      await disconnectClient(client._id);
      setClients(prev => prev.map(c => c._id === client._id ? { ...c, status: 'disconnected' } : c));
      toast.success('Disconnected');
    } catch (err) {
      toast.error('Failed to disconnect');
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await deleteClient(client._id);
      setClients(prev => prev.filter(c => c._id !== client._id));
      toast.success('Client deleted');
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>📱 WhatsApp Clients</h2>

      {/* Create form */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px' }}>Add New Client</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Marketing Team, Sales Bot"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
          />
          <button type="submit" disabled={creating} style={btnGreen}>
            {creating ? 'Creating...' : '+ Add Client'}
          </button>
        </form>
      </div>

      {/* Client list */}
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {clients.map(client => (
            <div key={client._id} style={{
              background: '#fff', borderRadius: 10, padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${STATUS_COLORS[client.status] || '#ccc'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{client.name}</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                    {client.phone ? `📞 +${client.phone}` : 'Not connected'}
                    {' · '}
                    <span style={{ color: STATUS_COLORS[client.status] }}>●</span>
                    {' '}{client.status.replace('_', ' ')}
                    {' · '}{client.messagesSent || 0} messages sent
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {client.status === 'qr_ready' && client.qrCode && (
                    <button onClick={() => setQrModal({ clientId: client.clientId, qr: client.qrCode })}
                      style={{ ...btnGreen, padding: '8px 16px' }}>
                      📷 Show QR
                    </button>
                  )}
                  {['disconnected', 'auth_failure'].includes(client.status) && (
                    <button onClick={() => handleConnect(client)} style={{ ...btnGreen, padding: '8px 16px' }}>
                      🔗 Connect
                    </button>
                  )}
                  {client.status === 'connected' && (
                    <button onClick={() => handleDisconnect(client)} style={{ ...btnYellow, padding: '8px 16px' }}>
                      Disconnect
                    </button>
                  )}
                  {client.status === 'initializing' && (
                    <span style={{ fontSize: 13, color: '#007aff' }}>⏳ Initializing...</span>
                  )}
                  <button onClick={() => handleDelete(client)} style={{ ...btnRed, padding: '8px 12px' }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              No clients yet. Add one above to get started.
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 360 }}>
            <h3 style={{ margin: '0 0 8px' }}>📷 Scan QR Code</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
            <img src={qrModal.qr} alt="QR Code" style={{ width: 280, height: 280, border: '1px solid #eee', borderRadius: 8 }} />
            <div style={{ marginTop: 20 }}>
              <button onClick={() => setQrModal(null)} style={btnGray}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnGreen = { background: '#25d366', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnYellow = { background: '#ff9500', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnRed = { background: '#ff3b30', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 };
const btnGray = { background: '#666', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 };
