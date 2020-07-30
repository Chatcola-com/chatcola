# Chatcola server

  <p align="center">
    <a href="https://hub.docker.com/repository/docker/chatcola/chatcola" alt="Docker image">
        <img src="https://img.shields.io/docker/automated/chatcola/chatcola" />
    </a>
    <a href="https://hub.docker.com/repository/docker/chatcola/chatcola" alt="Docker image">
        <img src="https://img.shields.io/docker/cloud/build/chatcola/chatcola" />
    </a>
</p>

---


This repository hosts the chatcola server needed to self-host reliance and storage of your messaging.

# Getting started

## What you'll need

* ### a linux computer (probably a VPS) with a public IP and shell access. (`sudo` is not required, but simplifies things masivelly as shown below)

### Steps - WITH SUDO ACCESS

### 1. [ Install docker ](https://docs.docker.com/get-docker/)

### 2. Pull our docker image

```bash
$ sudo docker pull chatcola/chatcola
```

### 3. Obtain a domain and a certificate (look steps 2 and 3 below in "Steps - WITHOUT SUDO ACCESS") and copy them to a directory of your choice - for example into `/opt/chatcola`

### 4. Run the container

```bash
$ sudo docker run -e THIS_INSTANCE_ADDRESS="<YOUR DOMAIN>:7777" \
    -v /opt/chatcola:/app/assets chatcola/chatcola
```

## Note that you have to replace `/opt/chatcola` with the directory you moved your certificates to in step 3.

## Steps - WITHOUT SUDO ACCESS.

### 1. Install chatcola on your server

## You can either build the sources yourself or [download the latest build](https://github.com/chatcola-com/chatcola/). The build has the following file structure:

```filesystem
your-directory/       #"your-directory" can be anywhere on your system
├── chatcola-server/
│   ├── build/
│   ├── assets/
```

### 2. Get a (free) domain name

#### Having a domain is necessary to provide SSL encryption.

###### If you already have a domain that is pointing to your VPS, then you can skip this step.

#### To get a free domain name head over to one of these websites:

* ### [Freenom.com](https://www.freenom.com/en/index.html?lang=en)

## 3. Get a (free!) SSL certificate

### Head over to [Certbot - Certbot Instructions](https://certbot.eff.org/instructions)

### To get a free certificate. Once you are done, something like this will show up:

```textile
- Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/fullchain.pem // <-----------
   Your key file has been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/privkey.pem < -----------
```

### You'll need these files (`fullchain.pem` and `privkey.pem` ) in the next step.

## 4. Set up assets and environment variables

### Head back to the directory you installed chatcola in  ("`chatcola-server`" in step #1) and copy the certificates from step 3:

```filesystem
your-directory/
├── chatcola-server/
│   ├── build/
│   ├── assets/
|       ├────/fullchain.pem // <-------------------------
        ├────/privkey.pem   // <-------------------------
```

## You've gone a long way! There's one last thing, you'll need an environment variable file, head over to the `production.env` file in `assets` directory

```filesystem
your-directory/
├── chatcola-server/
│   ├── build/
│   ├── assets/
|       ├────/fullchain.pem
|       ├────/privkey.pem
|       ├────/production.env // <------------------------
```

## It looks like this:

```env
PORT=7777   // <---- this is optional

THIS_INSTANCE_ADDRESS=<YOUR DOMAIN NAME WITH PORT>

SHOULD_REPORT_ERRORS=true    // < ---- set to false if needed
```

* ### `THIS_INSTANCE_ADDRESS`  is your domain name with the port attached to it.
  
  # __**The PORT is really important to include.**__

* ### `PORT` is the port you are exposing on your machine. It has to be higher than 1000. *This is not required, default is `7777`*

* ### `SHOULD_REPORT_ERRORS` Set this to "false" if you wish to opt out. It will send a crash report to our [Sentry](https://github.com/getsentry/sentry) and help us fix bugs earlier, but this is 100% optional for you to enable - no value will be lost from your instance.
  
  ## For example:
  
  ```env
  PORT=7777   // <----- if this is not specified, then it will be 7777
  
  THIS_INSTANCE_ADDRESS=chatcolainstance.example.com:7777 <---- NOTICE THE PORT
  
  SHOULD_REPORT_ERRORS=false
  ```

# 5. Starting the server

## You'll need to have `node` version 14.4.0 or later installed. To do so run:

```bash
  $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
  $ nvm install 14.4.0
```

## And then from your `chatcola-server` directory (The one that contains both `build` and `assets`) run:

```bash
  $ NODE_ENV=production node build
```

## If everything went right, your server is now running! To verify it, head over to chatcola.com and make a chatroom using your `INSTANCE_ADDRESS` from `production.env`

## __You have successfuly installed chatcola!__

  ---

### Beyond starting

<p>You'll probably need some sort of program to keep your instance running forever. What we recommend is [ PM2 ](https://npmjs.com/package/pm2). To install it run:

```bash
$ cd chatcola-server
$ npm install pm2
$ cp build/ecosystem.config.js .
$ ./node_modules/.bin/pm2 start ecosystem.config.js
```

Now your server will restart after crashes and wont exit when you leave ssh.

[forever](https://www.npmjs.com/package/forever) is a good alternative to pm2. 

</p>
