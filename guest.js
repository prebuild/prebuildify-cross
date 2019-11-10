'use strict'

const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const argv = process.argv.slice(process.argv[1] === __filename ? 2 : 1)
const files = []

// Would prefer /app but that's owned by root in the prebuild images
const cwd = '/home/node/app'

// Copy host files to working directory
for (const file of files) {
  const a = path.join('/input', file)
  const b = path.join(cwd, file)

  mkdirp(path.dirname(b))

  fs.copyFileSync(a, b, fs.constants.COPYFILE_EXCL)
  fs.chmodSync(b, 0o644)
}

// Use node_modules of host to avoid a second install step
fs.symlinkSync('/input/node_modules', path.join(cwd, 'node_modules'))

// TODO: bundle this
const tar = require(path.join(cwd, 'node_modules', 'tar-fs'))

const pkg = require(path.join(cwd, 'package.json'))
const scripts = pkg.scripts || {}
const stdio = ['ignore', 2, 2]

if (scripts.prebuild) {
  cp.spawnSync('npm', ['run', 'prebuild', '--', ...argv], { cwd, stdio })
} else {
  cp.spawnSync('npx', ['prebuildify', ...argv], { cwd, stdio })
}

// Write tarball to stdout. With this approach we don't need
// a writable volume and can avoid messing with permissions.
tar.pack(path.join(cwd, 'prebuilds')).pipe(process.stdout)

// Simple version of mkdirp.sync()
function mkdirp (dir) {
  try {
    fs.mkdirSync(dir)
  } catch (err) {
    if (err.code === 'EEXIST') return
    if (err.code !== 'ENOENT') throw err
    const parent = path.dirname(dir)
    if (parent !== dir) mkdirp(parent)
    fs.mkdirSync(dir)
  }
}
