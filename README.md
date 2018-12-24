# prebuildify-cross

cross-compile [prebuild](https://github.com/mafintosh/prebuildify)s

## background

i want to build native modules for [Scuttlebutt](https://scuttlebutt.nz) pubs, to use on Arm Linux devices like the Raspberry Pi.

## example

with Docker installed:

```
git clone --recursive https://github.com/ahdinosaur/prebuildify-cross
cd prebuildify-cross
git submodule update --init --recursive
npm run example:leveldown:arm64
```

see more example inputs in [`./examples`](./examples)

## install

```
npm install -g prebuild-cross
```

## usage

```
Usage:
  prebuild-cross [options]

  Arguments:

    --arch <arch>: architecture - either arm or arm64
    --input <path>: required directory of input image spec
    --output <path>: required directory to output build results
    --name <name>: optional name of image

  Flags:

    -h, --help: show this usage
    -d, --docker: build image using docker

  Examples:

    prebuild-cross --docker --input ./examples/leveldown --output ./output
```

if using `--docker`, you need Docker installed.

if not using `--docker`, you need the following packages installed:

- `node`
- `libc6-dev`
- `build-essential`

for arm:

- `libc6-armhf-cross`
- `libc6-dev-armhf-cross`
- `gcc-arm-linux-gnueabihf`
- `g++-arm-linux-gnueabihf`

for arm64:

- `libc6-arm64-cross`
- `libc6-dev-arm64-cross`
- `gcc-aarch64-linux-gnu`
- `g++-aarch64-linux-gnu`

## references

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)

## license

GPL-3.0
