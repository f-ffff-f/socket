interface ISocketConfig {
  websocketHost: string
  parallelTrCodes: string[]
  errorCodes: number[]
  getAccount: () => string
  getAuthToken: () => string
  removeSuspendedTrCode: (trCode: number) => void
  addSuspendedTrCode: (trCode: number) => void
  onError: (error: any) => void
}

let globalConfig: ISocketConfig | null = null

export function initSocketConfig(config: ISocketConfig) {
  globalConfig = config
}

export function getSocketConfig(): ISocketConfig {
  if (!globalConfig) {
    throw new Error(
      'Socket is not initialized. Call initSocketConfig(...) first.'
    )
  }
  return globalConfig
}
