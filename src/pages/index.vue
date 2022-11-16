<script setup>
import { ref, onMounted } from "vue"
import { VueEcharts } from 'vue3-echarts'

// Constants
const availableChannels = ["SSC", "FL1", "FL2", "FSC"]
const integrationTimes = [1, 5, 10, 15, 20, 30]

// Form fields
const ipAddress = ref("127.0.0.1:8001")
const eventBuffer = ref(10)
const triggerChannel = ref("FL1")
const xAxis = ref("FL1")
const yAxis = ref("FL2")
const beadsType = ref("beads")
const statsIntegrationTime = ref(integrationTimes[0])
const operator = ref("")
const optSN = ref("")
const tiaSN = ref("")
const converterSN = ref("")
const buttonReset = ref(null)
const buttonPrime = ref(null)
const buttonFlush = ref(null)
const buttonPump = ref(null)
const buttomPump2 = ref(null)
const pumpMessage = ref("")
const wsMessage = ref("")
const chart = ref(null)


// Plot data

let chartChannels = 
{
  "FL1" : {
    "min": 2,
    "max": 8,
  },
  "FL2": {
    "min": 1.5,
    "max": 8,
  },
  "SSC": {
    "min": 2,
    "max": 8,
  },
  "FSC": {
    "min": 2,
    "max": 8,
  },
}

function computeChartOptions() {
  return {
    xAxis: {
      name:xAxis.value,
      min: chartChannels[xAxis.value]["min"],
      max: chartChannels[xAxis.value]["max"],
    },
    yAxis: {
      name:yAxis.value,
      min: chartChannels[yAxis.value]["min"],
      max: chartChannels[yAxis.value]["max"],
    },
    tooltip: {},
    toolbox: {
      right: 20,
      feature: {
        dataZoom: {},
      },
    },
    animationEasingUpdate: 'cubicInOut',
    animationDurationUpdate: 1000,
    dataZoom: [
      {
        type: 'inside',
      },
      {
        type: 'slider',
        showDataShadow: true,
        handleIcon:
          'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
      },
      {
        type: 'inside',
        orient: 'vertical',
      },
      {
        type: 'slider',
        orient: 'vertical',
        showDataShadow: true,
        handleIcon:
          'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
      },
    ],
    series: [
      {
        symbolSize: 4,
        itemStyle: {
          color: '#128de3',
          opacity: 0.4,
        },
        blendMode: 'lighter',
        large: true,
        largeThreshold: 500,
        data: [
          [8.07, 6.95],
          [9.05, 8.81],
          [9.15, 7.2],
          [3.03, 4.23],
          [2.02, 4.47],
          [1.05, 3.33],
          [4.05, 4.96],
          [6.03, 7.24],
          [7.08, 5.82],
          [5.02, 5.68],
        ],
        type: 'scatter',
      },
    ]}
}

function refreshChart()
{
  chart.value.refreshOption(computeChartOptions())
}

onMounted( () => {

})

// Form rules
const requiredRules = [v => !!v || 'This field is required']
const ipAddressRule = [v => (v.match(/:/g) || []).length > 0 || 'Please enter IP address or subdomain'] // wants at least two dots in address

// Connect to websocket
let websocketForm = ref(null)
let connected = ref(false)
const websocketFormValid = ref(false)
let ws = null
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
      }

      ws.onmessage = event => {
        let data = JSON.parse(event.data)
        if (data.msg != "null") {
          data.msg = JSON.parse(data.msg)
          if (data.error === 101) {
            // Statistics
            events = data.msg[0]
            debug_data = data.msg[4]
          }
        }
      }

      ws.onclose = function (event) {
        wsMessage.value = "Disconnected!"
        connected.value = false
      }

      ws.onerror = function (err) {
        wsMessage.value = "Socket encountered error: "+ err
        connected.value = false
        ws.close()
      }

    }
  }
  else
  {
    // Disconnect
    ws.close()
    connected.value = false
  }
}

// Start acquisition
let startAcquisitionButton = ref(null)
var acquisitionStarted = ref(false)
function startStopAcquisition()
{
  // Stop acquisition
  if (acquisitionStarted.value)
  {
    acquisitionStarted.value = false
  } else {
    // Start acquisition
    acquisitionStarted.value = true
  }
}

// Pump control
function launchPump(type)
{
  pumpMessage.value = "Launching "+ type + "..."
}

