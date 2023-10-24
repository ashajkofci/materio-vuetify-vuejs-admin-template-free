<script setup name="WebsocketClient">
import { ref, onMounted, watchEffect, reactive} from "vue"
import { usePersistedRef } from '../../pages/usePersistedRef'
import { defineStore } from 'pinia'

// Shared with siblings
const useWebsocketStore = defineStore('websocketData', () => {
  const connected = ref(false)
  const disableButtons = ref(true)
  const connect = () => connected.value = true
  const disconnect = () => connected.value = false
  const disable = () => disableButtons.value = true
  const enable = () => disableButtons.value = false
  const sendRequest = (command, arg) => {
    if (!connected.value)
    {
      console.log("not connected")
      wsMessage.value = "Tried to send a request without connection."
      disableButtons.value = false

      return
    }
    const request = {
      command: command,
      args: String(arg),
    }
    ws.send(JSON.stringify(request))
  }
  
  return {
    connected,
    disableButtons,
    connect,
    disconnect,
    disable,
    enable,
    sendRequest,
  }
})

const wbData = useWebsocketStore()

const ipAddressRule = [v => (v.match(/:/g) || []).length > 0 || 'Please enter IP address or subdomain'] // wants at least two dots in address

// Connect to websocket
const ipAddress = usePersistedRef("ip", "172.16.11.15:8001")
let websocketForm = ref(null)
const websocketFormValid = ref(false)
let ws = null
const wsMessage = ref("")

async function connectWebsocket()
{
  if (!wbData.connected)
  {
    await websocketForm.value.validate()

    // Connection valid
    if (websocketFormValid.value)
    {
      ws = await new WebSocket("ws://" + ipAddress.value)
      
      ws.onopen = function (event) {
        wsMessage.value = "Connected!"
        wbData.connect()
        wbData.enable()
      }

      ws.onmessage = event => {
        let data = JSON.parse(event.data)
        if (data.msg != "null") {

          /*
          data.msg = JSON.parse(data.msg)
          if (data.error === 101) {
            console.log(data.msg)
            var events = data.msg[0]
            gates_fl2 = data.msg[1].fit_default.gates["fit-FL2"].points
            gates_fl2_2 = data.msg[1].fit_default.gates["fit-FL1-SSC-1"].points
            gates_ssc = data.msg[1].fit_default.gates["fit-FL1-SSC-2"].points

            statsData.value = data.msg[2]
            events.forEach((item, index, array) => {
              log_events[0].push(item[0])
              log_events[1].push(item[1] > 0 ? Math.log10(item[1]) : 0)
              log_events[2].push(item[2] > 0 ? Math.log10(item[2]) : 0)
              log_events[3].push(item[3] > 0 ? Math.log10(item[3]) : 0)
              log_events[4].push(item[4] > 0 ? Math.log10(item[4]) : 0)
            })
            var last_timestamp = Math.max(...log_events[0])

            // Filter old events
            var first_timestamp = last_timestamp - 200000 * eventBuffer.value
            var timestamps_to_remove = Array()
            log_events[0].forEach((item, index, array) => {
              if (item < first_timestamp)
              {
                timestamps_to_remove.push(index)
              }
            })
            for (var i = timestamps_to_remove.length -1; i >= 0; i--)
            {
              log_events[0].splice(timestamps_to_remove[i], 1)
              log_events[1].splice(timestamps_to_remove[i], 1)
              log_events[2].splice(timestamps_to_remove[i], 1)
              log_events[3].splice(timestamps_to_remove[i], 1)
              log_events[4].splice(timestamps_to_remove[i], 1)
            }

            refreshChart()
          }
          else if(data.error == 102)
          {
            disableButtons.value = false
            logMessage.value = data
          }
          else {
            logMessage.value = data
          }
          */
        }
      }

      ws.onclose = function (event) {
        wsMessage.value = "Disconnected!"
        wbData.disconnect()
      }

      ws.onerror = function (err) {
        wsMessage.value = "Socket encountered error: "+ err
        wbData.disconnect()
        ws.close()
      }

    }
  }
  else
  {
    // Disconnect
    await wbData.sendRequest("abort", "")
    await ws.close()
    wbData.disconnect()
    wsMessage.value = "Disconnected!"
  }
}
</script>

<template>
  <VForm
    ref="websocketForm"
    v-model="websocketFormValid"
    lazy-validation
  >
    <VRow>
      <VCol
        cols="12"
      >
        <VTextField
          v-model="ipAddress"
          label="IP Address"
          :rules="ipAddressRule"
          :disabled="wbData.disabled || wbData.connected"
        />
      </VCol>
    </VRow>
    <VRow>
      <VCol
        cols="6"
        class="mt-1 mx-auto"
      >
        <VBtn
          @click="connectWebsocket"
        >
          {{ wbData.connected ? "Close" : "Connect" }}
        </VBtn>
      </VCol>
      <VCol
        cols="6"
        class="align-center mt-3 justify-center"
      >
        {{ wsMessage }}
      </VCol>
    </VRow>
  </VForm>
</template>
