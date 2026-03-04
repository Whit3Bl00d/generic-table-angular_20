import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HouseholdDashboardComponent } from './features/household/pages/household-dashboard/household-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HouseholdDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
