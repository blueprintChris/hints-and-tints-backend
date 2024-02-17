import { Application } from './src/app';

const PORT = process.env.NODE_ENV === 'development' ? 4000 : 4000;

const app = new Application(4000);

app.start();
