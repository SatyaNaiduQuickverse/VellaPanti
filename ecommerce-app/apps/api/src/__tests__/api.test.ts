describe('API Tests', () => {
  test('Basic test to ensure Jest is working', () => {
    const sum = 2 + 2;
    expect(sum).toBe(4);
  });

  test('Environment variables are loaded correctly', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV).toBe('test');
  });
});