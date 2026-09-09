<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">화주 관리</div>
      <q-space />
      <q-btn color="primary" label="신규등록" @click="openCreateDialog" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="shipperCd"
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
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? '화주 수정' : '화주 등록' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.shipperCd" label="화주코드" :disable="isEdit" />
          <q-input v-model="form.shipperNm" label="화주명" />
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
const dialogOpen = ref(false)
const isEdit = ref(false)
const form = ref({ shipperCd: '', shipperNm: '' })

const columns = [
  { name: 'shipperCd', label: '화주코드', field: 'shipperCd', align: 'left' },
  { name: 'shipperNm', label: '화주명', field: 'shipperNm', align: 'left' },
  { name: 'useYn', label: '사용여부', field: 'useYn', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'center' }
]

async function fetchList() {
  const { data } = await api.get('/api/shippers')
  rows.value = data
}

function openCreateDialog() {
  isEdit.value = false
  form.value = { shipperCd: '', shipperNm: '' }
  dialogOpen.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogOpen.value = true
}

async function save() {
  if (isEdit.value) {
    await api.put(`/api/shippers/${form.value.shipperCd}`, form.value)
  } else {
    await api.post('/api/shippers', form.value)
  }
  dialogOpen.value = false
  fetchList()
}

async function remove(row) {
  await api.delete(`/api/shippers/${row.shipperCd}`)
  fetchList()
}

onMounted(fetchList)
</script>
