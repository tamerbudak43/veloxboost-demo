import { ArbitrageTerminal } from '@/components/velox/arbitrage/arbitrage-terminal'
import { getArbitrageTerminalData } from '@/lib/services/arbitrage'

export const metadata = {
  title: 'Arbitraj — VELOX',
}

export default async function ArbitrajPage() {
  const data = await getArbitrageTerminalData()
  return <ArbitrageTerminal data={data} />
}
