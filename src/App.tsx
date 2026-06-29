import React, { useState } from 'react';
import type { UserProfile } from './types';
import { AppProvider } from './context/AppContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { DietProvider } from './context/DietContext';
import { RecoveryProvider } from './context/RecoveryContext';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProfileForm } from './components/UserProfile/ProfileForm';
import { ProfileDisplay } from './components/UserProfile/ProfileDisplay';
import { BodyweightTracker } from './components/Fitness/BodyweightTracker';
import { MachineTracker } from './components/Fitness/MachineTracker';
import { CardioTracker } from './components/Fitness/CardioTracker';
import { CrossTrainingTracker } from './components/Fitness/CrossTrainingTracker';
import { MacroTracker } from './components/Diet/MacroTracker';
import { RecoveryTimer } from './components/Recovery/RecoveryTimer';
import { useAppContext } from './context/AppContext';
import './styles/globals.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { userProfile, setUserProfile, clearAllData } = useAppContext();

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;

      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-6">User Profile</h1>
            </div>

            {!userProfile ? (
              <div className="max-w-2xl">
                <ProfileForm onSubmit={handleProfileSubmit} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setUserProfile(null)}
                    className="btn-secondary"
                  >
                    Edit Profile
                  </button>
                </div>
                <ProfileDisplay profile={userProfile} />
              </div>
            )}
          </div>
        );

      case 'workout':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-6">Fitness Tracking</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <BodyweightTracker />
              <MachineTracker />
              <CardioTracker />
              <CrossTrainingTracker />
            </div>
          </div>
        );

      case 'diet':
        return <MacroTracker />;

      case 'recovery':
        return <RecoveryTimer />;

      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">Settings</h1>
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">Application Settings</h3>
              <p className="text-text/60 mb-6">
                All your data is stored locally in your browser. No account needed!
              </p>

              <div className="space-y-3">
                <div className="card p-4 bg-surface">
                  <p className="font-semibold mb-2">💾 Local Storage</p>
                  <p className="text-sm text-text/60">
                    Your workouts, meals, and profile are saved automatically.
                  </p>
                </div>

                <div className="card p-4 bg-surface">
                  <p className="font-semibold mb-2">🌙 Dark Mode</p>
                  <p className="text-sm text-text/60">
                    Toggle theme from the top right of the page.
                  </p>
                </div>

                <div className="card p-4 bg-amber-500/10 border border-amber-500/20">
                  <p className="font-semibold mb-2 text-amber-600">⚠️ Clear Data</p>
                  <p className="text-sm text-text/60 mb-3">
                    This will permanently delete all your data. Use with caution.
                  </p>
                  <button onClick={clearAllData} className="btn-danger btn-sm">
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <WorkoutProvider>
        <DietProvider>
          <RecoveryProvider>
            <AppContent />
          </RecoveryProvider>
        </DietProvider>
      </WorkoutProvider>
    </AppProvider>
  );
}

export default App;
