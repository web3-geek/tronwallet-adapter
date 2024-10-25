import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportFoxWallet() {
    return (
        !!isInMobileBrowser && !!(window.foxwallet && window.foxwallet.tronLink && window.foxwallet.tronLink.tronWeb)
    );
}

export function openFoxWallet() {
    if (isInMobileBrowser() && !supportFoxWallet()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + hash;
        location.href = `foxwallet://dapp?url=${encodeURIComponent(url)}`;
        return true;
    }
    return false;
}
