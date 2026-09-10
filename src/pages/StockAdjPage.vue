<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">재고조정</div>

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
            @update:model-value="checkCurrentQty"
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
            @update:model-value="checkCurrentQty"
        />
        <q-input class="col-6" v-model="form.locCd" label="로케이션" @blur="checkCurrentQty" />
        <q-input class="col-6" v-model.number="form.adjQty" type="number" label="조정수량 (증가 +, 감소 -)" />
        <q-input class="col-12" v-model="form.reason" label="조정사유" placeholder="예: 실사 차이, 파손, 오배송 등" />
      </div>

      <div class="q-mt-sm text-caption" v-if="currentQty !== null">
        현재 재고: {{ currentQty }} → 조정 후: {{ currentQty + (form.adjQty || 0) }}
      </div>

      <q-btn class="q-mt-md" color="primary" label="조정 실행" @click="adjust" />
    </q-card>

    <div class="text-subtitle1 q-mb-sm">재고조정 이력</div>
    <q-table :rows="rows" :columns="columns" row-key="adjNo" flat bordered />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const warehouseOptions = ref([])
const itemOptions = ref([])
const rows = ref([])
const currentQty = ref(null)

const form = ref({ whCd: '', itemCd: '', locCd: '', adjQty: 0, reason: '' })

const columns = [
  { name: 'adjNo', label: '조정번호', field: 'adjNo', align: 'left' },
  { name: 'whNm', label: '창고', field: 'whNm', align: 'left' },
  { name: 'itemNm', label: '품목', field: 'itemNm', align: 'left' },
  { name: 'locCd', label: '로케이션', field: 'locCd', align: 'center' },
  { name: 'beforeQty', label: '조정전', field: 'beforeQty', align: 'right' },
  { name: 'adjQty', label: '조정수량', field: 'adjQty', align: 'right' },
  { name: 'afterQty', label: '조정후', field: 'afterQty', align: 'right' },
  { name: 'reason', label: '사유', field: 'reason', align: 'left' }
]

async function fetchOptions() {
  const [wh, it] = await Promise.all([
    api.get('/api/warehouses'),
    api.get('/api/items')
  ])
  warehouseOptions.value = wh.data.map(w => ({ label: w.whNm, value: w.whCd }))
  itemOptions.value = it.data.map(i => ({ label: i.itemNm, value: i.itemCd }))
}

async function checkCurrentQty() {
  if (!form.value.whCd || !form.value.itemCd || !form.value.locCd) {
    currentQty.value = null
    return
  }
  const { data } = await api.get('/api/stocks')
  const found = data.find(
      s => s.whCd === form.value.whCd && s.itemCd === form.value.itemCd && s.locCd === form.value.locCd
  )
  currentQty.value = found ? found.qty : 0
}

async function fetchHistory() {
  const { data } = await api.get('/api/stock-adjustments')
  rows.value = data
}

async function adjust() {
  try {
    await api.post('/api/stock-adjustments', form.value)
    Notify.create({ type: 'positive', message: '재고조정이 완료되었습니다.' })
    form.value = { whCd: form.value.whCd, itemCd: form.value.itemCd, locCd: form.value.locCd, adjQty: 0, reason: '' }
    checkCurrentQty()
    fetchHistory()
  } catch (e) {
    const msg = e.response?.data?.message || '재고조정 처리 중 오류가 발생했습니다.'
    Notify.create({ type: 'negative', message: msg })
  }
}

onMounted(() => {
  fetchOptions()
  fetchHistory()
})
</script>