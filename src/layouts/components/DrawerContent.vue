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
        icon: { icon: 'mdi-midi-input' }
      }"
    />
    <VerticalNavSectionTitle :item="{ heading: 'Templates' }" />

    <VerticalNavLink
      :item="{
        title: 'Dashboard',
        to: 'dashboard',
        icon: { icon: 'mdi-home-outline' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Account Settings',
        to: 'account-settings',
        icon: { icon: 'mdi-account-cog-outline' }
      }"
    />
    <!-- 👉 Pages -->
    <VerticalNavSectionTitle :item="{ heading: 'Pages' }" />
    <VerticalNavLink
      :item="{
        title: 'Login',
        to: 'login',
        target: '_blank',
        icon: { icon: 'mdi-login' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Register',
        to: 'register',
        target: '_blank',
        icon: { icon: 'mdi-account-plus-outline' }
      }"
    />

    <!-- ℹ️ This path doesn't exist so 404 route will catch this undefined path -->
    <VerticalNavLink
      :item="{
        title: 'Error',
        to: { path: '/error' },
        target: '_blank',
        icon: { icon: 'mdi-alert-circle-outline' }
      }"
    />

    <!-- 👉 User Interface -->
    <VerticalNavSectionTitle :item="{ heading: 'User Interface' }" />

    <VerticalNavLink
      :item="{
        title: 'Typography',
        to: 'typography',
        icon: { icon: 'mdi-alpha-t-box-outline' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Icons',
        to: 'icons',
        icon: { icon: 'mdi-eye-outline' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Cards',
        to: 'card-basic',
        icon: { icon: 'mdi-credit-card-outline' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Tables',
        to: 'tables',
        icon: { icon: 'mdi-table' }
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Form Layouts',
        to: 'form-layouts',
        icon: { icon: 'mdi-form-select' }
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
