import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NavBar as RequesterNavBar } from '../../components/nav-bar/nav-bar';
import { RequestBoard } from './request-board/request-board';

@Component({
  selector: 'app-requester',
  imports: [MatButtonModule, RequesterNavBar, RequestBoard],
  templateUrl: './requester.html',
  styleUrl: './requester.scss',
})
export class Requester {}
