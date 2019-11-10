'use strict'

// Also requires glob (npm/npm-packlist#42)
const packlist = require('npm-packlist')
const tar = require('tar-fs')
const unixify = require('unixify')
const once = require('once')
const cp = require('child_process')
const path = require('path')
const fs = require('fs')

module.exports = function (opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = null
  }

  opts = opts || {}
  callback = once(callback)

  const images = [].concat(opts.image || [])
  const cwd = path.resolve(opts.cwd || '.')

  if (!images.length) {
    images.push('centos7-devtoolset7')
    images.push('alpine')
    images.push('linux-armv7')
    images.push('linux-arm64')
    images.push('android-armv7')
    images.push('android-arm64')
  }

  const script = guestScript(packageFiles(cwd))
  const scriptArgs = opts.args || []

  loop()

  function loop () {
    let image = images.shift()
    if (!image) return process.nextTick(callback)
    if (image === 'linux') image = 'centos7-devtoolset7'

    const args = [
      'run',
      '--rm',
      ...env(),
      ...user(),
      ...volume(cwd, '/input'),
      'prebuild/' + image,
      ...command(script),
      ...rest(scriptArgs, image)
    ]

    console.error('Prebuild', image)

    const stdio = ['ignore', 'pipe', 'inherit']
    const child = cp.spawn('docker', args, { cwd, stdio })
    const prebuilds = path.join(cwd, 'prebuilds')

    child.on('error', callback)
    child.on('exit', onexit)

    child.stdout
      .pipe(tar.extract(prebuilds), { dmode: 0o755, fmode: 0o644 })
      .on('finish', loop)
      .on('error', callback)
  }

  function onexit (code) {
    if (code) return callback(new Error('Exited with code ' + code))
  }
}

function packageFiles (dir) {
  return packlist.sync({ dir }).filter(function (fp) {
    return !/^prebuilds[/\\]/i.test(fp)
  })
}

function guestScript (files) {
  return fs.readFileSync(require.resolve('./guest.js'), 'utf8')
    .replace('const files = []', `const files = ${JSON.stringify(files)}`)
}

function volume (host, guest) {
  return ['-v', cygwin(host) + ':' + guest + ':ro']
}

function env () {
  // Disable npm update check
  return ['-e', 'NO_UPDATE_NOTIFIER=true']
}

function user () {
  return ['-u', 'node']
}

function command (script) {
  return ['node', '-e', script]
}

function rest (scriptArgs, image) {
  const rest = scriptArgs.slice()

  if (/^(linux|android)-arm/.test(image)) rest.push('--tag-armv')
  if (/^(centos|alpine)/.test(image)) rest.push('--tag-libc')

  return rest.length ? ['--'].concat(rest) : []
}

function cygwin (fp) {
  if (process.platform !== 'win32') return fp
  if (!truthy(process.env.COMPOSE_CONVERT_WINDOWS_PATHS)) return fp

  const unix = unixify(fp)
  const drive = fp.match(/^([A-Z]):/i)

  return drive ? '/' + drive[1].toLowerCase() + unix : unix
}

function truthy (str) {
  return str === 'true' || str === '1'
}
