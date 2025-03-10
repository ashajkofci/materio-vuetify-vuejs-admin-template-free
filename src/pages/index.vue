<script setup>
import { ref, onMounted, watchEffect, computed } from "vue"
import { VueEcharts } from 'vue3-echarts'
import * as echarts from 'echarts'
import { usePersistedRef } from './usePersistedRef'
import { storeToRefs } from 'pinia'
import {useWebsocketStore} from '@/plugins/store'
import Constants from '@/plugins/constants'
import MessageBar from '@/layouts/components/MessageBar.vue'

// Websocket connection
const websocketData = useWebsocketStore()

// Buttons
let isRunning = ref(false)
let disableButtons = computed(() => {
  return  !websocketData.connected || isRunning.value
})

// Root template
const root = ref(null)

// Constants
const availableChannels = Object.keys(Constants.AVAILABLE_CHANNELS)
const channelIndexes = Constants.AVAILABLE_CHANNELS

// Form fields
const eventBuffer = ref(1)
const triggerChannel = ref("FL1")
const xAxis = ref("FL1")
const yAxis = ref("SSC")
const beadsType = ref(Constants.BEADS_NFPPS524K)
const statsIntegrationTime = ref(Constants.ACQUISITION_INTEGRATION_TIMES[3])
const operator = usePersistedRef("operator", "")
const optSN = ref("")
const detectorSN = ref("")
const laserSN = ref("")
const pumpPort = ref(Constants.BEADS_NFPPS524K)
const buttonReset = ref(null)
const buttonPrime = ref(null)
const buttonFlush = ref(null)
const buttonPump = ref(null)
const buttomPump2 = ref(null)
const buttonPull = ref(null)
const pumpMessage = ref("")
const logMessage = ref(null)
const chart = ref(null)

// Stat data
const statsData = ref(null)

// Plot data
var log_events = [Array(), Array(), Array(), Array(), Array()]
var gates_fl2 = null
var gates_fl2_2 = null
var gates_ssc = null

const {buffer} = storeToRefs(websocketData)
watch(buffer, _b => {
  console.log('Received new buffer data')
  if (_b.length === 0)
  {
    console.log("Empty data")

    return
  } else {
    let data = _b

    // Error 101 MESSAGE_ACQUISITION_DATA
    if (data.error === 101) {
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
    else // Other error or finish message
    {
      isRunning.value = false
      logMessage.value = data
    }
  }
})


var dac_setpoint = Constants.DAC_SETPOINTS_BEADS[Constants.BEADS_NFPPS524K]

let chartChannels = Constants.PLOT_LIMITS

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

function renderGate_FL2_2(params, api) {
  var gates = gates_fl2_2

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

function renderGate_FL2(params, api) {
  var gates = gates_fl2

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
function renderGate_SSC(params, api) {
  var gates = gates_ssc

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
          renderItem: renderGate_FL2,
          data: xAxis.value == "FL1" && yAxis.value == "FL2" ? gates_fl2 : [],
        },
        {
          type: 'custom',
          renderItem: renderGate_FL2_2,
          data: xAxis.value == "FL1" && yAxis.value == "FL2" ? gates_fl2_2 : [],
        },
        {
          type: 'custom',
          renderItem: renderGate_SSC,
          data: xAxis.value == "FL1" && yAxis.value == "SSC" ? gates_ssc : [],
        },
      ],
    },
  )
}
const valid_data = ref()

onMounted( () => {
})

