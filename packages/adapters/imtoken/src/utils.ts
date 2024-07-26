import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportImToken() {
    return !!(window as any).imToken && !!window.tronWeb;
}

export function openImTokenApp() {
    if (isInMobileBrowser() && !supportImToken()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + hash;
        location.href = `imtokenv2://navigate/DappView?url=${encodeURIComponent(url)}`;
        return true;
    }
    return false;
}
