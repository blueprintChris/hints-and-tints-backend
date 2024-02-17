import { Application } from './src/app';

const PORT = process.env.NODE_ENV === 'production' ? 443 : 4000;

const app = new Application(PORT);

app.start();
