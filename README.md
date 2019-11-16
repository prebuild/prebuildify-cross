# prebuildify-cross

**Compile prebuilds in Docker, supporting Linux (including Debian 8, Ubuntu 14.04, RHEL 7, CentOS 7 and up), Alpine Linux, ARM Linux devices like the Raspberry Pi and mobile ARM devices like Android.**

Runs [`prebuildify`](https://github.com/mafintosh/prebuildify) in preconfigured [`prebuild/docker-images`](https://github.com/prebuild/docker-images) containers to compile and name prebuilds for a certain platform. This means you don't have to worry about GCC flags, environment variables or system dependencies. In addition, `prebuildify-cross` copies only npm package files to Docker (following the rules of `.npmignore` and `files`) and mounts `node_modules` removing the need for a repeated `npm install`.

## Install

Depends on having Docker installed, as well as `prebuildify` and `node-gyp`:

```
npm install --save-dev prebuildify node-gyp prebuildify-cross
```

## Usage

The `prebuildify-cross` cli forwards all command line arguments to `prebuildify`, but adds an `--image` or `-i` argument. For example, the following command will invoke `prebuildify -t 8.14.0 --napi --strip` in a CentOS container and copy the resulting prebuild to `./prebuilds`:

```
prebuildify-cross -i centos7-devtoolset7 -t 8.14.0 --napi --strip
```

To build for more than one platform, multiple `--image` arguments may be passed:

```
prebuildify-cross -i linux-armv7 -i linux-arm64 -t ..
```

Lastly, it's possible to use your own custom image with e.g. `-i my-namespace/my-image`.

## Images

### `centos7-devtoolset7`

Compile in CentOS 7, as a better alternative to (commonly) Ubuntu 16.04 on Travis. Makes the prebuild compatible with Debian 8, Ubuntu 14.04, RHEL 7, CentOS 7 and other Linux flavors with an old glibc.

> The neat thing about this is that you get to compile with gcc 7 but glibc 2.17, so binaries are compatible for \[among others] Ubuntu 14.04 and Debian 8.
>
> The RHEL folks put in a ton of work to make the devtoolsets work on their older base systems (libc mainly), which involves shipping a delta library that contains the new stuff that can be statically linked in where it's used. We use this method for building Node binary releases.
>
> \-- <cite>[**@rvagg**](https://github.com/rvagg) ([prebuild/docker-images#8](https://github.com/prebuild/docker-images/pull/8))</cite>

By default the prebuild will be [tagged](https://github.com/prebuild/prebuildify#options) with the libc flavor to set it apart from Alpine prebuilds, e.g. `linux-x64/node.libc.node`.

### `alpine`

Compile in Alpine, which uses musl instead of glibc and therefore can't run regular linux prebuilds. Worse, it sometimes does successfully _load_ such a  prebuild during `npm install` - which prevents a compilation fallback from kicking in - and then segfaults at runtime. You can fix this situation in two ways: by shipping an `alpine` prebuild and/or by shipping a `centos7-devtoolset7` prebuild, because the latter will be skipped in Alpine thanks to the `libc` tag.

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
