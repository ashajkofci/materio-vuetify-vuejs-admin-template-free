<script setup>
import Constants from '@/plugins/constants'
</script>

<template>
  <div class="w-100 h-100 d-flex align-center justify-space-between ">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-subtitle-2">
      Version {{ Constants.VERSION }}
      &copy;
      {{ new Date().getFullYear() }}
      bNovate Technologies SA
    </span>
  </div>
</template>
