<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">출고 할당</div>

    <q-select
        class="q-mb-md"
        style="max-width: 420px"
        v-model="selectedShipNo"
        :options="shipOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="출고지시 선택"
        @update:model-value="loadShip"
    />

    <div v-if="shipDetail">
      <div class="q-mb-sm">
        <b>창고:</b> {{ shipDetail.whNm }} &nbsp;&nbsp;
        <b>화주:</b> {{ shipDetail.shipperNm }} &nbsp;&nbsp;
        <b>상태:</b> {{ shipDetail.status }}
      </div>

      <div class="text-subtitle2 q-mb-sm">출고지시 라인</div>
      <q-markup-table flat bordered class="q-mb-md">
        <thead>
        <tr>
          <th>품목</th>
          <th>출고지시수량</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(d, idx) in shipDetail.details" :key="idx">
          <td>{{ d.itemNm }}</td>
          <td>{{ d.shipQty }}</td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-btn
          color="primary"
          label="자동할당"
          :disable="shipDetail.status !== '대기'"
          @click="allocate"
      />

      <div v-if="allocations.length" class="q-mt-lg">
        <div class="text-subtitle2 q-mb-sm">할당 결과</div>
        <q-table :rows="allocations" :columns="allocColumns" row-key="allocNo" flat bordered />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const shipOptions = ref([])
const selectedShipNo = ref(null)
const shipDetail = ref(null)
const allocations = ref([])

const allocColumns = [
  { name: 'itemNm', label: '품목', field: 'itemNm', align: 'left' },
  { name: 'locCd', label: '로케이션', field: 'locCd', align: 'center' },
  { name: 'allocQty', label: '할당수량', field: 'allocQty', align: 'right' }
]

async function fetchShipOptions() {
  const { data } = await api.get('/api/ships')
  shipOptions.value = data.map(s => ({
    label: `${s.shipNo} (${s.whNm} / ${s.shipperNm} / ${s.status})`,
    value: s.shipNo
  }))
}

async function loadShip(shipNo) {
  const { data } = await api.get(`/api/ships/${shipNo}`)
  shipDetail.value = data
  const { data: allocData } = await api.get(`/api/ships/${shipNo}/allocations`)
  allocations.value = allocData
}

async function allocate() {
  try {
    const { data } = await api.post(`/api/ships/${selectedShipNo.value}/allocations`)
    allocations.value = data
    Notify.create({ type: 'positive', message: '할당이 완료되었습니다.' })
    loadShip(selectedShipNo.value)
  } catch (e) {
    const msg = e.response?.data?.message || '할당 처리 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

fetchShipOptions()
</script>