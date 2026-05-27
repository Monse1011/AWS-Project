import express from 'express';
import Profesor from '../models/profesor.js';

const router = express.Router();

function profesorValido(body) {
    return (
        typeof body.nombres === 'string' &&
        body.nombres.trim() !== '' &&

        typeof body.apellidos === 'string' &&
        body.apellidos.trim() !== '' &&

        typeof body.numeroEmpleado === 'number' &&
        body.numeroEmpleado > 0 &&

        typeof body.horasClase === 'number' &&
        body.horasClase > 0
    );
}

router.post('/profesores', async (req, res) => {
    try {

        if (!profesorValido(req.body)) {
            return res.status(400).json({
                error: 'Campos inválidos'
            });
        }

        const profesor = await Profesor.create(req.body);

        res.status(201).json(profesor);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
});

router.get('/profesores', async (req, res) => {
    try {

        const profesores = await Profesor.findAll();

        res.status(200).json(profesores);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
});

router.get('/profesores/:id', async (req, res) => {
    try {

        const profesor =
            await Profesor.findByPk(req.params.id);

        if (!profesor) {

            return res.status(404).json({
                error: 'Profesor no encontrado'
            });

        }

        res.status(200).json(profesor);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
});

router.put('/profesores/:id', async (req, res) => {

    try {

        const profesor =
            await Profesor.findByPk(req.params.id);

        if (!profesor) {

            return res.status(404).json({
                error: 'Profesor no encontrado'
            });

        }

        if (!profesorValido(req.body)) {

            return res.status(400).json({
                error: 'Campos inválidos'
            });

        }

        await profesor.update(req.body);

        res.status(200).json(profesor);

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
});

router.delete('/profesores/:id', async (req, res) => {

    try {

        const profesor =
            await Profesor.findByPk(req.params.id);

        if (!profesor) {

            return res.status(404).json({
                error: 'Profesor no encontrado'
            });

        }

        await profesor.destroy();

        res.status(200).json({
            message: 'Profesor eliminado'
        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
});

router.all('/profesores', (req, res) => {
    res.status(405).json({
        error: 'Método no permitido'
    });
});

router.all('/profesores/:id', (req, res) => {
    res.status(405).json({
        error: 'Método no permitido'
    });
});

export default router;