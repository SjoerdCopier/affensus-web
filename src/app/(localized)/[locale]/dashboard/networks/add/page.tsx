import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardWrapper } from '@/components/dashboard';
import AddNetworkContent from '@/components/dashboard/add-network';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
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
