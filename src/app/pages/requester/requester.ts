import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NavBar as RequesterNavBar } from '../../components/nav-bar/nav-bar';
import { RequestBoard } from './request-board/request-board';

@Component({
  selector: 'app-requester',
  imports: [RouterLink, MatButtonModule, RequesterNavBar, RequestBoard],
  templateUrl: './requester.html',
  styleUrl: './requester.scss',
})
export class Requester {}
