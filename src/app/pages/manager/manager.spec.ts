// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Manager } from './manager';

describe('Manager', () => {
  let component: Manager;

  beforeEach(() => {
    component = new Manager();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Approver', () => {
    expect(component).toBeInstanceOf(Manager);
  });
});