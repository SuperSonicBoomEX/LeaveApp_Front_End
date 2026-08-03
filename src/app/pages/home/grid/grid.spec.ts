// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Grid } from './grid';

describe('Grid', () => {
  let component: Grid;

  beforeEach(() => {
    component = new Grid();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Approver', () => {
    expect(component).toBeInstanceOf(Grid);
  });
});