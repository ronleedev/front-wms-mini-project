<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">피킹 처리</div>

    <q-select
        class="q-mb-md"
        style="max-width: 420px"
        v-model="selectedPickListNo"
        :options="pickListOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="피킹리스트 선택"
        @update:model-value="loadPickList"
    />

    <div v-if="pickListDetail">
      <div class="q-mb-sm">
        <b>출고지시:</b> {{ pickListDetail.shipNo }} &nbsp;&nbsp;
        <b>창고:</b> {{ pickListDetail.whNm }} &nbsp;&nbsp;
        <b>담당:</b> {{ pickListDetail.workerNm || '미지정' }} &nbsp;&nbsp;
        <b>상태:</b> {{ pickListDetail.status }}
      </div>

      <q-markup-table flat bordered>
        <thead>
        <tr>
          <th>품목</th>
          <th>로케이션</th>
          <th>할당수량</th>
          <th>실제피킹수량</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(line, idx) in lines" :key="idx">
          <td>{{ line.itemNm }}</td>
          <td>{{ line.locCd }}</td>
          <td>{{ line.allocQty }}</td>
          <td style="width: 140px">
            <q-input
                v-model.number="line.pickQty"
                type="number"
                dense
                :disable="pickListDetail.status === '완료'"
            />
          </td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-btn
          class="q-mt-md"
          color="primary"
          label="피킹확정"
          :disable="pickListDetail.status === '완료'"
          @click="confirm"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const pickListOptions = ref([])
const selectedPickListNo = ref(null)
const pickListDetail = ref(null)
const lines = ref([])

async function fetchPickListOptions() {
  const { data } = await api.get('/api/pick-lists')
  pickListOptions.value = data.map(p => ({
    label: `${p.pickListNo} (${p.shipNo} / ${p.status})`,
    value: p.pickListNo
  }))
}

async function loadPickList(pickListNo) {
  const { data } = await api.get(`/api/pick-lists/${pickListNo}`)
  pickListDetail.value = data
  lines.value = data.allocations.map(a => ({
    allocNo: a.allocNo,
    itemNm: a.itemNm,
    locCd: a.locCd,
    allocQty: a.allocQty,
    pickQty: a.allocQty
  }))
}

async function confirm() {
  try {
    const payload = lines.value.map(l => ({ allocNo: l.allocNo, pickQty: l.pickQty }))
    await api.post(`/api/pick-lists/${selectedPickListNo.value}/picking/confirm`, payload)
    Notify.create({ type: 'positive', message: '피킹확정 처리되었습니다.' })
    fetchPickListOptions()
    loadPickList(selectedPickListNo.value)
  } catch (e) {
    const msg = e.response?.data?.message || '피킹확정 처리 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

fetchPickListOptions()
</script>