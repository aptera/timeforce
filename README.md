![](https://app.trystructure.com/app/assets/img/s-logo-small.png)
# timeforce
A helping friendly Slack bot for those of us who track our time in [Structure](https://app.trystructure.com/).  

### To install
    npm install

### Environments
* Production: https://timeforcebotservice.azurewebsites.net
* Development: https://timeforcebotservicedev.azurewebsites.net

### Provision Secrets
If the the App Service hosting the bot is rebuilt or loses its persistence, run the following from the Console blade or the Kudu debug console.

```
cd D:\home\site\wwwroot
echo CLIENT_ID={SLACK_CLIENT_ID}> .env
echo CLIENT_SECRET={SLACK_CLIENT_SECRET}>> .env
```

### To start/wake the bot
To start/wake the bot server, send an HTTP GET to https://timeforcebotservice.azurewebsites.net and wait. The App Service will automatically suspend due to inactivity because it is hosted on a free App Service plan.

### Deployment
Commits to `aptera/timeforce/master` or `develop` will trigger a WebHook from GitHub to the corresponding Azure App Service, causing the App Service to pull the latest from the repo and deploy it. While `iisnode` is configured to watch for changes to any `.config` and `.js` and then recycle the app, this has not be reliable in testing.

Built while standing on the shoulders of the good folks at https://api.slack.com/tutorials/easy-peasy-bots.  
