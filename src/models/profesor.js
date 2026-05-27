import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profesor = sequelize.define('Profesor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    nombres: DataTypes.STRING,
    apellidos: DataTypes.STRING,
    numeroEmpleado: DataTypes.INTEGER,
    horasClase: DataTypes.INTEGER
});

export default Profesor;