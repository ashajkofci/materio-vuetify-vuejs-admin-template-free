<script setup name="WebsocketClient">
import { ref, onMounted, watchEffect, reactive} from "vue"
import { usePersistedRef } from '../../pages/usePersistedRef'
import { useWebsocketStore } from '../../plugins/store'

// Shared with siblings
const wbData = useWebsocketStore()
const ipAddressRule = [v => (v.match(/:/g) || []).length > 0 || 'Please enter IP address or subdomain'] // wants at least two dots in address

// Connect to websocket
const ipAddress = usePersistedRef("ip", "172.16.11.15:8001")
let websocketForm = ref(null)
const websocketFormValid = ref(false)

async function connect()
{
  await websocketForm.value.validate()
  if (websocketFormValid.value)
  {
    wbData.connectWebsocket(ipAddress)
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
          :disabled="wbData.connected"
        />
      </VCol>
    </VRow>
    <VRow>
      <VCol
        cols="6"
        class="mt-1 mx-auto"
      >
        <VBtn
          @click="connect"
        >
          {{ wbData.connected ? "Close" : "Connect" }}
        </VBtn>
      </VCol>
      <VCol
        cols="6"
        class="align-center mt-3 justify-center"
      >
        {{ wbData.wsMessage }}
      </VCol>
    </VRow>
  </VForm>
</template>
