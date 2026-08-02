// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Approver } from './approver';

describe('Approver', () => {
  let component: Approver;

  beforeEach(() => {
    component = new Approver();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Approver', () => {
    expect(component).toBeInstanceOf(Approver);
  });
});
