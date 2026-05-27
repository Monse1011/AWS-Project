import express from 'express';
import sequelize from './config/database.js';

import './models/alumno.js';
import './models/profesor.js';

import alumnosRouter from './routes/alumnos.js';
import profesoresRouter from './routes/profesores.js';

const app = express();
const PORT = process.env.PORT || 80 ;

app.use(express.json());

app.use(alumnosRouter);
app.use(profesoresRouter);

sequelize.sync({ alter: true })
    .then(() => {
        console.log('RDS conectada y tablas sincronizadas');

        app.listen(PORT, () => {
            console.log(`Servidor iniciado en puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar con RDS:', error);
    });
