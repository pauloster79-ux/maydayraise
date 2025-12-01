'use client';

import { ApplicationsTable } from './applications-table';
import { useState, useEffect } from 'react';

type Application = {
  id: string;
  paymentReference: string | null;
  amount: number;
  status: string;
  isPaid: boolean;
  shareholder: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch('/api/applications');
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const handleStartReconciliation = () => {
    setIsReconciling(true);
  };

  const handleReconciliationComplete = async () => {
    setIsReconciling(false);
    // Refresh data after reconciliation
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to refresh applications:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Investors</h2>
        <button
          onClick={handleStartReconciliation}
          disabled={isReconciling}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReconciling ? 'Reconciling...' : 'Manual Reconciliation'}
        </button>
      </div>

      <ApplicationsTable
        initialApplications={applications}
        isReconciling={isReconciling}
        onReconciliationComplete={handleReconciliationComplete}
      />
    </div>
  );
}
