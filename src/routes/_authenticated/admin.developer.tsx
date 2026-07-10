import { createFileRoute } from '@tanstack/react-router';
import { DeveloperDashboard } from '@/components/admin/developer/DeveloperDashboard';
import { PinGuard } from '@/components/PinGuard';

export const Route = createFileRoute('/_authenticated/admin/developer')({
  component: () => (
    <PinGuard title="Akses Developer Dashboard" pinType="developer">
      <DeveloperDashboard />
    </PinGuard>
  ),
  head: () => ({ meta: [{ title: 'Developer Dashboard — LNR Admin' }, { name: 'robots', content: 'noindex' }] }),
});
