import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApproveBoard } from './approve-board/approve-board';
import { NavBarApprover } from '../../components/nav-bar-approver/nav-bar-approver';

@Component({
  selector: 'app-approver',
  imports: [RouterLink, NavBarApprover, ApproveBoard],
  templateUrl: './approver.html',
  styleUrl: './approver.scss',
})
export class Approver {}
