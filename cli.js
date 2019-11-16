#!/usr/bin/env node
'use strict'

const argv = process.argv.slice(2)

const opts = require('minimist')(argv, {
  string: ['image', 'cwd'],
  alias: { image: 'i' }
})

require('.')({ argv, ...opts }, function (err) {
  if (err) throw err
})
