import {
    WalletConnectionError,
    WalletDisconnectedError,
    WalletNotFoundError,
    WalletSwitchChainError,
    AdapterState,
} from '@tronweb3/tronwallet-abstract-adapter';
import { CtrlWalletAdapter } from '../../src/index.js';
import { wait, ONE_MINUTE } from './utils.js';
import { MockTron, MockTronLink } from './mock.js';
import { waitFor } from '@testing-library/dom';
const noop = () => {
    //
};
window.open = jest.fn();
beforeEach(function () {
    jest.useFakeTimers();
    global.document = window.document;
    global.navigator = window.navigator;
    window.tronLink = undefined;
    window.tron = undefined;
});
describe('CtrlWalletAdapter', function () {
    describe('#adapter()', function () {
        test('constructor', () => {
            const adapter = new CtrlWalletAdapter();
            expect(adapter.name).toEqual('CtrlWallet');
            expect(adapter).toHaveProperty('icon');
            expect(adapter).toHaveProperty('url');
            expect(adapter).toHaveProperty('state');
            expect(adapter).toHaveProperty('address');
            expect(adapter).toHaveProperty('connecting');
            expect(adapter).toHaveProperty('connected');

            expect(adapter).toHaveProperty('connect');
            expect(adapter).toHaveProperty('disconnect');
            expect(adapter).toHaveProperty('signMessage');
            expect(adapter).toHaveProperty('signTransaction');
            expect(adapter).toHaveProperty('switchChain');

            expect(adapter).toHaveProperty('on');
            expect(adapter).toHaveProperty('off');
        });

        test('should work fine when Ctrl Wallet is not installed', async function () {
            (window as any).tronLink = undefined;
            const adapter = new CtrlWalletAdapter();
            expect(adapter.state).toEqual(AdapterState.Loading);
            expect(adapter.connected).toEqual(false);
            jest.advanceTimersByTime(ONE_MINUTE);
            await Promise.resolve();
            expect(adapter.state).toEqual(AdapterState.NotFound);
        });
        test('should work fine when Ctrl Wallet is installed but not connected', function () {
            (window as any).tronLink = {
                ready: false,
                tronWeb: false,
                request: noop,
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.connected).toEqual(false);
        });
        test('should work fine when Ctrl Wallet is connected', function () {
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: { base58: 'xxx' },
                },
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.connected).toEqual(true);
            expect(adapter.address).toEqual('xxx');
        });
    });
    describe('Tron protocol for TIP1193', function () {
        beforeEach(() => {
            jest.useFakeTimers();
        });
        test('should work fine when tron is disconnected', async function () {
            const tron = ((window as any).tron = new MockTron(''));
            tron.request = jest.fn(() => {
                return Promise.resolve(['xxx']);
            });
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            tron._unlock();
            tron._setAddress('xxx');
            await adapter.connect();
            jest.advanceTimersByTime(1000);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual('xxx');
        });
        test('should work fine when tron is connected', async function () {
            const onMethod = jest.fn();
            const removeListenerMethod = jest.fn();
            let tron: MockTron;
            (window as any).tron = tron = new MockTron('xxx');
            tron._unlock();
            tron.on = onMethod;
            tron.removeListener = removeListenerMethod;
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual('xxx');
            // accountsChanged, chainChanged
            expect(onMethod).toHaveBeenCalledTimes(2);

            await adapter.disconnect();
            expect(removeListenerMethod).toHaveBeenCalled();
        });
    });
    describe('#connect()', function () {
        test('should throw error when Ctrl Wallet is not installed', async function () {
            (window as any).tronLink = undefined;
            const adapter = new CtrlWalletAdapter();
            expect(adapter.connect()).rejects.toThrow(WalletNotFoundError);
        });
        test('should throw error when Ctrl Wallet is locked', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve('');
                },
            };
            const connecor = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should throw error when user denied the connection', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 4001 });
                },
            };
            const connecor = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should throw error when last connection is not completed', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 4000 });
                },
            };
            const connecor = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should work fine when TronLink is installed', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: noop,
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            await adapter.connect();
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual(address);
            expect(adapter.connected).toEqual(true);
        });
    });
    describe('#signMessage()', function () {
        test('should throw Disconnected error when Ctrl Wallet is not installed', async function () {
            jest.useFakeTimers();
            (window as any).tronLink = undefined;
            const adapter = new CtrlWalletAdapter();
            const res = adapter.signMessage('some str');
            jest.advanceTimersByTime(ONE_MINUTE);
            expect(res).rejects.toThrow(WalletDisconnectedError);
        });
        test('should throw Disconnected error when Ctrl Wallet is disconnected', async function () {
            (window as any).tronLink = {
                ready: false,
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.signMessage('some str')).rejects.toThrow(WalletDisconnectedError);
        });
        test('should work fine when Ctrl Wallet is connected', async function () {
            const tronLink = ((window as any).tronLink = new MockTronLink('address'));
            tronLink.tronWeb.trx.signMessageV2 = () => Promise.resolve('123') as any;
            tronLink._unlock();
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            await adapter.connect();
            const signedMsg = await adapter.signMessage('some str');
            expect(signedMsg).toEqual('123');
        });
    });
    describe('#signTransaction()', function () {
        test('should throw Disconnected error when Ctrl Wallet is not installed', async function () {
            (window as any).tronLink = undefined;
            const adapter = new CtrlWalletAdapter();
            expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletDisconnectedError);
        });
        test('should throw Disconnected error when Ctrl Wallet is disconnected', async function () {
            (window as any).tronLink = {
                ready: false,
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            try {
                await adapter.signTransaction({} as any);
            } catch (e) {
                expect(e).toBeInstanceOf(WalletDisconnectedError);
            }
        });
        test('should work fine when Ctrl Wallet is connected', async function () {
            jest.useFakeTimers();
            const tronLink = ((window as any).tronLink = new MockTronLink('address'));
            tronLink._unlock();
            tronLink.tronWeb.trx.sign = () => Promise.resolve('123') as any;
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            await adapter.connect();
            await Promise.resolve();
            const signedTransaction = await adapter.signTransaction({} as any);
            expect(signedTransaction).toEqual('123');
        });
    });

    describe('#switchChain', function () {
        test('should throw error and open link when Ctrl Wallet is not found', async function () {
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            await expect(adapter.switchChain('0x39483')).rejects.toThrow('The wallet is not found.');
            expect(window.open).toBeCalled();
        });
        test('should throw error when Ctrl Wallet do not support Tron protocol', async function () {
            (window as any).tronLink = {
                ready: false,
            };
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            await expect(adapter.switchChain('0x39483')).rejects.toThrowError(WalletSwitchChainError);
        });
        test('should work fine when Ctrl Wallet support Tron protocol', async function () {
            (window as any).tron = new MockTron('address');
            window.tron!.request = jest.fn();
            const adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
            await adapter.switchChain('0x39483');
            expect(window.tron!.request).toBeCalledTimes(1);
        });
    });
});

