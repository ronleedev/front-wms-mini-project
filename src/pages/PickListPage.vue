<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">피킹리스트</div>
      <q-space />
      <q-btn color="primary" label="신규 피킹리스트 생성" @click="openCreateDialog" />
    </div>

    <q-table
        :rows="rows"
        :columns="columns"
        row-key="pickListNo"
        flat
        bordered
        @row-click="(evt, row) => loadDetail(row.pickListNo)"
    />

    <q-dialog v-model="createDialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">신규 피킹리스트 생성</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
              v-model="createForm.shipNo"
              :options="shipOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="출고지시 (할당완료 상태만)"
          />
          <q-input v-model="createForm.workerNm" label="담당작업자" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn color="primary" label="생성" @click="createPickList" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div v-if="detail" class="q-mt-lg">
      <div class="text-subtitle1 q-mb-sm">
        {{ detail.pickListNo }} — {{ detail.whNm }} / {{ detail.shipperNm }} /
        담당: {{ detail.workerNm || '미지정' }} / {{ detail.status }}
      </div>

      <div class="text-subtitle2 q-mb-sm">피킹 대상 (할당 내역)</div>
      <q-table :rows="detail.allocations" :columns="allocColumns" row-key="allocNo" flat bordered />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const rows = ref([])
const shipOptions = ref([])
const createDialogOpen = ref(false)
const createForm = ref({ shipNo: '', workerNm: '' })
const detail = ref(null)

const columns = [
  { name: 'pickListNo', label: '피킹리스트번호', field: 'pickListNo', align: 'left' },
  { name: 'shipNo', label: '출고지시번호', field: 'shipNo', align: 'left' },
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'shipperNm', label: '화주', field: 'shipperNm', align: 'left' },
  { name: 'workerNm', label: '담당작업자', field: 'workerNm', align: 'left' },
  { name: 'status', label: '상태', field: 'status', align: 'center' }
]

const allocColumns = [
  { name: 'itemNm', label: '품목', field: 'itemNm', align: 'left' },
  { name: 'locCd', label: '로케이션', field: 'locCd', align: 'center' },
  { name: 'allocQty', label: '할당수량', field: 'allocQty', align: 'right' }
]

async function fetchList() {
  const { data } = await api.get('/api/pick-lists')
  rows.value = data
}

async function fetchShipOptions() {
  const { data } = await api.get('/api/ships')
  shipOptions.value = data
      .filter(s => s.status === '할당완료')
      .map(s => ({ label: `${s.shipNo} (${s.whNm} / ${s.shipperNm})`, value: s.shipNo }))
}

function openCreateDialog() {
  createForm.value = { shipNo: '', workerNm: '' }
  createDialogOpen.value = true
}

async function createPickList() {
  try {
    await api.post('/api/pick-lists', createForm.value)
    createDialogOpen.value = false
    Notify.create({ type: 'positive', message: '피킹리스트가 생성되었습니다.' })
    fetchList()
    fetchShipOptions()
  } catch (e) {
    const msg = e.response?.data?.message || '피킹리스트 생성 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

async function loadDetail(pickListNo) {
  const { data } = await api.get(`/api/pick-lists/${pickListNo}`)
  detail.value = data
}

onMounted(() => {
  fetchList()
  fetchShipOptions()
})
</script>