<script setup>
import { ref, onMounted } from "vue"
import { VueEcharts } from 'vue3-echarts'
import * as echarts from 'echarts'

// Root template
const root = ref(null)

// Constants
const availableChannels = ["SSC", "FL1", "FL2", "FSC"]
const channelIndexes = {"SSC":0, "FL1":1, "FL2":2, "FSC":3}
const integrationTimes = [1, 5, 10, 15, 20, 30, 60, 120]

// Form fields
const ipAddress = ref("172.16.11.61:8001")
const eventBuffer = ref(20)
const triggerChannel = ref("FL1")
const xAxis = ref("FL1")
const yAxis = ref("FL2")
const beadsType = ref("beads")
const statsIntegrationTime = ref(integrationTimes[5])
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
const logMessage = ref("")
const chart = ref(null)
const disableButtons = ref(true)

// Stat data
const statsData = ref(null)

// Plot data
var log_events = [Array(), Array(), Array(), Array(), Array()]
var gates = null

let dacSetpoints = 
{
  "3um": 250,
  "beads": 1500,
}
var dac_setpoint = dacSetpoints['beads']

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

function computeChartOptions(data) {
  return {
    xAxis: {
      name:xAxis.value,
      min: chartChannels[xAxis.value]["min"],
      max: chartChannels[xAxis.value]["max"],
      nameLocation: "center",
      nameTextStyle: {fontSize:14, padding:20},
    },
    yAxis: {
      name:yAxis.value,
      min: chartChannels[yAxis.value]["min"],
      max: chartChannels[yAxis.value]["max"],
      nameLocation: "center",
      nameTextStyle: {fontSize:14, padding:20},
    },
    tooltip: {
      show:false,
    },
    toolbox: {
      right: 20,
      feature: {
        saveAsImage: {},
      },
    },
    animation:false,
    grid: { bottom: 100 },
    series: [
      {
        symbolSize: 4,
        itemStyle: {
          color: '#128de3',
          opacity: 0.5,
        },
        progressive:0,
        blendMode: 'lighter',
        type: 'scatter',
      },
    ]}
}

function renderGate(params, api) {
  if (xAxis.value != "FL1" || yAxis.value != "FL2")
  {
    return
  }

  if (params.context.rendered) {
    return
  }

  params.context.rendered = true

  let points = []
  for (let i = 0; i < gates.length; i++) {
    points.push(api.coord(gates[i]))
  }


  return {
    type: 'polygon',
    shape: {
      points: echarts.graphic.clipPointsByRect(points, {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height,
      }),
    },
    style: api.style({
      fill: "transparent",
      stroke: "red",
    }),
  }
}

function refreshChart()
{
  var data = log_events[channelIndexes[xAxis.value]+1].map((e, i) => [e, log_events[channelIndexes[yAxis.value]+1][i]])
  chart.value.setOption(
    {
      xAxis: {
        name:xAxis.value,
        min: chartChannels[xAxis.value]["min"],
        max: chartChannels[xAxis.value]["max"],
        nameLocation: "center",
        nameTextStyle: {fontSize:14, padding:20},
      },
      yAxis: {
        name:yAxis.value,
        min: chartChannels[yAxis.value]["min"],
        max: chartChannels[yAxis.value]["max"],
        nameLocation: "center",
        nameTextStyle: {fontSize:14, padding:20},
      },
      series: [
        {
          data: data,
        },
        {
          type: 'custom',
          renderItem: renderGate,
          data: gates,
        },
      ],
    },
  )
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
        disableButtons.value = false
        logMessage.value = ""
        pumpMessage.value = ""
      }

      ws.onmessage = event => {
        let data = JSON.parse(event.data)
        if (data.msg != "null") {
          data.msg = JSON.parse(data.msg)
          if (data.error === 101) {
            console.log(data.msg)
            var events = data.msg[0]
            gates = data.msg[1].fit_default.gates["fit-FL2"].points
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
          }
          else {
            logMessage.value = data
          }
        }
      }

      ws.onclose = function (event) {
        wsMessage.value = "Disconnected!"
        connected.value = false
        acquisitionStarted.value = false
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
    await sendRequest("abort", "")
    await ws.close()
    connected.value = false
    wsMessage.value = "Disconnected!"
    acquisitionStarted.value = false
  }
}

