'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ApplicationSetting } from '@/types';
import Link from 'next/link';


export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ApplicationSetting>({
    id: '',
    applicationName: 'ASMS Portal',
    academicYear: '2026-2027',
    allowLateSubmissions: false,
    maxFileSizeMb: 10,
    allowedFileExtensions: '.pdf,.docx,.zip',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data) setSettings(response.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', settings);
      setMessage('Settings updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Failed to update settings.');
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-6 border">
         <div>
      <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
      Dashboard
</Link>
      </div>
      <br/>
      
      <h1 className="text-2xl font-bold mb-6">Application Settings</h1>
      {message && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Application Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={settings.applicationName}
            onChange={(e) => setSettings({ ...settings, applicationName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Academic Year</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={settings.academicYear}
            onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max File Size (MB)</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={settings.maxFileSizeMb}
            onChange={(e) => setSettings({ ...settings, maxFileSizeMb: Number(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Allowed File Extensions</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={settings.allowedFileExtensions}
            onChange={(e) => setSettings({ ...settings, allowedFileExtensions: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="allowLate"
            checked={settings.allowLateSubmissions}
            onChange={(e) => setSettings({ ...settings, allowLateSubmissions: e.target.checked })}
          />
          <label htmlFor="allowLate" className="font-medium text-sm">
            Allow Late Assignment Submissions
          </label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium mt-4">
          Save Settings
        </button>
      </form>
    </div>
  );
}