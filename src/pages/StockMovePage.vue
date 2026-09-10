<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">재고이동</div>

    <q-card flat bordered class="q-pa-md q-mb-lg" style="max-width: 700px">
      <div class="row q-col-gutter-md">
        <q-select
            class="col-6"
            v-model="form.whCd"
            :options="warehouseOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="창고"
            @update:model-value="onContextChange"
        />
        <q-select
            class="col-6"
            v-model="form.itemCd"
            :options="itemOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="품목"
            @update:model-value="onContextChange"
        />
        <q-select
            class="col-6"
            v-model="form.fromLocCd"
            :options="fromLocOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="출발 로케이션 (현재 재고)"
        />
        <q-input class="col-6" v-model="form.toLocCd" label="도착 로케이션" placeholder="예: B-02-03" />
        <q-input class="col-6" v-model.number="form.moveQty" type="number" label="이동수량" />
      </div>

      <q-btn class="q-mt-md" color="primary" label="이동 실행" @click="move" />
    </q-card>

    <div class="text-subtitle1 q-mb-sm">재고이동 이력</div>
    <q-table :rows="rows" :columns="columns" row-key="moveNo" flat bordered />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const warehouseOptions = ref([])
const itemOptions = ref([])
const fromLocOptions = ref([])
const rows = ref([])

const form = ref({ whCd: '', itemCd: '', fromLocCd: '', toLocCd: '', moveQty: 1 })

const columns = [
  { name: 'moveNo', label: '이동번호', field: 'moveNo', align: 'left' },
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'itemNm', label: '품목', field: 'itemNm', align: 'left' },
  { name: 'fromLocCd', label: '출발', field: 'fromLocCd', align: 'center' },
  { name: 'toLocCd', label: '도착', field: 'toLocCd', align: 'center' },
  { name: 'moveQty', label: '수량', field: 'moveQty', align: 'right' }
]

async function fetchOptions() {
  const [wh, it] = await Promise.all([
    api.get('/api/warehouses'),
    api.get('/api/items')
  ])
  warehouseOptions.value = wh.data.map(w => ({ label: w.whNm, value: w.whCd }))
  itemOptions.value = it.data.map(i => ({ label: i.itemNm, value: i.itemCd }))
}

async function onContextChange() {
  form.value.fromLocCd = ''
  if (!form.value.whCd || !form.value.itemCd) {
    fromLocOptions.value = []
    return
  }
  const { data } = await api.get('/api/stocks')
  fromLocOptions.value = data
      .filter(s => s.whCd === form.value.whCd && s.itemCd === form.value.itemCd && s.qty > 0)
      .map(s => ({ label: `${s.locCd} (재고 ${s.qty})`, value: s.locCd }))
}

async function fetchHistory() {
  const { data } = await api.get('/api/stock-moves')
  rows.value = data
}

async function move() {
  try {
    await api.post('/api/stock-moves', form.value)
    Notify.create({ type: 'positive', message: '재고이동이 완료되었습니다.' })
    form.value = { whCd: form.value.whCd, itemCd: form.value.itemCd, fromLocCd: '', toLocCd: '', moveQty: 1 }
    onContextChange()
    fetchHistory()
  } catch (e) {
    const msg = e.response?.data?.message || '재고이동 처리 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

onMounted(() => {
  fetchOptions()
  fetchHistory()
})
</script>