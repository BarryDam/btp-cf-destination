import { hello } from './index';

describe(__filename, () => {
  it('should return "hello world"', () => {
    const result = hello();
    expect(result).toBe('hello world');
  });
});
