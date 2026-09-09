const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'shipper', component: () => import('pages/ShipperPage.vue') },
      { path: 'warehouse', component: () => import('pages/WarehousePage.vue') },
      { path: 'item', component: () => import('pages/ItemPage.vue') }
    ]
  }
]

export default routes
