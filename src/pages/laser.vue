<script setup>
import { usePersistedRef } from './usePersistedRef'
import { useWebsocketStore } from '../plugins/store'
import { ref, onMounted, watchEffect, reactive, onBeforeUnmount} from "vue"
import MessageBar from '@/layouts/components/MessageBar.vue'
import Constants from '@/plugins/constants'

// Websocket connection
const websocketData = useWebsocketStore()

// Messages
let logMessage = ref(null)

// Websocket handling
const {buffer, status} = storeToRefs(websocketData)
watch(buffer, _b => {
  if (_b.length === 0)
  {
    console.log("Empty data")

  } else {
    let data = _b

    // Error 101 MESSAGE_ACQUISITION_DATA
    if (data.error === 101) {

    }
    else // Other error or finish message
    {
      logMessage.value = data
    }
  }
})

// Refresh rate
const refreshRate = ref(2)
const refreshRateIntervals = Constants.REFRESH_RATES

// Refresh data
let intervalId = ref(null)

function startInterval(refreshRate) {
  if (intervalId.value)
    return
  clearInterval(intervalId)
  intervalId.value = setInterval(() => {
    if (websocketData.connected)
    {
      websocketData.sendRequest("get_data", "")
    }
  }, refreshRate * 1000)
}

// Call startInterval with the initial value of refreshRate
startInterval(refreshRate.value)

// Watch for changes to refreshRate and update the interval
watch(refreshRate, newValue => {
  startInterval(newValue)
})

// Reset intervalId when the component is unmounted
onBeforeUnmount(() => {
  clearInterval(intervalId.value)
  intervalId.value = null
})

// Buttons
const buttons = [
  {
    label: "Laser On",
    command: "async_laser_on",
    args: "1500",
  },
  {
    label: "Laser Off",
    command: "async_laser_off",
    args: "",
  },
]

function handleButtonClick(button) {
  websocketData.sendRequest(button.command, button.args)
}
</script>

<template>
  <MessageBar :log-message="logMessage" />
  <VRow class="match-height">
    <VCol
      cols="6"
    >
      <VCard
        title="Control status"
        class="position-relative"
      >
        <VCardText>
          <VRow>
            <VCol>
              <VSelect
                v-model="refreshRate"
                label="Refresh rate (s)"
                :items="refreshRateIntervals"
                :disabled="!websocketData.connected"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              v-for="(value, key) in status"
              :key="key"
              cols="6"
              sm="3"
            >
              <div class="d-flex align-center">
                <div class="me-3">
                  <VAvatar
                    rounded
                    size="42"
                    class="elevation-1"
                  >
                    <VIcon
                      size="24"
                      icon="mdi-abacus"
                    />
                  </VAvatar>
                </div>

                <div class="d-flex flex-column">
                  <span class="text-caption">
                    {{ key }}
                  </span>
                  <span class="text-h6 font-weight-medium">{{ typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value }}</span>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol
      cols="6"
    >
      <VCard
        title="Commands"
        class="position-relative"
      >
        <VRow class="ml-3 mr-3">
          <VCol
            v-for="(button, index) in buttons"
            :key="index"
            cols="3"
          >
            <VBtn
              color="primary"
              block
              @click="handleButtonClick(button)"
            >
              {{ button.label }}
            </VBtn>
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>
