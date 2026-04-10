import express from 'express';

const app = express();
app.use(express.json());

// ─── In-Memory Storage ───────────────────────────────────────────────────────
let alumnos = [];
let profesores = [];

// ─── Validators ──────────────────────────────────────────────────────────────
function validateAlumno(body) {
    const errors = [];

    if (body.nombres === undefined || body.nombres === null || String(body.nombres).trim() === '')
        errors.push('nombres es requerido y no puede estar vacío');
    else if (typeof body.nombres !== 'string')
        errors.push('nombres debe ser una cadena de texto');

    if (body.apellidos === undefined || body.apellidos === null || String(body.apellidos).trim() === '')
        errors.push('apellidos es requerido y no puede estar vacío');
    else if (typeof body.apellidos !== 'string')
        errors.push('apellidos debe ser una cadena de texto');

    if (body.matricula === undefined || body.matricula === null || String(body.matricula).trim() === '')
        errors.push('matricula es requerida y no puede estar vacía');

    if (body.promedio === undefined || body.promedio === null || String(body.promedio).trim() === '')
        errors.push('promedio es requerido y no puede estar vacío');
    else if (isNaN(Number(body.promedio)))
        errors.push('promedio debe ser un número');
    else if (Number(body.promedio) < 0 || Number(body.promedio) > 10)
        errors.push('promedio debe estar entre 0 y 10');

    return errors;
}

function validateProfesor(body) {
    const errors = [];

    if (body.numeroEmpleado === undefined || body.numeroEmpleado === null || String(body.numeroEmpleado).trim() === '')
        errors.push('numeroEmpleado es requerido y no puede estar vacío');
    else if (isNaN(Number(body.numeroEmpleado)) || Number(body.numeroEmpleado) < 0)
        errors.push('numeroEmpleado debe ser un número positivo');

    if (body.nombres === undefined || body.nombres === null || String(body.nombres).trim() === '')
        errors.push('nombres es requerido y no puede estar vacío');
    else if (typeof body.nombres !== 'string')
        errors.push('nombres debe ser una cadena de texto');

    if (body.apellidos === undefined || body.apellidos === null || String(body.apellidos).trim() === '')
        errors.push('apellidos es requerido y no puede estar vacío');
    else if (typeof body.apellidos !== 'string')
        errors.push('apellidos debe ser una cadena de texto');

    if (body.horasClase === undefined || body.horasClase === null || String(body.horasClase).trim() === '')
        errors.push('horasClase es requerido y no puede estar vacío');
    else if (isNaN(Number(body.horasClase)) || Number(body.horasClase) < 0)
        errors.push('horasClase debe ser un número positivo');

    return errors;
}

// ─── Alumnos Routes ───────────────────────────────────────────────────────────

// 405 - Métodos no soportados en la colección
app.delete('/alumnos', (req, res) => res.status(405).json({ error: 'Método no permitido' }));
app.put('/alumnos', (req, res) => res.status(405).json({ error: 'Método no permitido' }));
app.patch('/alumnos', (req, res) => res.status(405).json({ error: 'Método no permitido' }));

app.get('/alumnos', (req, res) => {
    try {
        res.status(200).json(alumnos);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const alumno = alumnos.find(a => a.id === id);
        if (!alumno) return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        res.status(200).json(alumno);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/alumnos', (req, res) => {
    try {
        const errors = validateAlumno(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        // Respeta el id que manda el cliente (los tests envían su propio id)
        const id = req.body.id !== undefined ? Number(req.body.id) : Date.now();

        const alumno = {
            id,
            nombres: String(req.body.nombres).trim(),
            apellidos: String(req.body.apellidos).trim(),
            matricula: String(req.body.matricula).trim(),
            promedio: Number(req.body.promedio)
        };
        alumnos.push(alumno);
        res.status(201).json(alumno);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = alumnos.findIndex(a => a.id === id);
        if (index === -1) return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });

        const errors = validateAlumno(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        alumnos[index] = {
            id,
            nombres: String(req.body.nombres).trim(),
            apellidos: String(req.body.apellidos).trim(),
            matricula: String(req.body.matricula).trim(),
            promedio: Number(req.body.promedio)
        };
        res.status(200).json(alumnos[index]);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = alumnos.findIndex(a => a.id === id);
        if (index === -1) return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        const deleted = alumnos.splice(index, 1)[0];
        res.status(200).json(deleted);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ─── Profesores Routes ────────────────────────────────────────────────────────

// 405 - Métodos no soportados en la colección
app.delete('/profesores', (req, res) => res.status(405).json({ error: 'Método no permitido' }));
app.put('/profesores', (req, res) => res.status(405).json({ error: 'Método no permitido' }));
app.patch('/profesores', (req, res) => res.status(405).json({ error: 'Método no permitido' }));

app.get('/profesores', (req, res) => {
    try {
        res.status(200).json(profesores);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/profesores/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const profesor = profesores.find(p => p.id === id);
        if (!profesor) return res.status(404).json({ error: `Profesor con id ${id} no encontrado` });
        res.status(200).json(profesor);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/profesores', (req, res) => {
    try {
        const errors = validateProfesor(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        const id = req.body.id !== undefined ? Number(req.body.id) : Date.now();

        const profesor = {
            id,
            numeroEmpleado: Number(req.body.numeroEmpleado),
            nombres: String(req.body.nombres).trim(),
            apellidos: String(req.body.apellidos).trim(),
            horasClase: Number(req.body.horasClase)
        };
        profesores.push(profesor);
        res.status(201).json(profesor);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/profesores/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = profesores.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: `Profesor con id ${id} no encontrado` });

        const errors = validateProfesor(req.body);
        if (errors.length > 0) return res.status(400).json({ errors });

        profesores[index] = {
            id,
            numeroEmpleado: Number(req.body.numeroEmpleado),
            nombres: String(req.body.nombres).trim(),
            apellidos: String(req.body.apellidos).trim(),
            horasClase: Number(req.body.horasClase)
        };
        res.status(200).json(profesores[index]);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/profesores/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = profesores.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: `Profesor con id ${id} no encontrado` });
        const deleted = profesores.splice(index, 1)[0];
        res.status(200).json(deleted);
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
