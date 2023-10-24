import { defineStore } from 'pinia'


export const useWebsocketStore = defineStore('websocketData', () => {
  const connected = ref(false)
  const buffer = ref("")
  const wsMessage = ref("")
  let ws = null
  const updateBuffer = value => buffer.value = value
  const connect = () => connected.value = true
  const disconnect = () => connected.value = false
  const sendRequest = (command, arg) => {
    if (!connected.value)
    {
      console.log("not connected")
      wsMessage.value = "Tried to send a request without connection."
      return

    }
    const request = {
      command: command,
      args: String(arg),
    }
    ws.send(JSON.stringify(request))
  }

  async function connectWebsocket(ipAddress) {
    if (!connected.value)
    {
      // Connect
      ws = await new WebSocket("ws://" + ipAddress.value)
        
      ws.onopen = function (event) {
        wsMessage.value = "Connected!"
        connect()
      }
  
      ws.onmessage = event => {
        let data = JSON.parse(event.data)
        if (data.msg != "null") {
          data.msg = JSON.parse(data.msg)
          updateBuffer(data)
        }
      }
  
      ws.onclose = function (event) {
        wsMessage.value = "Disconnected!"
        disconnect()
      }
  
      ws.onerror = function (err) {
        wsMessage.value = "Socket encountered error: "+ err
        disconnect()
        ws.close()
      }
    }
    else
    {
      // Disconnect
      await sendRequest("abort", "")
      await ws.close()
      disconnect()
      wsMessage.value = "Disconnected!"
    }
  }
  
  return {
    connected,
    connect,
    disconnect,
    sendRequest,
    updateBuffer,
    connectWebsocket,
    wsMessage,
  }
})
