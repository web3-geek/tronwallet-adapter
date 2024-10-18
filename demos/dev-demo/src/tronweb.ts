// @ts-ignore
import TronWeb from 'tronweb';

export const tronWeb = new TronWeb({
    // fullHost: 'https://api.nileex.io',
    fullHost: 'https://api.trongrid.io',
    privateKey: 'e9c9e49a6525210b9745fbbfbaaed115860d6de883b166d728cc66bb496a57fa',
});
(window as any).tronWeb1 = tronWeb;
(window as any).TronWeb = TronWeb;
