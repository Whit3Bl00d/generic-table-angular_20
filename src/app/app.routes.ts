import { Routes } from '@angular/router';
import { HOUSEHOLD_ROUTES } from './features/household/household.routes';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'household' },
	{ path: 'household', children: HOUSEHOLD_ROUTES },
];
