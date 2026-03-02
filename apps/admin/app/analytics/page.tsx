'use client';

import { AnalyticsDashboard, withAuth } from '@republik/ui';

const ProtectedAnalytics = withAuth(AnalyticsDashboard, 'ADMIN');

export default ProtectedAnalytics;
export const dynamic = 'force-dynamic';
