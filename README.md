# prebuildify-cross

cross-compile [prebuild](https://github.com/mafintosh/prebuildify)s

## background

i want to build native modules for [Scuttlebutt](https://scuttlebutt.nz) pubs, to use on Arm Linux devices like the Raspberry Pi.

## install

```
npm install -g prebuild-cross
```

and you need Docker installed.

## usage

```
Usage:
  prebuild-cross [options]

  Arguments:

    --target <target>: **required** cross-compilation target 
        (see https://github.com/dockcross/dockcross#cross-compilers)
    --input <path>: _optional_ directory of input image spec (default: cwd)
    --output <path>: _optional_ directory to output build results (default: prebuilds)
    --name <name>: _optional_ name of image

  Flags:

    -h, --help: show this usage

  Examples:

    prebuild-cross --target linux-armv7
```

## references

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)

## license

GPL-3.0
