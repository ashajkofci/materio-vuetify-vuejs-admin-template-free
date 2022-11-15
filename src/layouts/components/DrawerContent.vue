<script setup>
import logo from '@/assets/logo.svg?raw'
import {
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
</script>

<template>
  <!-- 👉 Nav header -->
  <div class="nav-header">
    <RouterLink
      to="/"
      class="app-logo d-flex align-center gap-x-3 app-title-wrapper"
    >
      <!-- ℹ️ You can also use img tag or VImg here -->
      <VImg
        src="/logo.png"
        height="55"
        style="left:-15px;top:-7px;"
      />
    </RouterLink>
  </div>

  <!-- 👉 Nav items -->
  <ul>
    <VerticalNavSectionTitle :item="{ heading: 'Calibration' }" />

    <VerticalNavLink
      :item="{
        title: 'Optics calibration',
        to: 'index',
        icon: { icon: 'mdi-alarm-light-outline' }
      }"
    />

    <VerticalNavSectionTitle :item="{ heading: 'Bactosense Control' }" />
    <VerticalNavLink
      :item="{
        title: 'Motor control',
        to: 'dashboard',
        icon: { icon: 'mdi-abacus' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Protocol runner',
        to: 'dashboard',
        icon: { icon: 'mdi-contactless-payment-circle-outline' }
      }"
    />
  </ul>
</template>

<style lang="scss">
// .v-navigation-drawer {
//   height: 100%;

//   .v-navigation-drawer__content {
//     display: flex;
//     flex-direction: column;

//     > ul {
//       flex-grow: 1;
//     }
//   }
// }
</style>