// eslint-disable-next-line sonarjs/cognitive-complexity
watchEffect(() => {
  // compute tests
  valid_data.value = {
    'fl1' :
   {
     'all':false,
     'cv':false,
     'offset':false,
     'median':false,
   },
    'fl2' :
   {
     'all':false,
     'cv':false,
     'offset':false,
     'median':false,
   },
    'ssc' :
   {
     'all':false,
     'cv':false,
     'offset':false,
     'median':false,
   },
    'fsc' :
   {
     'all':false,
     'cv':false,
     'offset':false,
     'median':false,
   },
    'hna':
   {
     'all':false,
     'cv':false,
     'offset':false,
     'median':false,
   },
  }
  if (statsData.value && statsData.value['ssc'])
  {
    // eslint-disable-next-line sonarjs/no-all-duplicated-branches
    if (beadsType.value == "URFP302")
    {
      valid_data.value = {
        'fl1': 
          {
            'all': statsData.value['fl1'] ? (statsData.value['fl1'].offset < -25000*64 && statsData.value['fl1'].cv < 0.1 && statsData.value['fl1'].cv > 0) : false,
            'offset': statsData.value['fl1'].offset < -25000*64,
            'median': true,
            'cv': statsData.value['fl1'].cv < 0.1,
          },
        'fl2': 
        {
          'all':statsData.value['fl2'] ? (statsData.value['fl2'].offset < -25000*64 && statsData.value['fl2'].cv < 0.1 && statsData.value['fl2'].cv > 0) : false,
          'offset':statsData.value['fl2'].offset < -25000*64,
          'median':true,
          'cv':statsData.value['fl2'].cv < 0.1 && statsData.value['fl2'].cv > 0,
        },
        'ssc': 
        {
          'all': statsData.value['ssc'] ? (statsData.value['ssc'].cv < 0.2 && statsData.value['ssc'].cv > 0 && statsData.value['ssc'].offset < -20000*64) : false,
          'offset':statsData.value['ssc'].offset < -20000*64,
          'cv':statsData.value['ssc'].cv < 0.2 && statsData.value['ssc'].cv > 0,
          'median':true,
        },
        'fsc': {
          'all':statsData.value['fsc'] ? true : false,
          'offset':true,
          'cv':true,
          'median':true,
        },
        'hna': {
          'all': statsData.value['counts'] ? statsData.value['counts']['HNAP'] > 0.95 : false ,
          'offset':true,
          'cv':true,
          'median': statsData.value['counts']['HNAP'] > 0.95,
        },
      }
    } else
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    {
      valid_data.value = {
        'fl1': 
          {
            'all': statsData.value['fl1'] ? (statsData.value['fl1'].median > 6.03 &&  statsData.value['fl1'].cv > 0 && statsData.value['fl1'].cv < 0.1 && statsData.value['fl1'].offset < -25000*64) : false,
            'offset': statsData.value['fl1'].offset < -25000*64,
            'median': statsData.value['fl1'].median > 6.03,
            'cv': statsData.value['fl1'].cv < 0.1 && statsData.value['fl1'].cv > 0,
          },
        'fl2': 
        {
          'all':statsData.value['fl2'] ? statsData.value['fl2'].offset < -25000*64 : false,
          'offset':statsData.value['fl2'].offset < -25000*64,
          'median':true,
          'cv':true,
        },
        'ssc': 
        {
          'all': statsData.value['ssc'] ? (statsData.value['ssc'].median > 5.2 && statsData.value['ssc'].cv < 0.2 && statsData.value['ssc'].cv > 0 && statsData.value['ssc'].offset < -20000*64) : false,
          'offset':statsData.value['ssc'].offset < -20000*64,
          'cv':statsData.value['ssc'].cv < 0.2 &&  statsData.value['ssc'].cv > 0,
          'median':statsData.value['ssc'].median > 5.2,
        },
        'fsc': {
          'all':statsData.value['fsc'] ? true : false,
          'offset':true,
          'cv':true,
          'median':true,
        },
        'hna': {
          'all': true,
          'offset':true,
          'cv':true,
          'median': true,
        },
      }
    }
  }
})

// Form rules
const requiredRules = [v => !!v || 'This field is required']

// Start acquisition
let startAcquisitionButton = ref(null)
var acquisitionStarted = ref(false)
function startStopAcquisition()
{
  // Stop acquisition
  if (acquisitionStarted.value)
  {
    acquisitionStarted.value = false
    websocketData.sendRequest("abort", "")
  } else {
    // Start acquisition
    acquisitionStarted.value = true
    dac_setpoint = Constants.DAC_SETPOINTS_BEADS[beadsType.value]
    log_events = [Array(), Array(), Array(), Array(), Array()]
    websocketData.sendRequest("acquisition_gate", "600,"+dac_setpoint+","+statsIntegrationTime.value)
  }
}

function startAcquisitionNoStop()
{
  // Stop acquisition
  if (acquisitionStarted.value)
  {
  } else {
    // Start acquisition
    acquisitionStarted.value = true
    dac_setpoint = Constants.DAC_SETPOINTS_BEADS[beadsType.value]
    log_events = [Array(), Array(), Array(), Array(), Array()]
    websocketData.sendRequest("acquisition_gate", "600,"+dac_setpoint+","+statsIntegrationTime.value)
  }
}

// Laser control
function changeSetpoint()
{
  dac_setpoint = Constants.DAC_SETPOINTS_BEADS[beadsType.value]
  websocketData.sendRequest("async_setpoint", dac_setpoint)
}

// Pump control
function launchPump(type)
{
  pumpMessage.value = "Launching "+ type + "..."
  if (!(type == "pump" || type == "pump2"))
  {
    if (acquisitionStarted.value)
    {
      startStopAcquisition()
    }
  }
  else if (!acquisitionStarted.value)
  {
    startAcquisitionNoStop()
  }
  websocketData.sendRequest("async_pump", type+","+pumpPort.value)
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
    websocketData.sendRequest("save_acquisition", operator.value+","+optSN.value+","+detectorSN.value+","+laserSN.value)
  }

}
</script>

