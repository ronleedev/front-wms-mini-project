<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">출고지시 관리</div>
      <q-space />
      <q-btn color="primary" label="신규등록" @click="openCreateDialog" />
    </div>

    <q-table
        :rows="rows"
        :columns="columns"
        row-key="shipNo"
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
          <div class="text-h6">{{ isEdit ? '출고지시 수정' : '출고지시 등록' }}</div>
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
              v-model="form.shipDate"
              type="date"
              label="출고예정일자"
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
            <q-input class="col-4" v-model.number="detail.shipQty" type="number" label="출고지시수량" dense />
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
  { name: 'shipNo', label: '출고지시번호', field: 'shipNo', align: 'left' },
  { name: 'shipDate', label: '출고예정일자', field: 'shipDate', align: 'center' },
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'shipperNm', label: '화주', field: 'shipperNm', align: 'left' },
  { name: 'status', label: '상태', field: 'status', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'center' }
]

function emptyForm() {
  return { shipNo: '', whCd: '', shipperCd: '', shipDate: '', details: [{ itemCd: '', shipQty: 1 }] }
}

async function fetchList() {
  const { data } = await api.get('/api/ships')
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
  const { data } = await api.get(`/api/ships/${row.shipNo}`)
  form.value = {
    shipNo: data.shipNo,
    whCd: data.whCd,
    shipperCd: data.shipperCd,
    shipDate: data.shipDate,
    details: data.details.map(d => ({ itemCd: d.itemCd, shipQty: d.shipQty }))
  }
  dialogOpen.value = true
}

function addDetailRow() {
  form.value.details.push({ itemCd: '', shipQty: 1 })
}

function removeDetailRow(idx) {
  form.value.details.splice(idx, 1)
}

async function save() {
  if (isEdit.value) {
    await api.put(`/api/ships/${form.value.shipNo}`, form.value)
  } else {
    await api.post('/api/ships', form.value)
  }
  dialogOpen.value = false
  fetchList()
}

async function remove(row) {
  await api.delete(`/api/ships/${row.shipNo}`)
  fetchList()
}

onMounted(() => {
  fetchOptions()
  fetchList()
})
</script>