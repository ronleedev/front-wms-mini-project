<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>WMS Mini</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above bordered>
      <q-list>
        <q-item clickable to="/shipper">
          <q-item-section>화주 관리</q-item-section>
        </q-item>
        <q-item clickable to="/warehouse">
          <q-item-section>창고 관리</q-item-section>
        </q-item>
        <q-item clickable to="/item">
          <q-item-section>품목 관리</q-item-section>
        </q-item>
        <q-item clickable to="/plan">
          <q-item-section>입고 예정 관리</q-item-section>
        </q-item>
        <q-item clickable to="/recv">
          <q-item-section>입고 실적 관리</q-item-section>
        </q-item>
        <q-item clickable to="/stock">
          <q-item-section>재고 관리</q-item-section>
        </q-item>
        <q-item clickable to="/stockMove">
          <q-item-section>재고 이동</q-item-section>
        </q-item>
        <q-item clickable to="/stockAdjMove">
          <q-item-section>재고 조정</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
</script>
