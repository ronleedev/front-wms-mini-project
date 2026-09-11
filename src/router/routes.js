const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'shipper', component: () => import('pages/ShipperPage.vue') },
      { path: 'warehouse', component: () => import('pages/WarehousePage.vue') },
      { path: 'item', component: () => import('pages/ItemPage.vue') },
      { path: 'plan', component: () => import('pages/PlanPage.vue') },
      { path: 'recv', component: () => import('pages/ReceiptPage.vue') },
      { path: 'stock', component: () => import('pages/StockPage.vue') },
      { path: 'stockMove', component: () => import('pages/StockMovePage.vue') },
      { path: 'stockAdjMove', component: () => import('pages/StockAdjPage.vue') },
      { path: 'ship', component: () => import('pages/ShipPage.vue') },
      { path: 'shipAlloc', component: () => import('pages/shipAllocPage.vue') },
      { path: 'pickList', component: () => import('pages/PickListPage.vue') },
      { path: 'pick', component: () => import('pages/PickingPage.vue') },
      { path: 'Inspection', component: () => import('pages/InspectionPage.vue') },
    ]
  }
]

export default routes
