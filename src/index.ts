import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import ttpRoutes from './routes/ttp.routes';
import ttpController from './controllers/ttp.controller';

//INITIALIZATIONS
const app = express();  //To create an Express application

//CONFIGS
app.set('port', process.env.PORT || 3001);
app.use(express.json());
app.use(express.urlencoded({'extended': false}));
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

//ROUTER
app.use('', ttpRoutes);

//SERVER STARTUP
app.listen(app.get('port'), () => {
    console.log(`Listening at port ${app.get('port')}\n`);
    ttpController.rsaInit(); // GENERA LAS CLAVES AUTOMÁTICAMENTE AL INICIAR EL SERVIDOR
});

export default app;