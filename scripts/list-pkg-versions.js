/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EVM_PKGS = [
    '@tronweb3/abstract-adapter-evm',
    '@tronweb3/tronwallet-adapter-metamask',
    '@tronweb3/tronwallet-adapter-tronlink-evm',
];
const DIRS = [path.resolve(__dirname, '../packages/adapters'), path.resolve(__dirname, '../packages/react')];
const pkgVersions = [];
const pkgsToBeReleased = [];
DIRS.forEach((dir) => {
    const subDirs = fs.readdirSync(dir).filter((pkg) => !pkg.startsWith('.'));
    subDirs.forEach((pkg) => {
        try {
            const { name, version } = JSON.parse(fs.readFileSync(path.resolve(dir, pkg, 'package.json')));
            pkgVersions.push({
                name,
                version,
            });
        } catch (e) {
            console.error(e);
        }
    });
});

pkgVersions.forEach(({ name, version }) => {
    try {
        const oldVersion = execSync(`npm view ${name} version`, { stdio: 'pipe' }).toString().trim();
        console.log(`${name}: ${oldVersion} -> ${version}`);
        if (oldVersion !== version) {
            pkgsToBeReleased.push({ name, version });
        }
    } catch (e) {
        if (e.toString().includes('E404')) {
            console.log(`${name}: 0.0.0 -> ${version}`);
            pkgsToBeReleased.push({ name, version });
        }
        // ignore
    }
});
console.log('\nPackages to be released: ');
pkgsToBeReleased.forEach(({ name, version }) => {
    console.log(`${name}: ${version}`);
});

console.log('\nTag Content: ');
console.log('TRON');
pkgVersions
    .filter(({ name }) => !EVM_PKGS.includes(name))
    .forEach(({ name, version }) => {
        console.log(`- [${name}@${version}](https://www.npmjs.com/package/${name})`);
    });

console.log('\nEVM');
pkgVersions
    .filter(({ name }) => EVM_PKGS.includes(name))
    .forEach(({ name, version }) => {
        console.log(`- [${name}@${version}](https://www.npmjs.com/package/${name})`);
    });
