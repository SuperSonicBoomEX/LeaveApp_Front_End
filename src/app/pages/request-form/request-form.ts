import { Component } from '@angular/core';
import { NavBar as RequestFormNavBar } from '../../components/nav-bar/nav-bar';
import { RequestFormCard } from './request-form-card/request-form-card';

@Component({
  selector: 'app-request-form',
  imports: [RequestFormNavBar, RequestFormCard
  ],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
})
export class RequestForm {}
