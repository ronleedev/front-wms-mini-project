<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">재고 조회</div>
    <q-table :rows="rows" :columns="columns" row-key="rowKey" flat bordered />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const rows = ref([])
const columns = [
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'itemNm', label: '품목', field: 'itemNm', align: 'left' },
  { name: 'locCd', label: '로케이션', field: 'locCd', align: 'left' },
  { name: 'qty', label: '수량', field: 'qty', align: 'right' }
]

async function fetchList() {
  const { data } = await api.get('/api/stocks')
  rows.value = data.map((r, idx) => ({ ...r, rowKey: idx }))
}

onMounted(fetchList)
</script>