'use strict'

const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const argv = process.argv.slice(process.argv[1] === __filename ? 2 : 1)
const mode = 0o755
const fmod = 0o644
const files = []

// Would prefer /app but that's owned by root in the prebuild images
const cwd = '/home/node/app'

// Copy host files to working directory
for (const file of files) {
  const a = path.join('/input', file)
  const b = path.join(cwd, file)

  mkdirp(path.dirname(b), { mode })

  fs.copyFileSync(a, b, fs.constants.COPYFILE_EXCL)
  fs.chmodSync(b, fmod)
}

// Use node_modules of host to avoid a second install step
fs.symlinkSync('/input/node_modules', path.join(cwd, 'node_modules'))

const pkg = require(path.join(cwd, 'package.json'))
const scripts = pkg.scripts || {}

process.umask(0o777 - mode)

if (scripts.prebuild) {
  cp.spawnSync('npm', ['run', 'prebuild', '--', ...argv], { cwd, stdio: 'inherit' })
} else {
  cp.spawnSync('npx', ['prebuildify', ...argv], { cwd, stdio: 'inherit' })
}

// Copy prebuilds to host
cpr(path.join(cwd, 'prebuilds'), '/input/prebuilds')

function cpr (src, dst) {
  mkdirp(dst, { mode })

  for (const file of fs.readdirSync(src)) {
    const a = path.join(src, file)
    const b = path.join(dst, file)

    if (fs.statSync(a).isDirectory()) {
      cpr(a, b)
    } else {
      fs.copyFileSync(a, b) // , fs.constants.COPYFILE_EXCL)
      fs.chmodSync(b, fmod)
    }
  }
}

// Simple version of mkdirp.sync()
function mkdirp (dir, opts) {
  try {
    fs.mkdirSync(dir, opts)
  } catch (err) {
    if (err.code === 'EEXIST') return
    if (err.code !== 'ENOENT') throw err
    const parent = path.dirname(dir)
    if (parent !== dir) mkdirp(parent, opts)
    fs.mkdirSync(dir, opts)
  }
}