<template>
  <div ref="root">
    <MessageBar :log-message="logMessage" />
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
                <VRow>
                  <VCol
                    md="3"
                    cols="3"
                    class="mt-1"
                  >
                    <VBtn
                      ref="startAcquisitionButton"
                      :disabled="!websocketData.connected"
                      @click="startStopAcquisition"
                    >
                      {{ acquisitionStarted ? "Stop":"Start" }}
                    </VBtn>
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
                        :items="Constants.ACQUISITION_INTEGRATION_TIMES"
                        :disabled="disableButtons"
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
                          label="NFPPS-52-4K"
                          value="NFPPS524K"
                        />
                        <VRadio
                          label="URFP-30-2"
                          value="URFP302"
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
                      :items="Constants.ACQUISITION_INTEGRATION_TIMES"
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
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.ssc.median}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.ssc.median.toFixed(2) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.ssc.cv}"
                          >
                            {{ (statsData && statsData.ssc) ? (statsData.ssc.cv*100).toFixed(1) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.ssc.offset}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.ssc.offset.toFixed(0) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (valid_data && valid_data.ssc) ? (valid_data.ssc.all ? "🐸" : "🐙"):"🐙" }}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            FL1
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl1.median}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fl1.median.toFixed(2) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl1.cv}"
                          >
                            {{ (statsData && statsData.ssc) ? (statsData.fl1.cv*100).toFixed(1) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl1.offset}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fl1.offset.toFixed(0) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (valid_data && valid_data.fl1) ? (valid_data.fl1.all ? "🐸" : "🐙"):"🐙" }}
                          </td>
                        </tr>    
                        <tr>
                          <td>
                            FL2
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl2.median}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fl2.median.toFixed(2) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl2.cv}"
                          >
                            {{ (statsData && statsData.ssc) ? (statsData.fl2.cv*100).toFixed(1) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fl2.offset}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fl2.offset.toFixed(0) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (valid_data && valid_data.fl2) ? (valid_data.fl2.all ? "🐸" : "🐙"):"🐙" }}
                          </td>
                        </tr>    
                        <tr>
                          <td>
                            FSC
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fsc.median}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fsc.median.toFixed(2) : "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fsc.cv}"
                          >
                            {{ ( statsData && statsData.ssc) ? (statsData.fsc.cv*100).toFixed(1): "" }}
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.fsc.offset}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.fsc.offset.toFixed(0) : "" }}
                          </td>
                          <td class="text-center">
                            {{ (valid_data && valid_data.fsc) ? (valid_data.fsc.all ? "🐸" : "🐙"):"🐙" }}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            HNA
                          </td>
                          <td
                            class="text-center"
                            :class="{'red':!valid_data.hna.median}"
                          >
                            {{ (statsData && statsData.ssc) ? statsData.counts.HNAP.toFixed(2) : "" }}
                          </td>
                          <td
                            class="text-center"
                          />
                          <td
                            class="text-center"
                          />
                          <td class="text-center">
                            {{ (valid_data && valid_data.hna) ? (valid_data.hna.all ? "🐸" : "🐙"):"🐙" }}
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
                  <VCol>
                    <VRadioGroup
                      v-model="pumpPort"
                      inline
                      :disabled="disableButtons"
                    >
                      <VRadio
                        label="NFPPS-52-4K"
                        value="NFPPS524K"
                      />
                      <VRadio
                        label="URFP-30-2"
                        value="URFP302"
                      />
                      <VRadio
                        label="Water"
                        value="water"
                      />
                    </VRadioGroup>
                  </VCol>
                </VRow>
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
                    cols="4"
                  >
                    <VBtn
                      ref="buttonFlush"
                      size="small"
                      :disabled="disableButtons"
                      @click="launchPump('store')"
                    >
                      Rinse & evacuate
                    </VBtn>
                  </VCol>
                </VRow>
                <VRow>
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
                  <VCol
                    cols="3"
                  >
                    <VBtn
                      ref="buttonPull"
                      size="small"
                      :disabled="disableButtons"
                      @click="launchPump('pulloptics')"
                    >
                      Pickup optics 1mn
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
                        :disabled="disableButtons"
                      />
                    </VCol>
                    <VCol
                      md="6"
                      cols="12"
                    >
                      <VTextField
                        v-model="optSN"
                        label="Optical Module SN"
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
                        v-model="detectorSN"
                        label="Detector Module SN"
                        :rules="requiredRules"
                        :disabled="disableButtons"
                      />
                    </VCol>
                    <VCol
                      md="6"
                      cols="12"
                    >
                      <VTextField
                        v-model="laserSN"
                        label="Laser Controller SN"
                        :rules="requiredRules"
                        :disabled="disableButtons"
                      />
                    </VCol>
                  </VRow>
                  <VRow>
                    <VCol>
                      <VBtn 
                        :disabled="acquisitionStarted || disableButtons"
                        :loading="disableButtons && websocketData.connected"
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
