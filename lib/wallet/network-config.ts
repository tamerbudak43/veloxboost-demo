export const walletNetworkIds = ['TON', 'BEP20', 'POLYGON', 'ERC20', 'TRC20'] as const

export type WalletNetworkId = (typeof walletNetworkIds)[number]

export type WalletNetworkConfig = {
  id: WalletNetworkId
  label: string
  chainName: string
  depositAddress: string | null
  depositMemo: string | null
  memoRequired: boolean
  minimumDeposit: number
  addressPlaceholder: string
  configured: boolean
}

type NetworkDefinition = Omit<WalletNetworkConfig, 'depositAddress' | 'depositMemo' | 'minimumDeposit' | 'configured'> & {
  addressEnvironmentKey: string
  memoEnvironmentKey?: string
  minimumEnvironmentKey: string
}

const definitions: NetworkDefinition[] = [
  {
    id: 'TON',
    label: 'USDT TON (The Open Network)',
    chainName: 'The Open Network',
    memoRequired: true,
    addressPlaceholder: 'UQ… veya EQ… ile başlayan TON adresi',
    addressEnvironmentKey: 'VELOX_USDT_TON_ADDRESS',
    memoEnvironmentKey: 'VELOX_USDT_TON_MEMO',
    minimumEnvironmentKey: 'VELOX_USDT_TON_MIN_DEPOSIT',
  },
  {
    id: 'BEP20',
    label: 'USDT BEP20 (BNB Smart Chain)',
    chainName: 'BNB Smart Chain',
    memoRequired: false,
    addressPlaceholder: '0x… ile başlayan BEP20 adresi',
    addressEnvironmentKey: 'VELOX_USDT_BEP20_ADDRESS',
    minimumEnvironmentKey: 'VELOX_USDT_BEP20_MIN_DEPOSIT',
  },
  {
    id: 'POLYGON',
    label: 'USDT Polygon',
    chainName: 'Polygon',
    memoRequired: false,
    addressPlaceholder: '0x… ile başlayan Polygon adresi',
    addressEnvironmentKey: 'VELOX_USDT_POLYGON_ADDRESS',
    minimumEnvironmentKey: 'VELOX_USDT_POLYGON_MIN_DEPOSIT',
  },
  {
    id: 'ERC20',
    label: 'USDT Ethereum',
    chainName: 'Ethereum',
    memoRequired: false,
    addressPlaceholder: '0x… ile başlayan Ethereum adresi',
    addressEnvironmentKey: 'VELOX_USDT_ERC20_ADDRESS',
    minimumEnvironmentKey: 'VELOX_USDT_ERC20_MIN_DEPOSIT',
  },
  {
    id: 'TRC20',
    label: 'USDT Tron (TRC20)',
    chainName: 'TRON',
    memoRequired: false,
    addressPlaceholder: 'T ile başlayan TRC20 adresi',
    addressEnvironmentKey: 'VELOX_USDT_TRC20_ADDRESS',
    minimumEnvironmentKey: 'VELOX_USDT_TRC20_MIN_DEPOSIT',
  },
]

function cleanEnvironmentValue(key: string) {
  const value = process.env[key]?.trim()
  return value || null
}

function positiveAmount(value: string | null, fallback: number) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : fallback
}

export function getWalletNetworks(): WalletNetworkConfig[] {
  const globalMinimum = positiveAmount(cleanEnvironmentValue('VELOX_USDT_MIN_DEPOSIT'), 100)
  return definitions.map((definition) => {
    const depositAddress = cleanEnvironmentValue(definition.addressEnvironmentKey)
    const depositMemo = definition.memoEnvironmentKey
      ? cleanEnvironmentValue(definition.memoEnvironmentKey)
      : null
    const minimumDeposit = positiveAmount(
      cleanEnvironmentValue(definition.minimumEnvironmentKey),
      globalMinimum,
    )
    return {
      id: definition.id,
      label: definition.label,
      chainName: definition.chainName,
      depositAddress,
      depositMemo,
      memoRequired: definition.memoRequired,
      minimumDeposit,
      addressPlaceholder: definition.addressPlaceholder,
      configured: Boolean(depositAddress && (!definition.memoRequired || depositMemo)),
    }
  }).filter((network) => network.configured)
}

export function getWalletNetwork(networkId: string) {
  return getWalletNetworks().find((network) => network.id === networkId) ?? null
}
