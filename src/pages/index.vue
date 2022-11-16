<script setup>
import { ref, onMounted } from "vue"

// Constants
const availableChannels = ["SSC", "FL1", "FL2", "FSC"]
const integrationTimes = [1, 5, 10, 15, 20, 30]

// Form fields
const ipAddress = ref("127.0.0.1")
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

// Form rules
const requiredRules = [v => !!v || 'This field is required']
const ipAddressRule = [v => (v.match(/\./g) || []).length > 1 || 'Please enter IP address or subdomain'] // wants at least two dots in address

// Connect to websocket
let websocketForm = ref(null)
let connected = ref(false)
const websocketFormValid = ref(false)
function connectWebsocket()
{
  if (!connected.value)
  {
    websocketForm.value.validate()

    // Connection valid
    if (websocketFormValid.value)
    {
      connected.value = true
    }
  }
  else
  {
    // Disconnect
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
          Placeholder
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
