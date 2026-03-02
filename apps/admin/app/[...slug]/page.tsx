'use client';

import { AdminDashboard, withAuth } from '@republik/ui';

const ProtectedDashboard = withAuth(AdminDashboard, 'ADMIN');

export default ProtectedDashboard;
export const dynamic = 'force-dynamic';
