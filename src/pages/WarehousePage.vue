<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">창고 관리</div>
      <q-space />
      <q-btn color="primary" label="신규등록" @click="openCreateDialog" />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="whCd"
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
          <div class="text-h6">{{ isEdit ? '창고 수정' : '창고 등록' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.whCd" label="창고코드" :disable="isEdit" />
          <q-input v-model="form.whNm" label="창고명" />
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
const form = ref({ whCd: '', whNm: '' })

const columns = [
  { name: 'whCd', label: '창고코드', field: 'whCd', align: 'left' },
  { name: 'whNm', label: '창고명', field: 'whNm', align: 'left' },
  { name: 'useYn', label: '사용여부', field: 'useYn', align: 'center' },
  { name: 'actions', label: '', field: 'actions', align: 'center' }
]

async function fetchList() {
  const { data } = await api.get('/api/warehouses')
  rows.value = data
}

function openCreateDialog() {
  isEdit.value = false
  form.value = { whCd: '', whNm: '' }
  dialogOpen.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogOpen.value = true
}

async function save() {
  if (isEdit.value) {
    await api.put(`/api/warehouses/${form.value.whCd}`, form.value)
  } else {
    await api.post('/api/warehouses', form.value)
  }
  dialogOpen.value = false
  fetchList()
}

async function remove(row) {
  await api.delete(`/api/warehouses/${row.whCd}`)
  fetchList()
}

onMounted(fetchList)
</script>
