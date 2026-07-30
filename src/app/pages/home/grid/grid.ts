import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'home-grid',
  imports: [
    MatCardModule
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid {}
