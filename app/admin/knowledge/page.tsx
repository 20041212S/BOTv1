'use client';

import { useEffect, useState } from 'react';

interface Knowledge {
  id: string;
  source: string;
  type: string;
  name: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeManagementPage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
  const [formData, setFormData] = useState({
    source: '',
    type: '',
    name: '',
    text: '',
  });

  useEffect(() => {
    loadKnowledge();
  }, [selectedType, searchTerm]);

  const loadKnowledge = async () => {
    try {
      let url = '/api/admin/knowledge';
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      
      const res = await fetch(url);
      const data = await res.json();
      setKnowledge(data);
      
      // Extract unique types
      const uniqueTypes = Array.from(new Set(data.map((k: Knowledge) => k.type))) as string[];
      setTypes(uniqueTypes);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingKnowledge 
        ? `/api/admin/knowledge/${editingKnowledge.id}`
        : '/api/admin/knowledge';
      const method = editingKnowledge ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingKnowledge(null);
        setFormData({
          source: '',
          type: '',
          name: '',
          text: '',
        });
        loadKnowledge();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save knowledge entry');
      }
    } catch (error) {
      console.error('Failed to save knowledge:', error);
      alert('Failed to save knowledge entry');
    }
  };

  const handleEdit = (item: Knowledge) => {
    setEditingKnowledge(item);
    setFormData({
      source: item.source,
      type: item.type,
      name: item.name,
      text: item.text,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;
    
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadKnowledge();
      }
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      alert('Failed to delete knowledge entry');
    }
  };

  const knowledgeTypes = [
    'FAQ',
    'Policy',
    'Procedure',
    'General Info',
    'Event',
    'Announcement',
    'Academic',
    'Administrative',
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Knowledge Base</h1>
          <p className="text-gray-600">Manage information that the chatbot can learn from</p>
        </div>
        <button
          onClick={() => {
            setEditingKnowledge(null);
            setFormData({ source: '', type: '', name: '', text: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary px-6 py-3 rounded-xl text-white font-semibold hover-lift transition-all"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          + Add Knowledge
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl flex gap-4 items-center" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search knowledge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="modern-input w-full rounded-xl py-2 px-4"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="modern-input rounded-xl py-2 px-4 min-w-[200px]"
        >
          <option value="all">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Knowledge List */}
      <div className="grid gap-4">
        {knowledge.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
            <p className="text-gray-600">No knowledge entries found. Add your first entry to help the chatbot learn!</p>
          </div>
        ) : (
          knowledge.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 rounded-2xl hover-lift transition-all"
              style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-600">{item.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-charcoal mb-2">{item.name}</h3>
                  <p className="text-gray-700 text-sm line-clamp-3">{item.text}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-charcoal hover-lift transition-all"
                    style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white hover-lift transition-all"
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              {editingKnowledge ? 'Edit Knowledge' : 'Add Knowledge'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Source <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Student Handbook, Website, FAQ"
                  className="modern-input w-full rounded-xl py-3 px-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="modern-input w-full rounded-xl py-3 px-4"
                >
                  <option value="">Select type...</option>
                  {knowledgeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Title/Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Library Hours, Fee Payment Process"
                  className="modern-input w-full rounded-xl py-3 px-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter the information that the chatbot should learn. Be detailed and clear."
                  rows={8}
                  className="modern-input w-full rounded-xl py-3 px-4 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This content will be used by the chatbot to answer student questions.
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingKnowledge(null);
                  }}
                  className="px-6 py-3 rounded-xl text-charcoal font-semibold hover-lift transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-white font-semibold hover-lift transition-all"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {editingKnowledge ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

