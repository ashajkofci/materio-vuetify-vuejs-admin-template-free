<script setup>
import AnalyticsAward from '@/views/dashboards/analytics/AnalyticsAward.vue'
import AnalyticsBarCharts from '@/views/dashboards/analytics/AnalyticsBarCharts.vue'
import AnalyticsDatatable from '@/views/dashboards/analytics/AnalyticsDatatable.vue'
import AnalyticsDepositWithdraw from '@/views/dashboards/analytics/AnalyticsDepositWithdraw.vue'
import AnalyticsSalesByCountries from '@/views/dashboards/analytics/AnalyticsSalesByCountries.vue'
import AnalyticsTotalEarning from '@/views/dashboards/analytics/AnalyticsTotalEarning.vue'
import AnalyticsTotalProfitLineCharts from '@/views/dashboards/analytics/AnalyticsTotalProfitLineCharts.vue'
import AnalyticsTransactions from '@/views/dashboards/analytics/AnalyticsTransactions.vue'
import AnalyticsWeeklyOverview from '@/views/dashboards/analytics/AnalyticsWeeklyOverview.vue'
import CardStatisticsVertical from '@core/components/CardStatisticsVertical.vue'
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="8"
      md="8"
    >
      <VCard
        title="Live view"
        class="position-relative"
      >
        <VCardText>
          <VImg src="/logo.png" />
          <VImg src="/logo.png" />
          <VBtn size="small">
            Start
          </VBtn>
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
            title="Live view parameters"
            class="position-relative"
          >
            <VCardText>
              <VForm>
                <VRow>
                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VTextField
                      label="Event buffer"
                      suffix="[s]"
                    />
                  </VCol>

                  <VCol
                    md="6"
                    cols="12"
                  >
                    <VSelect
                      label="Trigger channel"
                      :items="['FL1', 'FL2', 'SSC', 'FSC']"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VSelect
                      label="X-axis"
                      :items="['FL1', 'FL2', 'SSC', 'FSC']"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VSelect
                      label="Y-axis"
                      :items="['FL1', 'FL2', 'SSC', 'FSC']"
                    />
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
            title="Laser parameters"
            class="position-relative"
          >
            <VCardText>
              <VRow>
                <VCol>
                  <VRadioGroup inline>
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
                  <VTextField
                    label="Integration time"
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
              <VBtn size="small">
                Start
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="12"
        >
          <VCard
            title="Save"
            class="position-relative"
          >
            <VCardText>
              <VBtn size="small">
                Start
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>        
      </VRow>
    </VCol>
  </VRow>
</template>