// Save acquisition
let saveForm = ref(null)
const launchSaveValid = ref(false)
function launchSave()
{
  saveForm.value.validate()
}
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="8"
      md="8"
      sm="12"
    >
      <VCard
        title="Live view"
        class="position-relative"
      >
        <VCardText>
          <VRow>
            <VCol>
              <VueEcharts
                ref="chart"
                class="mx-auto"
                :option="computeChartOptions()"
                style="height:700px; width: 700px"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <VCol
      cols="12"
      md="4"
    >
      <VRow class="match-height">
        <VCol
          cols="12"
          md="12"
        >
          <VCard
            title="Parameters"
            class="position-relative"
          >
            <VCardText>
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
                    />
                  </VCol>

                  <VCol
                    md="3"
                    cols="3"
                    class="mt-1"
                  >
                    <VBtn @click="connectWebsocket">
                      {{ connected ? "Disconnect" : "Connect" }}
                    </VBtn>
                  </VCol>
                  <VCol
                    md="3"
                    cols="3"
                    class="mt-1"
                  >
                    <VBtn
                      ref="startAcquisitionButton"
                      @click="startStopAcquisition"
                    >
                      {{ acquisitionStarted ? "Stop":"Start" }}
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
              <VRow>
                <VCol>
                  {{ wsMessage }}
                </VCol>
              </VRow>
              <VForm>
                <VRow>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VSelect
                      v-model="eventBuffer"
                      label="Event buffer"
                      suffix="[s]"
                      :items="integrationTimes"
                    />
                  </VCol>

                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VSelect
                      v-model="triggerChannel"
                      label="Trigger channel"
                      :items="availableChannels"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VSelect
                      v-model="xAxis"
                      label="X-axis"
                      :items="availableChannels"
                      @update:modelValue="refreshChart"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VSelect
                      v-model="yAxis"
                      label="Y-axis"
                      :items="availableChannels"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <VRadioGroup
                      v-model="beadsType"
                      inline
                    >
                      <VRadio
                        label="Nanobeads"
                        value="beads"
                      />
                      <VRadio
                        label="3um beads"
                        value="3um"
                      />
                    </VRadioGroup>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="12"
        >
          <VCard
            title="Statistics"
            class="position-relative"
          >
            <VCardText>
              <VRow>
                <VCol
                  md="12"
                  cols="12"
                >
                  <VSelect
                    v-model="statsIntegrationTime"
                    label="Integration time"
                    :items="integrationTimes"
                    suffix="[s]"
                  />
                </VCol>
              </VRow>
              <VRow>
                <VCol>
                  <VTable density="compact">
                    <thead>
                      <tr>
                        <th class="text-uppercase">
                          Channel
                        </th>
                        <th class="text-center text-uppercase">
                          Median
                        </th>
                        <th class="text-center text-uppercase">
                          rCV [%]
                        </th>
                        <th class="text-center text-uppercase">
                          Offset
                        </th>
                        <th class="text-center text-uppercase">
                          Valid
                        </th>                        
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          SSC
                        </td>
                        <td class="text-center">
                          110
                        </td>
                        <td class="text-center">
                          45
                        </td>
                        <td class="text-center">
                          -55.
                        </td>
                        <td class="text-center">
                          🐸
                        </td>
                      </tr>
                      <tr>
                        <td>
                          FL1
                        </td>
                        <td class="text-center">
                          110
                        </td>
                        <td class="text-center">
                          45
                        </td>
                        <td class="text-center">
                          -55.
                        </td>
                        <td class="text-center">
                          🐙
                        </td>
                      </tr>    
                      <tr>
                        <td>
                          FL2
                        </td>
                        <td class="text-center">
                          110
                        </td>
                        <td class="text-center">
                          45
                        </td>
                        <td class="text-center">
                          -55.
                        </td>
                        <td class="text-center">
                          🐸
                        </td>
                      </tr>    
                      <tr>
                        <td>
                          FSC
                        </td>
                        <td class="text-center">
                          110
                        </td>
                        <td class="text-center">
                          45
                        </td>
                        <td class="text-center">
                          -55.
                        </td>
                        <td class="text-center">
                          🐸
                        </td>
                      </tr>                                  
                    </tbody>
                  </VTable>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="12"
        >
          <VCard
            title="Pump control"
            class="position-relative"
          >
            <VCardText>
              <VRow>
                <VCol
                  cols="2"
                >
                  <VBtn
                    ref="buttonReset"
                    size="small"
                    @click="launchPump('reset')"
                  >
                    Reset
                  </VBtn>
                </VCol>
                <VCol
                  cols="2"
                >
                  <VBtn
                    ref="buttonPrime"
                    size="small"
                    @click="launchPump('prime')"
                  >
                    Prime
                  </VBtn>
                </VCol>
                <VCol
                  cols="2"
                >
                  <VBtn
                    ref="buttonFlush"
                    size="small"
                    @click="launchPump('flush')"
                  >
                    Flush
                  </VBtn>
                </VCol>
                <VCol
                  cols="3"
                >
                  <VBtn
                    ref="buttonPump"
                    size="small"
                    @click="launchPump('pump')"
                  >
                    Pump 2mn
                  </VBtn>
                </VCol>
                <VCol
                  cols="3"
                >
                  <VBtn
                    ref="buttonPump2"
                    size="small"
                    @click="launchPump('pump2')"
                  >
                    Pump 4mn
                  </VBtn>
                </VCol>
              </VRow>
              <VRow>
                <VCol>
                  {{ pumpMessage }}
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="12"
        >
          <VCard
            title="Save acquisition"
            class="position-relative"
          >
            <VCardText>
              <VForm
                ref="saveForm"
                v-model="launchSaveValid"
                lazy-validation
              >
                <VRow>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VTextField
                      v-model="operator"
                      label="Operator"
                      :rules="requiredRules"
                    />
                  </VCol>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VTextField
                      v-model="optSN"
                      label="OPT SN"
                      :rules="requiredRules"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VTextField
                      v-model="tiaSN"
                      label="TIA SN"
                      :rules="requiredRules"
                    />
                  </VCol>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VTextField
                      v-model="converterSN"
                      label="Converter SN"
                      :rules="requiredRules"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <VBtn @click="launchSave">
                      Launch & Save
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCard>
        </VCol>        
      </VRow>
    </VCol>
  </VRow>
</template>
