import { Component } from '@angular/core';
import { ApproveBoard } from './approve-board/approve-board';
import { NavBarApprover } from '../../components/nav-bar-approver/nav-bar-approver';

@Component({
  selector: 'app-approver',
  imports: [NavBarApprover, ApproveBoard],
  templateUrl: './approver.html',
  styleUrl: './approver.scss',
})
export class Approver {}
