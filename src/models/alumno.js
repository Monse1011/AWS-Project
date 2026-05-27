import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alumno = sequelize.define('Alumno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    matricula: DataTypes.STRING,
    promedio: DataTypes.FLOAT,
    password: DataTypes.STRING,
    fotoPerfilUrl: DataTypes.STRING
});

export default Alumno;