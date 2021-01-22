# Twitch predictions stats

### Stacks

- Web app with NextJS
- UI with Tailwind
- Api with Graphql hosted on NextJS/API
- Database with MongoDB

### Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fmusps%2Ftwitch-predictions-stats&env=NEXT_PUBLIC_VERCEL_URL,TPS_ENDPOINT,DISABLE_CACHE,TPS_AUTH_CACHE,TWITCH_CLIENT_ID,MONGO_STRING,NEXT_PUBLIC_GOOGLE_FORM_ADD_CHANNEL&demo-title=Twitch%20Predictions%20Stats&demo-description=Twitch%20predictions%20stats%20-%20Find%20your%20favorite%20streamer%20predictions%20statistics!&demo-url=https%3A%2F%2Fgithub.com%2Fmusps%2Ftwitch-predictions-stats&demo-image=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1609080534424-787ad4f5dc48%3Fixlib%3Drb-1.2.1%26q%3D80%26fm%3Djpg%26crop%3Dentropy%26cs%3Dtinysrgb%26w%3D1080%26fit%3Dmax)

### Install

You can create a free MongoDB cluster with [MongoDB Cloud](https://www.mongodb.com/cloud)

1. Setup

```bash
# Install dependencies
npm install
# Create env file
cp .env.example .env
```

2.  Fill all environment variables in order to run properly the project.

### Run

```
npm run dev
```

### Build

```
npm run build
```

### Features

- All API responses are cached server side and cleared on new updates
- Predictions data is retrieved each 15/minutes with a cronjob
- (...)

### Improvements

- Host API in no serverless environment for faster access.
- Set DB and API on same region for faster communication between servers
- (...)

### New features to create

- Related games to predictions and create stats
- (...)
