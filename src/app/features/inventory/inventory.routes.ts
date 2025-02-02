import { Routes } from '@angular/router';
import { InventoryManagementComponent } from './components/inventory-management.component';
import { ProductListComponent } from './components/product-list.component';
import { BatchOperationListComponent } from './components/batch-operation-list.component';
import { AlertListComponent } from './components/alert-list.component';
import { TransferListComponent } from './components/transfer-list.component';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryManagementComponent,
    children: [
      {
        path: '',
        component: ProductListComponent
      },
      {
        path: 'batch-operations',
        component: BatchOperationListComponent
      },
      {
        path: 'alerts',
        component: AlertListComponent
      },
      {
        path: 'transfers',
        component: TransferListComponent
      }
    ]
  }
];