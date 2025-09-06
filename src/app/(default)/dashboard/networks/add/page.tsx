import { Metadata } from 'next';
import { DashboardWrapper } from '@/components/dashboard';
import AddNetworkContent from '@/components/dashboard/add-network';

export const metadata: Metadata = {
  title: 'Add Network - Affensus',
  description: 'Add a new network to your project',
};

export default function AddNetworkPage() {
  return (
    <DashboardWrapper>
      <AddNetworkContent />
    </DashboardWrapper>
  );
}
