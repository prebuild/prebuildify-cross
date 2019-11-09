'use strict'

// Also requires glob (npm/npm-packlist#42)
const packlist = require('npm-packlist')
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

    cp.spawn('docker', args, { cwd, stdio: 'inherit' })
      .on('error', callback)
      .on('exit', onexit)
  }

  function onexit (code) {
    if (code) return callback(new Error('Exited with code ' + code))
    loop()
  }
}

function packageFiles (dir) {
  return packlist.sync({ dir }).filter(function (fp) {
    return !/^(node_modules|prebuilds)[/\\]/i.test(fp)
  })
}

function guestScript (files) {
  return fs.readFileSync(require.resolve('./guest.js'), 'utf8')
    .replace('const files = []', `const files = ${JSON.stringify(files)}`)
}

function volume (host, guest) {
  return ['-v', cygwin(host) + ':' + guest]
}

function env () {
  // Disable npm update check
  return ['-e', 'NO_UPDATE_NOTIFIER=true']
}

function user () {
  // TODO: test
  // return ['-u', process.env.TRAVIS ? 'travis' : 'node']

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
