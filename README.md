# Serverless Template
_Template repository for Serverless AWS Lambda apps using the Serverless Framework_

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
---

# Overview
Run fast with a new [AWS Lambda](https://aws.amazon.com/lambda/) serverless project using a quick and dirty TypeScript stack!

# Stack
- Framework
  - [Serverless](https://aws.amazon.com/lambda/)
- Testing
  - [AVA](https://github.com/avajs/ava) (test runner)
  - [XO](https://github.com/xojs/xo) (code linting) 

# How to use
1) Create a new repository using this as a template
2) `npm i` to get the dependencies installed
3) Modify the `package.json` and this readme to fit your project
4) Run the local build with `npm run serve`! (alternatively `serve:watch` will run with nodemon)

# Deploying
1) Set your **profile**, **role**, **region**, **service name**, and **domain info** in `serverless.yml`
2) Run `npm run deploy` to deploy to a dev stage, or `npm run deploy:production` to deploy to production.

# Q + A
### Why AVA? Why not Jest?
- Personal preference. I find Jest clunky in comparison, but it has its merits. Feel free to swap it out.
### Why use such a strict linter?
- I like clean code, and personally it forces me to write more readable code. The style is automagically enforced by Prettier anyways.

## TODO:
- Write better docs.
