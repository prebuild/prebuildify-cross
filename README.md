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

By default [`prebuild/docker-images`](https://github.com/prebuild/docker-images) are used which are publicly hosted on the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (`ghcr.io`). It's possible to use custom images with e.g. `-i my-namespace/my-image`. Image arguments that don't contain a forward slash are expanded to `ghcr.io/prebuild/<image>` and if these don't contain a tag they're further expanded to `ghcr.io/prebuild/<image>:<version>` where `version` is currently 2.

To use `latest` images (not recommended) an image tag must be specified explicitly. For example:

```
prebuildify-cross -i linux-armv7:latest -t ..
```

## Images

- [`centos7-devtoolset7`](https://github.com/prebuild/docker-images#centos7-devtoolset7)
- [`alpine`](https://github.com/prebuild/docker-images#alpine)
- [`linux-armv6`](https://github.com/prebuild/docker-images#linux-armv6)
- [`linux-armv7`](https://github.com/prebuild/docker-images#linux-armv7)
- [`linux-arm64`](https://github.com/prebuild/docker-images#linux-arm64)
- [`android-armv7`](https://github.com/prebuild/docker-images#android-armv7)
- [`android-arm64`](https://github.com/prebuild/docker-images#android-arm64)

## References

- [Debian multiarch tuples](https://wiki.debian.org/Multiarch/Tuples)
- [Rust support tuples](https://forge.rust-lang.org/platform-support.html)
- [GCC flags](https://stackoverflow.com/questions/16044020/gcc-and-linking-environment-variables-and-flags)
- [Arm options](https://gcc.gnu.org/onlinedocs/gcc/ARM-Options.html)
- [Rust cross-compiling tutorial](https://github.com/japaric/rust-cross)
- [Rust cross-compilation tool](https://github.com/rust-embedded/cross)

## License

GPL-3.0
