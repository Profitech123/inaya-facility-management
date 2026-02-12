import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AuthGuard from '../components/AuthGuard';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import ProfileBookingsCard from '../components/profile/ProfileBookingsCard';
import ProfilePropertiesCard from '../components/profile/ProfilePropertiesCard';

function UserProfileContent() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUser = () => {
    base44.auth.me().then(u => {
      setUser(u);
      setRefreshKey(k => k + 1);
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-slate-300">Manage your account details, properties, and view booking history.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <ProfileInfoCard key={`info-${refreshKey}`} user={user} onUpdate={loadUser} />

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileBookingsCard userId={user.id} />
          <ProfilePropertiesCard userId={user.id} />
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  return (
    <AuthGuard requiredRole="customer">
      <UserProfileContent />
    </AuthGuard>
  );
}