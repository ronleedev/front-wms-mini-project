<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">입고확정 처리</div>

    <q-select
        class="q-mb-md"
        style="max-width: 420px"
        v-model="selectedPlanNo"
        :options="planOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="입고예정 선택"
        @update:model-value="loadPlanDetail"
    />

    <div v-if="planDetail">
      <div class="q-mb-sm">
        <b>창고:</b> {{ planDetail.whNm }} &nbsp;&nbsp;
        <b>화주:</b> {{ planDetail.shipperNm }} &nbsp;&nbsp;
        <b>상태:</b> {{ planDetail.status }}
      </div>

      <q-markup-table flat bordered>
        <thead>
        <tr>
          <th>품목</th>
          <th>예정수량</th>
          <th>실제수량</th>
          <th>검수결과</th>
          <th>적치 로케이션</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(line, idx) in lines" :key="idx">
          <td>{{ line.itemNm }}</td>
          <td>{{ line.planQty }}</td>
          <td style="width: 120px">
            <q-input v-model.number="line.actualQty" type="number" dense />
          </td>
          <td style="width: 140px">
            <q-select v-model="line.inspectResult" :options="['정상', '불량']" dense />
          </td>
          <td style="width: 160px">
            <q-input v-model="line.locCd" dense placeholder="예: A-01-01" />
          </td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-btn
          class="q-mt-md"
          color="primary"
          label="입고확정"
          :disable="planDetail.status === '완료'"
          @click="confirm"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const planOptions = ref([])
const selectedPlanNo = ref(null)
const planDetail = ref(null)
const lines = ref([])

async function fetchPlanOptions() {
  const { data } = await api.get('/api/plans')
  planOptions.value = data.map(p => ({
    label: `${p.planNo} (${p.whNm} / ${p.shipperNm} / ${p.status})`,
    value: p.planNo
  }))
}

async function loadPlanDetail(planNo) {
  const { data } = await api.get(`/api/plans/${planNo}`)
  planDetail.value = data
  lines.value = data.details.map(d => ({
    itemCd: d.itemCd,
    itemNm: d.itemNm,
    planQty: d.planQty,
    actualQty: d.planQty,
    inspectResult: '정상',
    locCd: ''
  }))
}

async function confirm() {
  const payload = lines.value.map(l => ({
    itemCd: l.itemCd,
    actualQty: l.actualQty,
    inspectResult: l.inspectResult,
    whCd: planDetail.value.whCd,
    locCd: l.locCd
  }))
  await api.post(`/api/plans/${selectedPlanNo.value}/receipt/confirm`, payload)
  Notify.create({ type: 'positive', message: '입고확정 처리되었습니다.' })
  fetchPlanOptions()
  loadPlanDetail(selectedPlanNo.value)
}

fetchPlanOptions()
</script>