'use client';

import { useEffect, useState } from 'react';

interface Room {
  id: string;
  roomCode: string;
  buildingName: string;
  floor: string;
  textDirections?: string;
  latitude?: number;
  longitude?: number;
}

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomCode: '',
    buildingName: '',
    floor: '',
    textDirections: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadRooms();
  }, [selectedBuilding]);

  const loadRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      setRooms(data);
      
      const buildingList = Array.from(new Set(data.map((r: Room) => r.buildingName))) as string[];
      setBuildings(buildingList);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoom 
        ? `/api/admin/rooms/${editingRoom.id}`
        : '/api/admin/rooms';
      const method = editingRoom ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingRoom(null);
        setFormData({
          roomCode: '',
          buildingName: '',
          floor: '',
          textDirections: '',
          latitude: '',
          longitude: '',
        });
        loadRooms();
      }
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomCode: room.roomCode,
      buildingName: room.buildingName,
      floor: room.floor,
      textDirections: room.textDirections || '',
      latitude: room.latitude?.toString() || '',
      longitude: room.longitude?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadRooms();
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const filteredRooms = selectedBuilding === 'all' 
    ? rooms 
    : rooms.filter(r => r.buildingName === selectedBuilding);

  const roomsByBuilding = filteredRooms.reduce((acc, room) => {
    if (!acc[room.buildingName]) {
      acc[room.buildingName] = [];
    }
    acc[room.buildingName].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text animate-slide-up" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Classroom & Building Management
        </h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setFormData({
              roomCode: '',
              buildingName: '',
              floor: '',
              textDirections: '',
              latitude: '',
              longitude: '',
            });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold relative overflow-hidden group hover-lift"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <span className="material-symbols-outlined relative z-10">add</span>
          <span className="relative z-10">Add Room</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building List */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <h2 className="text-xl font-bold text-charcoal mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">business</span>
            Buildings
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedBuilding('all')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold ${
                selectedBuilding === 'all'
                  ? 'text-white shadow-lg'
                  : 'glass-card text-charcoal hover:bg-white/30'
              }`}
              style={selectedBuilding === 'all' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' } : { background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
            >
              All Buildings
            </button>
            {buildings.map((building) => {
              const count = rooms.filter(r => r.buildingName === building).length;
              return (
                <button
                  key={building}
                  onClick={() => setSelectedBuilding(building)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between font-semibold ${
                    selectedBuilding === building
                      ? 'text-white shadow-lg'
                      : 'glass-card text-charcoal hover:bg-white/30'
                  }`}
                  style={selectedBuilding === building ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' } : { background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                >
                  <span>{building}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedBuilding === building ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{count} rooms</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rooms List */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(roomsByBuilding).map(([building, buildingRooms], buildingIndex) => (
            <div key={building} className="glass-card rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)', animationDelay: `${buildingIndex * 0.1}s` }}>
              <h3 className="text-xl font-bold gradient-text mb-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {building}
              </h3>
              <div className="space-y-3">
                {buildingRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-xl glass-card hover-lift transition-all"
                    style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                  >
                    <div>
                      <p className="font-bold text-charcoal text-base">{room.roomCode}</p>
                      <p className="text-sm text-gray-600 font-medium">
                        Floor {room.floor}
                        {room.textDirections && ` • ${room.textDirections}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-3 rounded-xl glass-card hover-lift transition-all"
                        style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                      >
                        <span className="material-symbols-outlined text-charcoal">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-3 rounded-xl hover-lift transition-all"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(10px)' }}
                      >
                        <span className="material-symbols-outlined text-red-500">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-large max-h-[90vh] overflow-y-auto animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <h2 className="text-2xl font-bold gradient-text mb-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={formData.roomCode}
                  onChange={(e) => setFormData({ ...formData, roomCode: e.target.value })}
                  required
                  className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Building Name
                </label>
                <input
                  type="text"
                  value={formData.buildingName}
                  onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                  required
                  className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Floor
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  required
                  className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Directions
                </label>
                <textarea
                  value={formData.textDirections}
                  onChange={(e) => setFormData({ ...formData, textDirections: e.target.value })}
                  className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="modern-input w-full rounded-2xl py-3 px-4 text-charcoal"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl glass-card text-charcoal font-semibold hover-lift transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 px-4 py-3 rounded-2xl text-white font-semibold relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <span className="relative z-10">{editingRoom ? 'Update' : 'Create'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

