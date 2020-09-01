<h1 align="center">Chatcola server</h1>

<p align="center">
    <a href="https://hub.docker.com/repository/docker/chatcola/chatcola" alt="Docker image">
        <img src="https://img.shields.io/docker/automated/chatcola/chatcola" />
    </a>
    <a title="Latest push build on default branch: passed" name="status-images" class="pointer open-popup">
        <img src="https://travis-ci.com/Chatcola-com/chatcola.svg?branch=master&amp;status=passed" alt="build:passed">
    </a>
    <a href="https://codeclimate.com/github/Chatcola-com/chatcola/test_coverage">
        <img src="https://api.codeclimate.com/v1/badges/15ccec53546e121c1eff/test_coverage" />
    </a>
</p>

---

This repository hosts the chatcola server needed to self-host reliance and storage of your messaging.

# Getting started

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

you will be asked for instance address, give it a string that's easy for you to remember (it can be anything provided no one has taken it before, i.e. "foobar")

If you want to change the address later run the server with the `--resetAddress` flag:
```bash
chatcola-server --resetAddress
```
you will be then guided through the process of assigning address again. Note that all chatrooms created beforehand will be left fatherless and impossible to use again.

# Hosting a http instance

This comes a bit harder than hosting a webrtc instance, but provides a more performant and probably more stable experience.

##### What you'll need

* ###### a linux computer (probably a VPS) with a public IP and shell access. (`sudo` is not required, but simplifies things masivelly as shown below)

# Installing chatcola

### Steps - without docker

#### 1. Install node.js version 14.4.0 or later if you haven't yet

To verify you have node on your machine run:

```bash
node -v
```

If the output is `v14.4.0` or higher, you can skip this step.

To install node run:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
nvm install 14.4.0
```

### 2. Install chatcola-server:

```bash
npm install -g chatcola-server
```

## Steps - with docker

### 1. [ Install docker ](https://docs.docker.com/get-docker/)

### 2. Pull our docker image

```bash
sudo docker pull chatcola/chatcola
```

# Preparing SSL encryption

### You need 2 things to start a chatcola instance, both of them you can get for free:

* #### A domain name

Having a domain is necessary to provide SSL encryption.

If you already have a domain that is pointing to your VPS, then you can skip this step.

##### To get a free domain name head over to [Freenom.com](https://www.freenom.com/en/index.html?lang=en)

* #### Get a SSL certificate

#### Head over to [Certbot - Certbot Instructions](https://certbot.eff.org/instructions) To get a free certificate. Once you are done, something like this will show up:

```textile
- Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/fullchain.pem // <-----------
   Your key file has been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/privkey.pem < -----------
```

### You'll need these files (`fullchain.pem` and `privkey.pem` ). Copy them to chatcola assets directory, which lives in `~/.chatcola/`

 ---

### At this point you should have already installed chatcola and prepared your home directory to look like so:

```filesystem
/home/<your-username>/
├── .chatcola/ # <----- notice the dot
│   ├── privkey.pem
|   ├── fullchain.pem
```

### You are now ready to launch the chatcola server.

* If you are using docker, then run:
  
  ```bash
  sudo docker run -d -p <YOUR-PORT>:7777 -e THIS_INSTANCE_ADDRESS=<your-domain>:<YOUR-PORT> -v $HOME/.chatcola/:/root/.chatcola chatcola/chatcola
  ```

* If you are using npm, then run:
  
  ```bash
  THIS_INSTANCE_ADDRESS=<your-domain>:7777 chatcola-server
  ```

Available options are:

* `THIS_INSTANCE_ADDRESS` - the address of your instance. I.e. if you have domain `example.com`, this is going to be `example.com:7777` 

* `PORT` - if using this, then also remember to change the port from `7777` in `THIS_INSTANCE_ADDRESS`. So if you set `PORT` to be, for example, `5050` and you have domain `example.com`, you have to set `THIS_INSTANCE_ADDRESS` to `example.com:5050`. You can do a reverse proxy with nginx and bind port 443 to your chatcola instance, then you won't have to specify the port in this variable.

* `SHOULD_REPORT_ERRORS` Set this to `false` to disable our [sentry](https://github.com/getsentry/sentry).

#### Keeping the instance running

With docker you have this out of the box.

With npm however, you have plenty of options, the best one being `systemd`, but since it requires `sudo` access we'll show you another way:

```bash
npm install forever -g
```

```bash
forever start "THIS_INSTANCE_ADDRESS=<your-domain>:7777 chatcola-server"
```

That's it. You might want to go a little bit further and use something like [pm2](https://npmjs.com/package/pm2) which also provides a nice way of plugging in your processes to `systemd`.
