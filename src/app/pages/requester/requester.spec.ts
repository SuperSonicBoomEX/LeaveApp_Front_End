// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { Requester } from './requester';

describe('Requester', () => {
  let component: Requester;

  beforeEach(() => {
    component = new Requester();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of Requester', () => {
    expect(component).toBeInstanceOf(Requester);
  });
});