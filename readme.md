# Advent Module - Models (Shared Logic)

This is a module for the Advent Services and contains the Models for MongoDB

## Installation

```bash
npm install faithfm/advent-module-shared

const { WebhookLogic } = require('advent-module-shared');
const { ProviderLogic } = require('advent-module-shared');
const { SettingsLogic } = require('advent-module-shared');
const { AuthLogic } = require('advent-module-shared');


# Auth Functions
    getTokenFromPipeline(req, requestToken)
    extractToken(req)
    isAuthenticated(context)
    async verifyToken(token)

# Required .env variables
API_MACHINE_TRUSTED_TOKEN
AUTH_TOKEN_KEY
API_AUTH_URL 
