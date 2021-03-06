<p align="center">
  <img 
    src="https://chatcola.com/images/logo.png"
  />
</p>

<h1 align="center">Chatcola server</h1>

<p align="center">
    <a href="https://hub.docker.com/repository/docker/chatcola/chatcola" alt="Docker image">
        <img src="https://img.shields.io/docker/automated/chatcola/chatcola" />
    </a>
    <a title="Latest push build on default branch: passed" name="status-images" class="pointer open-popup">
        <img src="https://travis-ci.com/Chatcola-com/chatcola.svg?branch=master&status=passed" alt="build:passed">
    </a>
    <a href="https://codeclimate.com/github/Chatcola-com/chatcola/test_coverage">
        <img src="https://api.codeclimate.com/v1/badges/15ccec53546e121c1eff/test_coverage" />
    </a>
    <a href="https://codeclimate.com/github/Chatcola-com/chatcola/maintainability">
        <img src="https://api.codeclimate.com/v1/badges/15ccec53546e121c1eff/maintainability" />
    </a>
</p>

---

This repository hosts the chatcola server needed to self-host reliance and storage of your messaging.

# Getting started


## With docker (the easier way)

* run `docker install chatcola/chatcola`
* run `docker run -e THIS_INSTANCE_ADDRESS={{your instance address here}}`

## Without docker

* Install node.js 14: 
  
  Linux / MacOS:
  
  ```bash
  curl -s https://install-node.now.sh | bash -s --
  ```

    Windows:     [download installer from here](https://nodejs.org/dist/v12.18.3/node-v12.18.3-x86.msi)

* Install chatcola p2p server:
  
  ```bash
  npm install -g chatcola-server
  ```

* Run the server
  
  ```bash
  chatcola-server
  ```

* If you plan to use the server for longer (i.e. raspberry pi), daemonize it with some process manager, for example:
```bash
 $ npm install -g pm2 
 $ pm2 run "chatcola-server"
```

you will be asked for instance address, give it a string that's easy for you to remember (it can be anything provided no one has taken it before, i.e. "foobar") - 

**To host the chatroom on your instance insert** <h1>webrtc:{{YOUR INSTANCE ADDRESS GOES HERE}}</h1> **when creating a chatroom at chatcola.com/start**


For example, if you have address foobar, then you will have to insert webrtc:foobar

If you want to change the address later run the server with the `--resetAddress` flag:

```bash
chatcola-server --resetAddress
```

you will be then guided through the process of assigning address again. Note that all chatrooms created beforehand will be left fatherless and impossible to use again.

# Hosting a http instance

This comes a bit harder than hosting a webrtc instance, but provides a more performant and probably more stable experience.

You'll need a linux computer (probably a VPS) with a public IP

1. Point your domain name (you can get a free one at [Freenom.com](https://www.freenom.com/en/index.html?lang=en)) 
to the VPS.

2. Make a `~/.chatcola-http` directory

3. Copy your SSL cert files (they need to be named `fullchain.pem` for the cert and `privkey.pem` for the private key) to `~/.chatcola-http` directory

4. At this point you should have already installed `chatcola-server` from npm and prepared your home directory to look like so:

```filesystem
/home/<your-username>/
├── .chatcola-http/ # <----- notice the dot
│    ├── privkey.pem
|    |── fullchain.pem
```

You are now ready to launch the chatcola server.

* Run
  
  ```bash
  chatcola-server-http
  ```

Available options are:

* `PORT` - if using this, then also remember to change the port from `7777` in `THIS_INSTANCE_ADDRESS`. So if you set `PORT` to be, for example, `5050` and you have domain `example.com`, you have to set `THIS_INSTANCE_ADDRESS` to `example.com:5050`. You can do a reverse proxy with nginx/apache/caddy and bind port 443 to your chatcola instance, then you won't have to specify the port in this variable.

* `SHOULD_REPORT_ERRORS` Set this to `false` to disable our [sentry](https://github.com/getsentry/sentry).

Both of them should be set as environent variables.

## Building from source

1. Clone the repository and run `npm install`
2. Make the script executable - `chmod +x ./scripts/build`
3. Either run `./scripts/build` to build for webrtc or `./scripts/build http` for http. Your build will be in `build/p2p` or `build/http`.

# License

This program is free software. For alternate licensing arrangements contact us at freedom@chatcola.com

<p align="center">
  <img src="https://www.gnu.org/graphics/agplv3-with-text-162x68.png" title="" alt="AGPL-3.0">
</p>
