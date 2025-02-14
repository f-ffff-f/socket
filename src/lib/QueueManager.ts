import { SocketClient } from '@/lib/SocketClient'
import { getSocketConfig } from '@/config'
import { RequestBase } from '@/types'

export class QueueManager {
  isSequentialQueuePending = false

  private socketClient: SocketClient
  private parallelQueue: RequestBase[] = []
  private sequentialQueue: RequestBase[] = []
  private readonly parallelTrCodes = getSocketConfig().parallelTrCodes

  constructor(socketClient: SocketClient) {
    this.socketClient = socketClient
  }

  enqueueTaskByType(data: RequestBase, isSequentialTask: boolean) {
    if (isSequentialTask) {
      this.sequentialQueue.push(data)
    } else {
      this.parallelQueue.push(data)
    }
  }

  processQueues() {
    this.processSequentialQueue()
    this.processParallelQueue()
  }

  processParallelQueue() {
    this.parallelQueue.forEach(request => {
      this.sendRequest(request)
    })

    this.parallelQueue = []
  }

  processSequentialQueue() {
    if (this.sequentialQueue.length > 0 && !this.isSequentialQueuePending) {
      const request = this.sequentialQueue.shift()!
      this.sendRequest(request)
      this.isSequentialQueuePending = true
    }
  }

  isParallelTask = (trCode: number | string) => {
    if (typeof trCode === 'string') {
      trCode = Number(trCode)
    }

    return this.parallelTrCodes.includes(trCode as any)
  }

  private sendRequest(request: RequestBase) {
    const data = JSON.stringify(request)
    this.socketClient.socket?.send(data)
  }
}
