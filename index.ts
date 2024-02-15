import { Application } from './src/app';

const PORT = process.env.NODE_ENV === 'development' ? 4000 : 443;

const app = new Application(PORT);

app.start();
