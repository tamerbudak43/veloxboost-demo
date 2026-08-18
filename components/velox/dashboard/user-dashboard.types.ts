import type { getUserDashboardData } from '@/app/actions/network'

export type AwaitedReturn = Awaited<ReturnType<typeof getUserDashboardData>>
