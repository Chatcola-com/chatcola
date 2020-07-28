# Chatcola server

---

This repository hosts the chatcola server needed to self-host relianace and storage of your messaging.

---

## What you'll need

* ### a linux computer with a public IP and shell access. (`sudo` is not required)

---

# Steps

# 1. Install chatcola on your server

## You can either build the sources yourself or [download the latest build](https://github.com/chatcola-com/chatcola/). Then, copy the `build` and `assets` directories as shown:

```filesystem
your-directory/       #"your-directory" can be anywhere on your system
├── chatcola-server/
│   ├── build/
│   ├── assets/
```

# 2. Get a (free) domain name

## Having a domain is necessary to provide SSL encryption.

##### If you already have a domain that is pointing to your VPS, then you can skip this step.

# To get a free domain name head over to one of these websites:

* ### [Freenom.com](https://www.freenom.com/en/index.html?lang=en)

# 3. Get a (free!) SSL certificate

## Head over to [Certbot - Certbot Instructions](https://certbot.eff.org/instructions)

## To get a free certificate. Once you are done, something like this will show up:

```textile
- Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/fullchain.pem // <-----------
   Your key file has been saved at:
   /etc/letsencrypt/live/<YOUR DOMAIN NAME>/privkey.pem < -----------
```

### You'll need these files (`fullchain.pem` and `privkey.pem` ) in the next step.

# 4. Set up assets and environment variables

## Head back to the directory you installed chatcola in  ("`chatcola-server`" in step #1) and copy the certificates from step 3:

```filesystem
your-directory/
├── chatcola-server/
│   ├── build/
│   ├── assets/
|       ├────/fullchain.pem // <-------------------------
        ├────/privkey.pem   // <-------------------------
```

# You've gone a long way! There's one last thing, you'll need an environment variable file, create a `production.env` file in `assets`:

```filesystem
your-directory/
├── chatcola-server/
│   ├── build/
│   ├── assets/
|       ├────/fullchain.pem
        ├────/privkey.pem
        ├────/production.env // <------------------------

```

## It has to look like this:

```env
PORT=7777

JWT_SECRET=<SOME---LONG---RANDOM---STRING>

THIS_INSTANCE_ADDRESS=<YOUR DOMAIN NAME WITH PORT>

SHOULD_REPORT_ERRORS=true
```



* ## `PORT` is the port you are exposing on your machine. It has to be higher than 1000.

* ## `JWT_SECRET` is a random string to encode your user's tokens. [You can generate it here](https://www.browserling.com/tools/random-string) or by hitting your keyboard.

* ## `THIS_INSTANCE_ADDRESS`  is your domain name with the port attached to it.
  
  # __**The PORT is really important to include.**__

* ## `SHOULD_REPORT_ERRORS` This will only be on if set to `true`. It will send a crash report to our [Sentry](https://github.com/getsentry/sentry) and help us fix bugs earlier, but this is 100% optional for you to enable - no value will be lost from your instance.
  
  # For example:
  
  ```env
  PORT=7777
  
  JWT_SECRET=dfiojafiouusaioufuiodfguiosduui8u345893489revs89eh89sdhfjuishduihadfsiufhdsiuhfdsuiahfdiusahuifsdahuisdafhuiasdfhuisdfh
  
  THIS_INSTANCE_ADDRESS=chatcolainstance.example.com:7777 <---- NOTICE THE PORT
  
  SHOULD_REPORT_ERRORS=true
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
  
  # If everything went right, your server is now running! To verify it, head over to chatcola.com and make a chatroom using your `INSTANCE_ADDRESS` from `production.env`
  
  # __You have successfuly installed chatcola!__
  
  ---
