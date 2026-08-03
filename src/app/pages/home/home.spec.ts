// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Home } from './home';

describe('Home', () => {
  let component: Home;

  beforeEach(() => {
    component = new Home();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Approver', () => {
    expect(component).toBeInstanceOf(Home);
  });
});