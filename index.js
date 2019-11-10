'use strict'

// Also requires glob (npm/npm-packlist#42)
const packlist = require('npm-packlist')
const tar = require('tar-fs')
const dockerPull = require('docker-pull')
const dockerRun = require('docker-run')
const logger = require('log-update')
const bytes = require('pretty-bytes')
const browserify = require('browserify')
const unixify = require('unixify')
const once = require('once')
const path = require('path')

module.exports = function (opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = null
  }

  opts = opts || {}
  callback = once(callback)

  const images = [].concat(opts.image || [])
  const cwd = path.resolve(opts.cwd || '.')
  const files = JSON.stringify(packageFiles(cwd))
  const prebuilds = path.join(cwd, 'prebuilds')
  const log = logger.create(process.stderr, { showCursor: true })

  if (!images.length) {
    images.push('centos7-devtoolset7')
    images.push('alpine')
    images.push('linux-armv7')
    images.push('linux-arm64')
    images.push('android-armv7')
    images.push('android-arm64')
  }

  loop()

  function loop () {
    let image = images.shift()
    if (!image) return process.nextTick(callback)
    if (image === 'linux') image = 'centos7-devtoolset7'
    if (!image.includes('/')) image = 'prebuild/' + image

    dockerPull(image)
      .on('progress', progress)
      .on('error', callback)
      .on('end', end)

    function progress () {
      const count = `${this.layers} layers`
      const ratio = `${bytes(this.transferred)} / ${bytes(this.length)}`

      log(`prebuildify-cross pull ${this.image}: ${count}, ${ratio}`)
    }

    function end () {
      log.done()
      run(this.image)
    }
  }

  function run (image) {
    console.error('prebuildify-cross run', image)

    const child = dockerRun(image, {
      entrypoint: 'node',
      argv: rest(opts.args || [], image),
      volumes: {
        [cygwin(cwd)]: '/input:ro' // mafintosh/docker-run#12
      },
      env: {
        PREBUILDIFY_CROSS_FILES: files,
        // Disable npm update check
        NO_UPDATE_NOTIFIER: 'true'
      }
    })

    child
      .on('error', callback)
      .on('exit', onexit)

    guestScript()
      .pipe(child.stdin)

    child.stderr
      .pipe(process.stderr)

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

function guestScript () {
  return browserify(require.resolve('./guest.js'), {
    basedir: __dirname,
    node: true
  }).bundle()
}

function rest (args, image) {
  const rest = ['-'].concat(args)

  if (/^prebuild\/(linux|android)-arm/.test(image)) rest.push('--tag-armv')
  if (/^prebuild\/(centos|alpine)/.test(image)) rest.push('--tag-libc')

  return rest
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
