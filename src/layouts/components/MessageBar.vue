<script setup>
const props = defineProps({
  logMessage: {default: null, type:Object},
})
</script>

<template>
  <VRow>
    <VCol>
      <VAlert
        v-if="logMessage && (logMessage.error != 10 && logMessage.error != 102 && logMessage.error != 100)"
        border="top"
        color="error"
      >
        <VAlertTitle class="mb-1">
          Error {{ logMessage.error }}
        </VAlertTitle>
        {{ logMessage.msg }}
      </VAlert>
      <VAlert
        v-else-if="logMessage && (logMessage.error == 10 || logMessage.error == 102)"
        border="top"
        color="success"
      >
        <VAlertTitle class="mb-1">
          {{ logMessage.msg }}
        </VAlertTitle>
        Command: {{ logMessage.command }}<span v-if="logMessage.args.length > 0"> / Args: {{ logMessage.args }}</span>
      </VAlert>
      <VAlert
        v-else-if="logMessage && logMessage.error == 100"
        border="top"
        color="success"
      >
        <VAlertTitle class="mb-1">
          Status
        </VAlertTitle>
        {{ logMessage.msg }}
      </VAlert>
      <VAlert
        v-else-if="logMessage"
        border="top"
        color="success"
      >
        <VAlertTitle class="mb-1">
          Message {{ logMessage.error }}
        </VAlertTitle>
        {{ logMessage.msg }}
      </VAlert>
    </VCol>
  </VRow>
</template>
