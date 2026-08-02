import { Component } from '@angular/core';
import { NavBarManager } from '../../components/nav-bar-manager/nav-bar-manager';
import { ManageBoard } from './manage-board/manage-board';

@Component({
  selector: 'app-manager',
  imports: [NavBarManager, ManageBoard],
  templateUrl: './manager.html',
  styleUrl: './manager.scss',
})
export class Manager {}
