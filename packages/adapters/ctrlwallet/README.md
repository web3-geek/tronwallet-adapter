# `@tronweb3/tronwallet-adapter-ctrlwallet`

This package provides an adapter to enable TRON DApps to connect to the [Ctrl Wallet extension](https://chromewebstore.google.com/detail/ctrl-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf).

## Demo

```typescript
import { CtrlWalletAdapter } from '@tronweb3/tronwallet-adapter-ctrlwallet';
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': 'your api key' },
});

const adapter = new CtrlWalletAdapter();
// connect
await adapter.connect();

// then you can get address
console.log(adapter.address);

// create a send TRX transaction
const unSignedTransaction = await tronWeb.transactionBuilder.sendTrx(targetAddress, 100, adapter.address);
// using adapter to sign the transaction
const signedTransaction = await adapter.signTransaction(unSignedTransaction);
// broadcast the transaction
await tronWeb.trx.sendRawTransaction(signedTransaction);
```

## Documentation

### API

-   `Constructor(config: CtrlWalletAdapterConfig)`
    ```typescript
    interface CtrlWalletAdapterConfig {
        /**
         * Set if open Wallet's website url when wallet is not installed.
         * Default is true.
         */
        openUrlWhenWalletNotFound?: boolean;
        /**
         * Timeout in millisecond for checking if TronLink wallet exists.
         * Default is 30 * 1000ms
         */
        checkTimeout?: number;
        /**
         * Set if open TronLink app using DeepLink on mobile device.
         * Default is true.
         */
        openTronLinkAppOnMobile?: boolean;
        /**
         * The icon of your dapp. Used when open TronLink app in mobile device browsers.
         * Default is current website icon.
         */
        dappIcon?: string;
        /**
         * The name of your dapp. Used when open TronLink app in mobile device browsers.
         * Default is `document.title`.
         */
        dappName?: string;
    }
    ```
-   `network()` method is supported to get current network information. The type of returned value is `Network` as follows:

    ```typescript
    export enum NetworkType {
        Mainnet = 'Mainnet',
        Shasta = 'Shasta',
        Nile = 'Nile',
        /**
         * When use custom node
         */
        Unknown = 'Unknown',
    }

    export type Network = {
        networkType: NetworkType;
        chainId: string;
        fullNode: string;
        solidityNode: string;
        eventServer: string;
    };
    ```

### Caveats

-   **Ctrl Wallet doesn't support `disconnect` by DApp**. As CtrlWalletAdapter doesn't support disconnect by DApp website, call `adapter.disconnect()` won't disconnect from Ctrl Wallet extension really.

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/web3-geek/tronwallet-adapter/tree/main/packages/adapters/adapters)
