<script setup>
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="6"
    >
      <VCard
        title="Laser status"
        class="position-relative"
      >
        <VCardText>
          <VRow>
            <VCol>
              Status:
            </VCol>
            <VCol>
              {{ laserStatus }}
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
