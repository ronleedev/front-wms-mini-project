<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">검품 처리</div>

    <q-select
        class="q-mb-md"
        style="max-width: 420px"
        v-model="selectedPickListNo"
        :options="pickListOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="피킹리스트 선택 (피킹완료 상태만)"
        @update:model-value="loadPickList"
    />

    <div v-if="header">
      <div class="q-mb-sm">
        <b>출고지시:</b> {{ header.shipNo }} &nbsp;&nbsp;
        <b>창고:</b> {{ header.whNm }} &nbsp;&nbsp;
        <b>피킹리스트 상태:</b> {{ header.status }}
      </div>

      <q-markup-table flat bordered>
        <thead>
        <tr>
          <th>품목</th>
          <th>로케이션</th>
          <th>피킹수량</th>
          <th>검품수량</th>
          <th>검품결과</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(line, idx) in lines" :key="idx">
          <td>{{ line.itemNm }}</td>
          <td>{{ line.locCd }}</td>
          <td>{{ line.pickQty }}</td>
          <td style="width: 120px">
            <q-input v-model.number="line.inspectQty" type="number" dense :disable="alreadyDone" />
          </td>
          <td style="width: 140px">
            <q-select v-model="line.inspectResult" :options="['정상', '불량']" dense :disable="alreadyDone" />
          </td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-btn
          class="q-mt-md"
          color="primary"
          label="검품확정"
          :disable="alreadyDone"
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
const header = ref(null)
const lines = ref([])
const alreadyDone = ref(false)

async function fetchPickListOptions() {
  const { data } = await api.get('/api/pick-lists')
  pickListOptions.value = data
      .filter(p => p.status === '완료')
      .map(p => ({ label: `${p.pickListNo} (${p.shipNo})`, value: p.pickListNo }))
}

async function loadPickList(pickListNo) {
  const { data: hdr } = await api.get(`/api/pick-lists/${pickListNo}`)
  header.value = hdr

  const { data: pickResults } = await api.get(`/api/pick-lists/${pickListNo}/picking`)
  lines.value = pickResults.map(p => ({
    pickRsltNo: p.pickRsltNo,
    itemNm: p.itemNm,
    locCd: p.locCd,
    pickQty: p.pickQty,
    inspectQty: p.pickQty,
    inspectResult: '정상'
  }))

  const { data: existing } = await api.get(`/api/pick-lists/${pickListNo}/inspection`)
  alreadyDone.value = existing.length > 0
}

async function confirm() {
  try {
    const payload = lines.value.map(l => ({
      pickRsltNo: l.pickRsltNo,
      inspectQty: l.inspectQty,
      inspectResult: l.inspectResult
    }))
    await api.post(`/api/pick-lists/${selectedPickListNo.value}/inspection/confirm`, payload)
    Notify.create({ type: 'positive', message: '검품확정 처리되었습니다.' })
    loadPickList(selectedPickListNo.value)
  } catch (e) {
    const msg = e.response?.data?.message || '검품확정 처리 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

fetchPickListOptions()
</script>