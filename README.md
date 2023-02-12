# A guide to redeploying the website

This project was bootstrapped with create-react-app.

Clone it and make you changes.


To install the dependencies, run:

```bash
npm install
```

To run the project locally, run:

```bash
npm start
```

It will run on http://localhost:3000


## Deployment

You should first make production build of the project.

Run this command:

```bash
npm run build
```

It will create a build folder in the root of the project.

To deploy the project You should install firebase-tools globally.

```bash
npm install -g firebase-tools
```

Then login to firebase

```bash
firebase login
```
It will open a browser window and ask you to login to firebase.

After that you can deploy the project by running:

```bash
firebase deploy
```

It will deploy the project to firebase `view-preply-1` project.

The link to the project is: https://view-preply-1.web.app/

## Deploying to a different firebase project

To deploy to a different firebase project, you should remove `firebase.json` and `.firebaserc` files.

Then run:

```bash
firebase init
```

To initialize the project. It will ask you about the firebase service you want to use. Select `Hosting` and then select the project you want to deploy to.

Then run:

```bash
npm run build
```

To create a production build of the project.

Then run to deploy the project:

```bash
firebase deploy
```


> Happy coding!