import React from 'react';
import {
  Dumbbell,
  Apple,
  Clock,
  BarChart3,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workout', label: 'Workouts', icon: Dumbbell },
  { id: 'diet', label: 'Diet', icon: Apple },
  { id: 'recovery', label: 'Recovery', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface border-r border-primary/10 overflow-y-auto z-40 transform transition-transform duration-300 lg:static lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-4 gap-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text hover:bg-primary/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Clear Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
