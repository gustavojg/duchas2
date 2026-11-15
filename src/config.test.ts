import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('commit sale de GIT_SHA, la variable que inyecta el staging de la fábrica', () => {
    expect(loadConfig({ GIT_SHA: 'abc1234' }).commit).toBe('abc1234');
    expect(loadConfig({ GIT_SHA: '  abc1234\n' }).commit).toBe('abc1234');
  });

  it('commit es «desconocido» si GIT_SHA falta o está vacío', () => {
    expect(loadConfig({}).commit).toBe('desconocido');
    expect(loadConfig({ GIT_SHA: '' }).commit).toBe('desconocido');
    expect(loadConfig({ GIT_SHA: '   ' }).commit).toBe('desconocido');
  });
});
