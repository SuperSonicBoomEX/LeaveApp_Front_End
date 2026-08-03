// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;

  beforeEach(() => {
    component = new Hero();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Approver', () => {
    expect(component).toBeInstanceOf(Hero);
  });
});