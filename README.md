# prebuildify-cross

**Compile prebuilds in Docker, supporting Linux (including Debian 8, Ubuntu 14.04, RHEL 7, CentOS 7 and up), Alpine Linux, ARM Linux devices like the Raspberry Pi and mobile ARM devices like Android.**

Runs [`prebuildify`](https://github.com/mafintosh/prebuildify) in the preconfigured [`prebuild/docker-images`](https://github.com/prebuild/docker-images) to compile and name prebuilds for a certain platform. This means you don't have to worry about GCC flags, environment variables or system dependencies. In addition, `prebuildify-cross` copies only npm package files to Docker (following the rules of `.npmignore` and `files`) and mounts `node_modules` removing the need for a repeated `npm install`.

## Install

Depends on having Docker installed, as well as `prebuildify` and `node-gyp`:

```
npm install --save-dev prebuildify node-gyp prebuildify-cross
```

## Usage

The `prebuildify-cross` cli wraps `prebuildify` and passes all command line arguments on to `prebuildify` or `npm run prebuild` if such a script exists in your `package.json`. For example, with the following setup you could run `prebuildify-cross` without arguments:

```json
{
  "scripts": {
    "prebuild": "prebuildify -t 8.14.0 --napi --strip"
  }
}
```

Without that script, you could run `prebuildify-cross -t 8.14.0 --napi --strip` to the same effect. If you combine both approaches, arguments will be concatenated.

By default `prebuildify-cross` makes prebuilds for [all platforms](#images). To override, pass one or more `--image` or `-i` arguments:

```
prebuildify-cross -i linux -i alpine [..]
```

This is the only argument specific to `prebuildify-cross`, which does however respect the `--cwd` argument of `prebuildify`.

## Images

### `centos7-devtoolset7`

Aliased as `linux`.

Compile in CentOS 7, as a better alternative to (most commonly) Ubuntu on Travis. Makes the prebuilt binary compatible with Debian 8, Ubuntu 14.04, RHEL 7, CentOS 7 and other Linux flavors with an old glibc.

By default the prebuild will be [tagged](https://github.com/prebuild/prebuildify#options) with the libc flavor to set it apart from Alpine prebuilds, e.g. `linux-x64/node.libc.node`.

### `alpine`

Compile in Alpine, which uses musl instead of glibc and therefore can't run regular linux prebuilds. Worse, it sometimes does successfully _load_ such a  prebuild during `npm install` - which prevents a compilation fallback from kicking in - and then segfaults at runtime.

By default the prebuild will be [tagged](https://github.com/prebuild/prebuildify#options) with the libc flavor, e.g. `linux-x64/node.musl.node`.

### `linux-armv7` and `linux-arm64`

Cross-compile for Linux ARM. These images thinly wrap [`dockcross`](https://github.com/dockcross/dockcross) images.

By default the prebuild will be [tagged](https://github.com/prebuild/prebuildify#options) with the armv version (7 or 8, respectively).

### `android-armv7` and `android-arm64`

Cross-compile for Android ARM. These images thinly wrap [`dockcross`](https://github.com/dockcross/dockcross) images.

By default the prebuild will be [tagged](https://github.com/prebuild/prebuildify#options) with the armv version (7 or 8, respectively).

## References

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)
- [Rust cross-compiling tutorial](https://github.com/japaric/rust-cross)
- [Rust cross-compilation tool](https://github.com/rust-embedded/cross)

## License

GPL-3.0
