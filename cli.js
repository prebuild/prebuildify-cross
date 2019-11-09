#!/usr/bin/env node
'use strict'

const args = process.argv.slice(2)

const opts = require('minimist')(args, {
  string: ['image', 'cwd'],
  alias: { image: 'i' }
})

require('.')({ args, ...opts }, function (err) {
  if (err) throw err
})