// Send WS request
function sendRequest(command, arg) {
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


// Start acquisition
let startAcquisitionButton = ref(null)
var acquisitionStarted = ref(false)
function startStopAcquisition()
{
  // Stop acquisition
  if (acquisitionStarted.value)
  {
    acquisitionStarted.value = false
    sendRequest("abort", "")
  } else {
    // Start acquisition
    acquisitionStarted.value = true
    var dac_setpoint = 1500
    if (beadsType.value == "3um")
    {
      dac_setpoint = 250
    }
    log_events = [Array(), Array(), Array(), Array(), Array()]
    sendRequest("acquisition_gate", "600,"+dac_setpoint+","+statsIntegrationTime.value)
  }
}

// Laser control
function changeSetpoint()
{
  if (beadsType.value == "3um")
  {
    dac_setpoint = dacSetpoints[beadsType.value]
  }
  sendRequest("async_setpoint", dac_setpoint)
}

// Pump control
function launchPump(type)
{
  pumpMessage.value = "Launching "+ type + "..."
  if (type == "reset" && acquisitionStarted.value)
  {
    startStopAcquisition()
  }
  sendRequest("async_pump", type)
}

// Save acquisition
let saveForm = ref(null)
const launchSaveValid = ref(false)
function launchSave()
{
  saveForm.value.validate()
  if (launchSaveValid.value)
  {  
    disableButtons.value = true
    sendRequest("save_acquisition", dac_setpoint+","+operator.value+","+optSN.value+","+tiaSN.value+","+converterSN.value)
  }

}
</script>

<template>
  <div ref="root">
    <VRow>
      <VCol>
        <VAlert
          v-if="logMessage && logMessage.error != 10"
          border="top"
          color="error"
        >
          <VAlertTitle class="mb-1">
            Error {{ logMessage.error }}
          </VAlertTitle>
          {{ logMessage.msg }}
        </VAlert>
        <VAlert
          v-if="logMessage && logMessage.error == 10"
          border="top"
          color="success"
        >
          <VAlertTitle class="mb-1">
            {{ logMessage.msg }}
          </VAlertTitle>
          Command: {{ logMessage.command }} / Args: {{ logMessage.args }}
        </VAlert>
      </VCol>
    </VRow>
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
                  :option="computeChartOptions(log_events)"
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
                    <VCol
                      md="3"
                      cols="3"
                      class="mt-1"
                    >
                      <VBtn
                        ref="startAcquisitionButton"
                        :disabled="disableButtons"
                        @click="startStopAcquisition"
                      >
                        {{ acquisitionStarted ? "Stop":"Start" }}
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>

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
                        :disabled="disableButtons"
                      />
                    </VCol>

                    <VCol
                      md="6"
                      cols="12"
                      class="pt-6 pl-3"
                    >
                      {{ wsMessage }}
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
                        :disabled="disableButtons"
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
                        :disabled="disableButtons"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VRadioGroup
                        v-model="beadsType"
                        inline
                        :disabled="disableButtons"
                        @update:modelValue="changeSetpoint"
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
                      :disabled="acquisitionStarted || disableButtons"
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
                            Mean
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
                            {{ (statsData && statsData.ssc) ? statsData.ssc.median.toFixed(2) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? (statsData.ssc.cv*100).toFixed(1) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? statsData.ssc.mean.toFixed(2) : "" }}
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
                            {{ (statsData && statsData.ssc) ? statsData.fl1.median.toFixed(2) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? (statsData.fl1.cv*100).toFixed(1) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? statsData.fl1.mean.toFixed(2) : "" }}
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
                            {{ (statsData && statsData.ssc) ? statsData.fl2.median.toFixed(2) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? (statsData.fl2.cv*100).toFixed(1) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? statsData.fl2.mean.toFixed(2) : "" }}
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
                            {{ (statsData && statsData.ssc) ? statsData.fsc.median.toFixed(2) : "" }}
                          </td>
                          <td class="text-center">
                            {{ ( statsData && statsData.ssc) ? (statsData.fsc.cv*100).toFixed(1): "" }}
                          </td>
                          <td class="text-center">
                            {{ (statsData && statsData.ssc) ? statsData.fsc.mean.toFixed(2) : "" }}
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
                      :disabled="disableButtons"
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
                      :disabled="disableButtons"
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
                      :disabled="disableButtons"
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
                      :disabled="disableButtons"
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
                      :disabled="disableButtons"
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
              :title="'Save '+beadsType+' acquisition'"
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
                        :disabled="disableButtons"
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
                        :disabled="disableButtons"
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
                        :disabled="disableButtons"
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
                        :disabled="disableButtons"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VBtn 
                        :disabled="disableButtons"
                        :loading="disableButtons && connected"
                        @click="launchSave"
                      >
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
  </div>
</template>
