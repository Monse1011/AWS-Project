import express from 'express';
import Alumno from '../models/alumno.js';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../config/s3.js';
import sns from '../config/sns.js';
import { PublishCommand } from '@aws-sdk/client-sns';
import dynamo from '../config/dynamo.js';

import {
    PutCommand,
    ScanCommand,
    UpdateCommand
} from '@aws-sdk/lib-dynamodb';

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

function alumnoValido(body) {
    return (
        body.id &&
        body.nombres &&
        body.apellidos &&
        body.matricula &&
        typeof body.promedio === 'number' &&
        body.promedio >= 0
    );
}

router.post('/alumnos', async (req, res) => {
    try {
        if (!alumnoValido(req.body)) {
            return res.status(400).json({ error: 'Campos inválidos' });
        }

        const alumno = await Alumno.create(req.body);
        res.status(201).json(alumno);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/alumnos', async (req, res) => {
    try {
        const alumnos = await Alumno.findAll();
        res.status(200).json(alumnos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/alumnos/:id', async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        res.status(200).json(alumno);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/alumnos/:id', async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        if (!alumnoValido(req.body)) {
            return res.status(400).json({ error: 'Campos inválidos' });
        }

        await alumno.update(req.body);
        res.status(200).json(alumno);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/alumnos/:id', async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        await alumno.destroy();
        res.status(200).json({ message: 'Alumno eliminado' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/alumnos/:id/fotoPerfil', upload.single('foto'), async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ninguna imagen' });
        }

        const cleanName = req.file.originalname.replace(/\s+/g, '-');
        const fileName = `alumnos/${alumno.id}-${Date.now()}-${cleanName}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }));

        const fotoPerfilUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        await alumno.update({ fotoPerfilUrl });

        res.status(200).json(alumno);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/alumnos/:id/email', async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const mensaje = `
Alumno:
Nombres: ${alumno.nombres}
Apellidos: ${alumno.apellidos}
Matrícula: ${alumno.matricula}
Promedio: ${alumno.promedio}
        `;

        await sns.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Subject: 'Información del Alumno',
            Message: mensaje
        }));

        res.status(200).json({ message: 'Notificación enviada' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/alumnos/:id/session/login', async (req, res) => {
    try {
        const alumno = await Alumno.findByPk(req.params.id);

        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        if (req.body.password !== alumno.password) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const sessionString = crypto.randomBytes(64).toString('hex');

        const session = {
            id: uuidv4(),
            fecha: Date.now(),
            alumnoId: alumno.id,
            active: true,
            sessionString
        };

        await dynamo.send(new PutCommand({
            TableName: 'sesiones-alumnos',
            Item: session
        }));

        res.status(200).json(session);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/alumnos/:id/session/verify', async (req, res) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: 'sesiones-alumnos'
        }));

        const session = (result.Items || []).find(
            s => s.sessionString === req.body.sessionString
        );

        if (session && session.active) {
            return res.status(200).json({ valid: true });
        }

        return res.status(400).json({ valid: false });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/alumnos/:id/session/logout', async (req, res) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: 'sesiones-alumnos'
        }));

        const session = (result.Items || []).find(
            s => s.sessionString === req.body.sessionString
        );

        if (!session) {
            return res.status(400).json({ error: 'Sesión no encontrada' });
        }

        await dynamo.send(new UpdateCommand({
            TableName: 'sesiones-alumnos',
            Key: {
                id: session.id
            },
            UpdateExpression: 'set active=:a',
            ExpressionAttributeValues: {
                ':a': false
            }
        }));

        res.status(200).json({ message: 'Sesión cerrada' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.all('/alumnos', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

router.all('/alumnos/:id', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

export default router;