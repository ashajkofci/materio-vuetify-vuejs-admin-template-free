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
    console.log(data)
    if (data.error === Constants.MESSAGE_ACQUISITION_DATA) {

    }
    else if (data.error === Constants.MESSAGE_POWER_CALIBRATION_DATA) {
      calibration_finished.value = true
      current_for_60mw.value = data.msg.current_for_60mw
      plot_data.value = data.msg.plot
      power_vs_current.value = data.msg.power_vs_current
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

// Power calibration
const calibration_finished = ref(false)
const current_for_60mw = ref(0)
const plot_data = ref("")
let plot_image = computed(() => {
  return "data:image/png;base64," + plot_data.value
})
const power_vs_current = ref(null)

function launch_calibration() {
  websocketData.sendRequest("async_laser_sweep", "")
}

function save_calibration() {
  websocketData.sendRequest("save_calibration_current", "")
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
  <VRow>
    <VCol
      cols="6"
    >
      <VCard
        title="Power calibration"
        class="match-height"
      >
        <VRow class="ml-3 mr-3">
          <VCol>
            <VBtn
              color="primary"
              block
              @click="launch_calibration"
            >
              Launch calibration
            </VBtn>
          </VCol>
          <VCol>
            <VBtn
              color="primary"
              block
              :disabled="!calibration_finished"
              @click="save_calibration"
            >
              Save calibration <div
                v-if="calibration_finished"
                class="ml-1"
              >
                {{ current_for_60mw.toFixed(1) }} mA
              </div>
            </VBtn>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <VImg
              v-if="plot_data.length > 0"
              :src="plot_image"
            />
          </VCol>
        </VRow>
      </VCard>
    </VCol>
  </VRow>
</template>
