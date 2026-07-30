import { Component } from '@angular/core';
import { Grid as HomeGrid } from './grid/grid';
import { Hero as HomeHero } from './hero/hero';
import { NavBar as HomeNavBar } from '../../components/nav-bar/nav-bar';

@Component({
  selector: 'app-home',
  imports: [HomeNavBar, HomeHero, HomeGrid],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
