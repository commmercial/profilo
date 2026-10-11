# Telegram presence backend

This folder contains a Node.js API for the Telegram profile card. It runs separately from the GitHub Pages frontend so account authorization details stay out of public site code.

## Get Telegram API credentials

1. Sign in at https://my.telegram.org.
2. Open API development tools and create an application.
3. Keep the API ID and API Hash private.

Official guide: https://core.telegram.org/api/obtaining_api_id

## Create a private session locally

Run these commands from inside the telegram-presence folder on your own computer:

npm install
npm run telegram:login

Enter your API ID, API Hash, phone number, Telegram login code, and (if enabled) your two-step verification password in the local terminal prompts. The script prints a session string when authorization succeeds.

The session string is highly sensitive: do not send it to anyone, paste it into chat, commit it to GitHub, or put it in frontend JavaScript. Copy it directly from your terminal into the hosting provider's private TELEGRAM_SESSION environment variable. If you suspect it was exposed, terminate the relevant Telegram session in Telegram's Devices settings.

## Deploy the backend

Deploy this folder as a Node.js web service with Node.js 20 or newer. Set these private environment variables in the host:

- TELEGRAM_API_ID
- TELEGRAM_API_HASH
- TELEGRAM_SESSION
- ALLOWED_ORIGIN=https://v.pntr.dev

Set the service start command to npm start. Do not place any of these secrets in the public website repository.

Once deployed, check /health on the service URL. The API endpoints are /api/telegram and /api/telegram/photo. The frontend still needs the deployed backend URL configured before live data can appear on the site.

## Status limitation

Telegram presence is best-effort. Privacy settings and Telegram's status rules can limit what the API reports, and an authenticated client does not guarantee an exact live mirror of phone activity.
