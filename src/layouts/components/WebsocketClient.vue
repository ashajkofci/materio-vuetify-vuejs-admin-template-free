<script setup name="WebsocketClient">
import { ref, onMounted, watchEffect } from "vue"
import { usePersistedRef } from '../../pages/usePersistedRef'

const emit = defineEmits(["receivedMessage", "connected", "disconnected", "error"])

const ipAddressRule = [v => (v.match(/:/g) || []).length > 0 || 'Please enter IP address or subdomain'] // wants at least two dots in address

// Connect to websocket
const ipAddress = usePersistedRef("ip", "172.16.11.15:8001")
let websocketForm = ref(null)
let connected = ref(false)
const websocketFormValid = ref(false)
let ws = null
const disableButtons = ref(true)
const wsMessage = ref("")


async function connectWebsocket()
{
  if (!connected.value)
  {
    await websocketForm.value.validate()

    // Connection valid
    if (websocketFormValid.value)
    {
      ws = await new WebSocket("ws://" + ipAddress.value)
      
      ws.onopen = function (event) {
        wsMessage.value = "Connected!"
        connected.value = true
        emit("connected")
        disableButtons.value = false

        //logMessage.value = ""
        //pumpMessage.value = ""
      }

      ws.onmessage = event => {
        let data = JSON.parse(event.data)
        if (data.msg != "null") {
          emit("receivedMessage", data)

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
        connected.value = false
        emit("disconnected")

        //acquisitionStarted.value = false
      }

      ws.onerror = function (err) {
        wsMessage.value = "Socket encountered error: "+ err
        connected.value = false
        emit("disconnected", err)
        ws.close()
      }

    }
  }
  else
  {
    // Disconnect
    await sendRequest("abort", "")
    await ws.close()
    connected.value = false
    wsMessage.value = "Disconnected!"
    emit("disconnected")

    //acquisitionStarted.value = false
  }
}

// Send WS request
function sendRequest(command, arg) {
  if (!connected.value)
  {
    console.log("not connected")
    wsMessage.value = "Tried to send a request without connection."
    disableButtons.value = false
    emit("error", "Tried to send a request without connection.")
    
    return
  }
  const request = {
    command: command,
    args: String(arg),
  }
  ws.send(JSON.stringify(request))
}

defineExpose({
  sendRequest,
  connected,
})
</script>

<template>
  <VForm
    ref="websocketForm"
    v-model="websocketFormValid"
    lazy-validation
  >
    <VRow>
      <VCol
        md="6"
        cols="12"
      >
        <VTextField
          v-model="ipAddress"
          label="IP Address"
          :rules="ipAddressRule"
          :disabled="disableButtons && connected"
        />
      </VCol>

      <VCol
        md="3"
        cols="3"
        class="mt-1"
      >
        <VBtn
          @click="connectWebsocket"
        >
          {{ connected ? "Close" : "Connect" }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
