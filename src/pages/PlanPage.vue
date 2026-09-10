<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">입고예정 관리</div>
      <q-space />
      <q-btn color="primary" label="신규등록" @click="openCreateDialog" />
    </div>

    <q-table
        :rows="rows"
        :columns="columns"
        row-key="planNo"
        flat
        bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="edit" @click="openEditDialog(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="remove(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="min-width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? '입고예정 수정' : '입고예정 등록' }}</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <q-select
              class="col-4"
              v-model="form.whCd"
              :options="warehouseOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="창고"
          />
          <q-select
              class="col-4"
              v-model="form.shipperCd"
              :options="shipperOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="화주"
          />
          <q-input
              class="col-4"
              v-model="form.planDate"
              type="date"
              label="입고예정일자"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center q-mb-sm">
            <div class="text-subtitle2">품목 목록</div>
            <q-space />
            <q-btn dense flat icon="add" label="품목 추가" @click="addDetailRow" />
          </div>

          <div
              v-for="(detail, idx) in form.details"
              :key="idx"
              class="row q-col-gutter-sm q-mb-sm items-center"
          >
            <q-select
                class="col-6"
                v-model="detail.itemCd"
                :options="itemOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="품목"
                dense
            />
            <q-input class="col-4" v-model.number="detail.planQty" type="number" label="예정수량" dense />
            <q-btn class="col-2" dense flat icon="delete" color="negative" @click="removeDetailRow(idx)" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn color="primary" label="저장" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const rows = ref([])
const warehouseOptions = ref([])
const shipperOptions = ref([])
const itemOptions = ref([])
const dialogOpen = ref(false)
const isEdit = ref(false)
const form = ref(emptyForm())

const columns = [
  { name: 'planNo', label: '입고예정번호', field: 'planNo', align: 'left' },
  { name: 'planDate', label: '입고예정일자', field: 'planDate', align: 'center' },
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'shipperNm', label: '화주', field: 'shipperNm', align: 'left' },
  { name: 'status', label: '상태', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'center' }
]

function emptyForm() {
  return { planNo: '', whCd: '', shipperCd: '', planDate: '', details: [{ itemCd: '', planQty: 1 }] }
}

async function fetchList() {
  const { data } = await api.get('/api/plans')
  rows.value = data
}

async function fetchOptions() {
  const [wh, sh, it] = await Promise.all([
    api.get('/api/warehouses'),
    api.get('/api/shippers'),
    api.get('/api/items')
  ])
  warehouseOptions.value = wh.data.map(w => ({ label: w.whNm, value: w.whCd }))
  shipperOptions.value = sh.data.map(s => ({ label: s.shipperNm, value: s.shipperCd }))
  itemOptions.value = it.data.map(i => ({ label: i.itemNm, value: i.itemCd }))
}

function openCreateDialog() {
  isEdit.value = false
  form.value = emptyForm()
  dialogOpen.value = true
}

async function openEditDialog(row) {
  isEdit.value = true
  const { data } = await api.get(`/api/plans/${row.planNo}`)
  form.value = {
    planNo: data.planNo,
    whCd: data.whCd,
    shipperCd: data.shipperCd,
    planDate: data.planDate,
    details: data.details.map(d => ({ itemCd: d.itemCd, planQty: d.planQty }))
  }
  dialogOpen.value = true
}

function addDetailRow() {
  form.value.details.push({ itemCd: '', planQty: 1 })
}

function removeDetailRow(idx) {
  form.value.details.splice(idx, 1)
}

async function save() {
  if (isEdit.value) {
    await api.put(`/api/plans/${form.value.planNo}`, form.value)
  } else {
    await api.post('/api/plans', form.value)
  }
  dialogOpen.value = false
  fetchList()
}

async function remove(row) {
  await api.delete(`/api/plans/${row.planNo}`)
  fetchList()
}

onMounted(() => {
  fetchOptions()
  fetchList()
})
</script>