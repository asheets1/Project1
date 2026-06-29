import React from 'react';
import type { SafetyWarning } from '../../types';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

interface SafetyWarningsProps {
  warnings: SafetyWarning[];
  onDismiss?: (id: string) => void;
}

export const SafetyWarnings: React.FC<SafetyWarningsProps> = ({ warnings, onDismiss }) => {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.map((warning) => {
        const Icon = warning.severity === 'critical' ? AlertCircle : AlertTriangle;
        const bgColor =
          warning.severity === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10';
        const borderColor =
          warning.severity === 'critical' ? 'border-red-500/20' : 'border-amber-500/20';
        const textColor =
          warning.severity === 'critical' ? 'text-red-600' : 'text-amber-600';

        return (
          <div
            key={warning.id}
            className={`${bgColor} border ${borderColor} rounded-lg p-4 flex gap-3 animate-slide-down`}
          >
            <Icon className={`${textColor} flex-shrink-0 mt-1`} size={20} />
            <div className="flex-1">
              <p className={`${textColor} font-semibold text-sm`}>{warning.message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(warning.id)}
                className="text-text/40 hover:text-text/60 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
