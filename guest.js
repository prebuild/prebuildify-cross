'use strict'

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// TODO: fix permissions of WORKDIR in prebuild images
const cwd = '/home/node/app'
const files = JSON.parse(process.env.PREBUILDIFY_CROSS_FILES)
const argv = process.argv.slice(2)

// Copy host files to working directory
for (const file of files) {
  const a = path.join('/input', file)
  const b = path.join(cwd, file)

  fs.mkdirSync(path.dirname(b), { recursive: true })
  fs.copyFileSync(a, b, fs.constants.COPYFILE_EXCL)
  fs.chmodSync(b, 0o644)
}

const stdio = ['ignore', 2, 2]
const installResult = cp.spawnSync('npm', ['install', '--ignore-scripts'], { cwd, stdio })

if (installResult.status) process.exit(installResult.status)
if (installResult.error) throw installResult.error

const buildResult = cp.spawnSync('npx', ['--no-install', 'prebuildify', ...argv], { cwd, stdio })

if (buildResult.status) process.exit(buildResult.status)
if (buildResult.error) throw buildResult.error

// Write tarball to stdout. With this approach we don't need
// a writable volume and can avoid messing with permissions.
require('tar-fs').pack(path.join(cwd, 'prebuilds')).pipe(process.stdout)
