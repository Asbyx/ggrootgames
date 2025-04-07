#!/usr/bin/env node

/**
 * This script generates a Cloudflare deployment URL based on the project name
 * in wrangler.toml and the Cloudflare account's workers subdomain.
 */

const fs = require('fs');
const path = require('path');
const toml = require('toml');

// Read wrangler.toml
const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
const wranglerConfig = toml.parse(wranglerContent);

// Get project name from wrangler.toml
const projectName = wranglerConfig.name;

// Get workers subdomain from environment variable or use default
const workersSubdomain = process.env.CF_WORKERS_SUBDOMAIN || 'workers.dev';

// Generate deploy URL
const deployUrl = `https://${projectName}.${workersSubdomain}`;

console.log('Your Root Games Tracker is deployed at:');
console.log(deployUrl); 