BEGIN;

-- Este seed no elimina datos reales. Solo reemplaza registros creados por este
-- mismo script para que pueda ejecutarse varias veces sin duplicar información.
DELETE FROM movimientos
WHERE descripcion LIKE '[DEMO]%';

DELETE FROM gastos_recurrentes
WHERE descripcion LIKE '[DEMO]%';

DELETE FROM objetivos_ahorro
WHERE nombre LIKE '[DEMO]%';

INSERT INTO categorias (nombre)
VALUES
    ('Alquiler'),
    ('Comida'),
    ('Ocio'),
    ('Servicios')
ON CONFLICT (nombre) DO NOTHING;

UPDATE configuracion_presupuesto
SET ingreso_base = 4200
WHERE id = (SELECT MIN(id) FROM configuracion_presupuesto);

INSERT INTO configuracion_presupuesto (ingreso_base)
SELECT 4200
WHERE NOT EXISTS (SELECT 1 FROM configuracion_presupuesto);

INSERT INTO limites_categoria (categoria_id, limite_monto)
SELECT categorias.id, limites.limite_monto
FROM (
    VALUES
        ('Alquiler', 1200.00::NUMERIC),
        ('Comida', 650.00::NUMERIC),
        ('Ocio', 350.00::NUMERIC),
        ('Servicios', 450.00::NUMERIC)
) AS limites(nombre, limite_monto)
INNER JOIN categorias ON categorias.nombre = limites.nombre
ON CONFLICT (categoria_id)
DO UPDATE SET limite_monto = EXCLUDED.limite_monto;

-- Ingresos mensuales y variables de los últimos siete meses.
INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'ingreso',
    4200.00,
    '[DEMO] Sueldo mensual',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '2 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Servicios')
FROM generate_series(0, 6) AS meses(mes);

INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'ingreso',
    350.00 + (mes * 25.00),
    '[DEMO] Trabajo freelance',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '16 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Servicios')
FROM generate_series(0, 5, 2) AS meses(mes);

-- Gastos mensuales con variación para que el dashboard muestre tendencia.
INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'gasto',
    1150.00 + (mes * 12.00),
    '[DEMO] Alquiler del departamento',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '3 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Alquiler')
FROM generate_series(0, 6) AS meses(mes);

INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'gasto',
    320.00 + (mes * 18.00),
    '[DEMO] Supermercado del mes',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '6 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Comida')
FROM generate_series(0, 6) AS meses(mes);

INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'gasto',
    85.00 + (mes * 7.00),
    '[DEMO] Restaurantes y cafeterías',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '12 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Comida')
FROM generate_series(0, 6) AS meses(mes);

INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'gasto',
    170.00 + (mes * 22.00),
    '[DEMO] Ocio y entretenimiento',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '19 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Ocio')
FROM generate_series(0, 6) AS meses(mes);

INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
SELECT
    'gasto',
    180.00 + (mes * 10.00),
    '[DEMO] Servicios del hogar',
    (date_trunc('month', CURRENT_DATE) - (mes * INTERVAL '1 month') + INTERVAL '23 days')::TIMESTAMP,
    (SELECT id FROM categorias WHERE nombre = 'Servicios')
FROM generate_series(0, 6) AS meses(mes);

