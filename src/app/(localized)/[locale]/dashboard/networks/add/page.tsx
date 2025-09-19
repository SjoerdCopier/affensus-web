import { Metadata } from 'next';
import { DashboardWrapper } from '@/components/dashboard';
import AddNetworkContent from '@/components/dashboard/add-network';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Add Network - Affensus',
    description: 'Add a new network to your project',
  };
}

export default async function AddNetworkPage({ params }: Props) {
  const { locale } = await params;
  return (
    <DashboardWrapper locale={locale}>
      <AddNetworkContent locale={locale} />
    </DashboardWrapper>
  );
}
