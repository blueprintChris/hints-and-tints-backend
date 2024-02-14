import { Application } from './src/app';

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

const app = new Application(4000, host);

app.start();