describe('Events should work fine', function () {
    let tronLink: MockTronLink;
    let adapter: CtrlWalletAdapter;
    beforeEach(() => {
        jest.useFakeTimers();
        tronLink = window.tronLink = new MockTronLink('address');
        tronLink._unlock();
        adapter = new CtrlWalletAdapter();
    });
    test('connect event should work fine', async () => {
        const _onConnect = jest.fn();
        tronLink = window.tronLink = new MockTronLink('');
        const adapter = new CtrlWalletAdapter();
        adapter.on('connect', _onConnect);
        jest.advanceTimersByTime(ONE_MINUTE);
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        expect(adapter.address).toEqual(null);
        setTimeout(() => {
            tronLink._setAddress('address');
            tronLink._unlock();
            tronLink._emit('connect', 'address');
        }, 100);
        jest.advanceTimersByTime(3000);
        await wait();
        expect(_onConnect).toHaveBeenCalled();
    });
    describe('accountsChanged event should work fine', () => {
        let tronLink: MockTronLink;
        let adapter: CtrlWalletAdapter;
        beforeEach(() => {
            jest.useFakeTimers();
            tronLink = window.tronLink = new MockTronLink('address');
            tronLink._unlock();
            adapter = new CtrlWalletAdapter();
            jest.advanceTimersByTime(3000);
        });
        test('when switch to a connected account', async () => {
            const _onAccountsChanged = jest.fn();
            const _onConnect = jest.fn();

            adapter.on('accountsChanged', _onAccountsChanged);
            adapter.on('connect', _onConnect);
            tronLink._setAddress('address');
            tronLink._emit('accountsChanged', { address: 'address2' });
            await wait();
            expect(_onAccountsChanged).toHaveBeenCalled();
            expect(_onConnect).not.toHaveBeenCalled();
        });
        test('when switch to a disconnected account', async () => {
            const _onAccountsChanged = jest.fn();
            const _onDisconnect = jest.fn();
            adapter.on('accountsChanged', _onAccountsChanged);
            adapter.on('disconnect', _onDisconnect);
            tronLink._setAddress('address');
            tronLink.ready = false;
            tronLink._emit('accountsChanged', { address: 'address' });
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            expect(_onAccountsChanged).toHaveBeenCalled();
            expect(_onDisconnect).toHaveBeenCalled();
        });
    });

    test('chainChanged event should work fine', () => {
        const _onChainChanged = jest.fn();
        adapter.on('chainChanged', _onChainChanged);
        jest.advanceTimersByTime(3000);
        tronLink._emit('setNode', { address: 'address' });
        expect(_onChainChanged).toHaveBeenCalled();
    });

    test('disconnect event should work fine', async () => {
        tronLink._unlock();
        const _onDisconnect = jest.fn();
        const adapter = new CtrlWalletAdapter();
        adapter.on('disconnect', _onDisconnect);
        jest.advanceTimersByTime(3000);
        tronLink._emit('disconnect', {});
        waitFor(() => {
            expect(_onDisconnect).toHaveBeenCalled();
        });
    });

    test('empty message should work fine', () => {
        tronLink._unlock();
        const _onDisconnect = jest.fn();
        const adapter = new CtrlWalletAdapter();
        adapter.on('disconnect', _onDisconnect);
        jest.advanceTimersByTime(3000);
        tronLink._emit('disconnect', false);
        expect(_onDisconnect).not.toHaveBeenCalled();
    });
});
