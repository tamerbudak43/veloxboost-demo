import { CareerView } from '@/components/velox/career/career-view'
import { getCareerData } from '@/app/actions/network'

export const metadata = {
  title: 'Kariyer Gelişim Planı — VELOX',
}

export default async function CareerPage() {
  const data = await getCareerData()
  return <CareerView {...data} />
}
