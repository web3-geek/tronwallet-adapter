import { ImTokenAdapter } from '../../src/adapter.js';

describe('ImTokenAdapter', () => {
    test('should be defined', () => {
        expect(ImTokenAdapter).not.toBeNull();
    });
    test('#constructor() should work fine', () => {
        const adapter = new ImTokenAdapter();
        expect(adapter.name).toEqual('imToken Wallet');
    });
});