-- Gastos puntuales distribuidos en distintos meses.
INSERT INTO movimientos (tipo, monto, descripcion, fecha, categoria_id)
VALUES
    ('gasto', 95.00, '[DEMO] Compra de ropa', (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' + INTERVAL '9 days')::TIMESTAMP, (SELECT id FROM categorias WHERE nombre = 'Ocio')),
    ('gasto', 240.00, '[DEMO] Reparación del automóvil', (date_trunc('month', CURRENT_DATE) - INTERVAL '2 months' + INTERVAL '14 days')::TIMESTAMP, (SELECT id FROM categorias WHERE nombre = 'Servicios')),
    ('gasto', 68.50, '[DEMO] Cena de aniversario', (date_trunc('month', CURRENT_DATE) - INTERVAL '3 months' + INTERVAL '20 days')::TIMESTAMP, (SELECT id FROM categorias WHERE nombre = 'Comida')),
    ('gasto', 530.00, '[DEMO] Escapada de fin de semana', (date_trunc('month', CURRENT_DATE) - INTERVAL '4 months' + INTERVAL '11 days')::TIMESTAMP, (SELECT id FROM categorias WHERE nombre = 'Ocio'));

-- Seis gastos recurrentes para la pantalla y los recordatorios del dashboard.
INSERT INTO gastos_recurrentes
    (descripcion, monto, categoria_id, frecuencia, proxima_fecha, activo)
VALUES
    ('[DEMO] Alquiler mensual', 1150.00, (SELECT id FROM categorias WHERE nombre = 'Alquiler'), 'mensual', CURRENT_DATE + 3, TRUE),
    ('[DEMO] Recibo de luz', 72.50, (SELECT id FROM categorias WHERE nombre = 'Servicios'), 'mensual', CURRENT_DATE + 6, TRUE),
    ('[DEMO] Recibo de agua', 38.00, (SELECT id FROM categorias WHERE nombre = 'Servicios'), 'mensual', CURRENT_DATE + 10, TRUE),
    ('[DEMO] Internet fibra óptica', 55.00, (SELECT id FROM categorias WHERE nombre = 'Servicios'), 'mensual', CURRENT_DATE + 14, TRUE),
    ('[DEMO] Suscripción Netflix', 15.49, (SELECT id FROM categorias WHERE nombre = 'Ocio'), 'mensual', CURRENT_DATE + 18, TRUE),
    ('[DEMO] Plan de teléfono móvil', 29.90, (SELECT id FROM categorias WHERE nombre = 'Servicios'), 'mensual', CURRENT_DATE + 24, TRUE);

-- Metas con distintos niveles de avance y fechas límite.
INSERT INTO objetivos_ahorro
    (nombre, monto_meta, monto_actual, fecha_limite, estado)
VALUES
    ('[DEMO] Viaje a Japón', 5000.00, 2150.00, CURRENT_DATE + 240, 'activo'),
    ('[DEMO] Comprar un automóvil', 18000.00, 6400.00, CURRENT_DATE + 540, 'activo'),
    ('[DEMO] Fondo de emergencia', 9000.00, 9000.00, CURRENT_DATE + 30, 'completado'),
    ('[DEMO] Curso de especialización', 1800.00, 650.00, CURRENT_DATE + 120, 'pausado');

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 650.00, CURRENT_TIMESTAMP - INTERVAL '5 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Viaje a Japón';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 1500.00, CURRENT_TIMESTAMP - INTERVAL '2 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Viaje a Japón';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 3400.00, CURRENT_TIMESTAMP - INTERVAL '8 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Comprar un automóvil';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 3000.00, CURRENT_TIMESTAMP - INTERVAL '3 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Comprar un automóvil';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 9000.00, CURRENT_TIMESTAMP - INTERVAL '6 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Fondo de emergencia';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 400.00, CURRENT_TIMESTAMP - INTERVAL '2 months'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Curso de especialización';

INSERT INTO abonos_objetivo (objetivo_id, monto, fecha)
SELECT id, 250.00, CURRENT_TIMESTAMP - INTERVAL '20 days'
FROM objetivos_ahorro
WHERE nombre = '[DEMO] Curso de especialización';

COMMIT;

-- Comprobación rápida para ejecutar después del seed.
SELECT 'movimientos_demo' AS dato, COUNT(*) AS cantidad
FROM movimientos
WHERE descripcion LIKE '[DEMO]%'
UNION ALL
SELECT 'recurrentes_demo', COUNT(*)
FROM gastos_recurrentes
WHERE descripcion LIKE '[DEMO]%'
UNION ALL
SELECT 'objetivos_demo', COUNT(*)
FROM objetivos_ahorro
WHERE nombre LIKE '[DEMO]%';
