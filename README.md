# prebuildify-cross

cross-compile [prebuild](https://github.com/mafintosh/prebuildify)s

## background

i want to build native modules for [Scuttlebutt](https://scuttlebutt.nz) pubs, to use on ARM Linux devices like the Raspberry Pi. meanwhile, i also want to support mobile ARM devices like Android.

## how does it work?

`prebuildify-cross` will:

- build a Docker image for your intended target, based on the respective [`dockcross`](https://github.com/dockcross/dockcross) image
- create a Docker container with your input (default is `.`) mounted inside
- run `npm install --ignore-scripts` and `npm run prebuild`
- copy out `./prebuilds` from the container to your output (default is `./prebuilds`)

## supported targets

- `prebuildify-cross --platform=linux --arch=x32`
- `prebuildify-cross --platform=linux --arch=x64`
- `prebuildify-cross --platform=linux --arch=arm --arm-version=5`
- `prebuildify-cross --platform=linux --arch=arm --arm-version=6`
- `prebuildify-cross --platform=linux --arch=arm --arm-version=7`
- `prebuildify-cross --platform=linux --arch=arm64`
- `prebuildify-cross --platform=android --arch=arm --arm-version=7`
- `prebuildify-cross --platform=android --arch=arm64`

## usage

(note: `prebuildify-cross` depends on having Docker installed.)

in the module you want to cross-compile prebuilds,

ensure you have an npm script `prebuild`, like:

```
{
  "scripts": {
    "prebuild": "prebuildify --all --strip"
  }
}
```

then install `prebuildify-cross` as a dev-dependency:

```
npm install --save-dev prebuildify-cross
```

then add new `prebuild:cross:${TARGET}` scripts for the targets you want to support:

```
{
  "scripts": {
    "prebuild:cross:linux-armv7": "prebuildify-cross --platform linux --arch arm --arm-version 7",
    "prebuild:cross:android-armv7": "prebuildify-cross --platform android --arch arm --arm-version 7"
  }
}
```

then when you want to cross-compile prebuilds, `npm run` the appropriate script.

for the full command-line usage:

```
Usage:
  prebuildify-cross [options]

  Arguments:

    --arch <arch>: **required** architecture (supported: x32, x64, arm, arm64)
    --arm-version <version>: if using arm architecture, **required* arm version (supported: 5, 6, 7, 8)
    --platform: **required** platform (supported: linux, android)

    --input <path>: _optional_ directory of input image spec (default: cwd)
    --output <path>: _optional_ directory to output build results (default: prebuilds)

  Flags:

    -h, --help: show this usage

  Examples:

    prebuildify-cross --platform linux --arch x64

    prebuildify-cross --platform linux --arch arm --arm-version 7

    prebuildify-cross --platform linux --arch arm64

    prebuildify-cross --platform android --arch arm --arm-version 7

    prebuildify-cross --platform android --arch arm64
```

you can also pass in environment variables instead of command-line arguments, e.g.

```shell
PLATFORM=linux ARCH=arm ARM_VERSION=7 prebuildify-cross
```

## references

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)
- [Rust cross-compiling tutorial](https://github.com/japaric/rust-cross)
- [Rust cross-compilation tool](https://github.com/rust-embedded/cross)
- [`leveldown` cross-compilation discussion](https://github.com/Level/leveldown/pull/572)

## license

GPL-3.0
