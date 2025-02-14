import { RealTimeManager } from '@/lib/RealTimeManager'
import { RequestBase, ResponseBaseHandler } from '@/types'
import { QueueManager } from '@/lib/QueueManager'
import { isSocketReady, preprocessingResponseCode } from '@/lib/utils'
import { getSocketConfig } from '@/config'
export class SocketClient {
  socket: WebSocket | null = null

  private realTimeManager: RealTimeManager
  private queueManager: QueueManager

  private readonly onMessage: ResponseBaseHandler

  constructor({ onMessage }: { onMessage: ResponseBaseHandler }) {
    this.realTimeManager = new RealTimeManager(onMessage)
    this.queueManager = new QueueManager(this)

    this.onMessage = onMessage

    // this.handleCheck = handleCheck

    this.connect()
  }

  private connect() {
    const websocketHost = getSocketConfig().websocketHost
    this.socket = new WebSocket(websocketHost)

    this.handleSocketOpen()
    this.handleSocketMessage()
    this.handleSocketError()
    this.handleSocketClose()
  }

  private handleSocketOpen() {
    this.socket!.addEventListener('open', () => {
      this.queueManager.processQueues()
    })
  }

  private handleSocketMessage() {
    this.socket?.addEventListener('message', payload => {
      const res = preprocessingResponseCode(payload)

      const isRealTime = this.realTimeManager.isRealTime(res.tr_code)
      const isParallelTask = this.queueManager.isParallelTask(res.tr_code)

      if (isRealTime) {
        this.realTimeManager.actionWithThrottle(res)
      } else if (isParallelTask) {
        this.onMessage(res)
      } else {
        this.onMessage(res)
        this.queueManager.isSequentialQueuePending = false
        this.queueManager.processSequentialQueue()
      }
    })
  }

  private handleSocketError() {
    this.socket!.addEventListener('error', () => {
      if (this.socket) {
        this.socket.close()
      }
    })
  }

  private handleSocketClose() {
    this.socket?.addEventListener('close', () => {
      this.socket = null

      setTimeout(() => {
        console.log('websocket try reconnect in 5 seconds...')
        // this.handleCheck()

        this.connect()
      }, 5000)
    })
  }

  public enqueueMessage(data: RequestBase) {
    const isRealTime = this.realTimeManager.isRealTime(data.tr_code as number)
    const isParallelTask = this.queueManager.isParallelTask(
      data.tr_code as number
    )

    const isSequentialTask = !isRealTime && !isParallelTask

    this.queueManager.enqueueTaskByType(data, isSequentialTask)

    const socketReady = isSocketReady(this.socket)

    if (socketReady) {
      this.queueManager.processQueues()
    }
  }
}
