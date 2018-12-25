# prebuildify-cross

cross-compile [prebuild](https://github.com/mafintosh/prebuildify)s

## background

i want to build native modules for [Scuttlebutt](https://scuttlebutt.nz) pubs, to use on ARM Linux devices like the Raspberry Pi. meanwhile, i also want to support mobile ARM devices like Android.

## how does it work?

`prebuildify-cross` will:

- build a Docker image for your intended target, based on the respective [`dockcross`](https://github.com/dockcross/dockcross) image
- create a Docker container with your input (default is `.`) mounted inside
- run `npm install --no-scripts` and `npm run prebuild`
- copy out `./prebuilds` from the container to your output (default is `./prebuilds`)

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

then install `prebuild-cross` as a dev-dependency:

```
npm install --save-dev prebuild-cross
```

then add new `prebuild:cross:${TARGET}` scripts for the targets you want to support:

```
{
  "scripts": {
    "prebuild:cross:linux-armv7": "prebuildify-cross --target linux-armv7",
    "prebuild:cross:android-arm": "prebuildify-cross --target android-arm"
  }
}
```

then when you want to cross-compile prebuilds, `npm run` the appropriate script.

for the full command-line usage:

```
Usage:
  prebuildify-cross [options]

  Arguments:

    --target <target>: **required** cross-compilation target 
        (see https://github.com/dockcross/dockcross#cross-compilers)
    --input <path>: _optional_ directory of input image spec (default: cwd)
    --output <path>: _optional_ directory to output build results (default: prebuilds)
    --name <name>: _optional_ name of image

  Flags:

    -h, --help: show this usage

  Examples:

    prebuildify-cross --target linux-armv7
```


## references

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)

## license

GPL-3.0
