-- Datos de prueba para db/schema.ts. Conserva los clientes existentes.
-- Agrega 100 clientes, 100 pedidos, 100 artículos y 10 libros.
-- Las tablas books, orders y order_items deben estar vacías.
-- Los registros sucios respetan las restricciones de PostgreSQL:
--   customers: 40 nombres con espacios y correos sin @.
--   orders: 40 totales que exceden en 1.00 la suma de sus artículos.
--   order_items: 40 cantidades de 200 y precios distintos al catálogo.
-- Ejecución: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/seed-test-data.sql

BEGIN;

LOCK TABLE customers, books, orders, order_items IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM books)
     OR EXISTS (SELECT 1 FROM orders)
     OR EXISTS (SELECT 1 FROM order_items) THEN
    RAISE EXCEPTION 'El seed requiere books, orders y order_items vacías; no se modificó ningún dato';
  END IF;
END $$;

INSERT INTO books (name, price, author, description) VALUES
  ('Cien años de soledad', 24.99, 'Gabriel García Márquez', 'La historia de la familia Buendía en Macondo.'),
  ('Ficciones', 18.50, 'Jorge Luis Borges', 'Colección de cuentos sobre laberintos, bibliotecas e imaginación.'),
  ('El Principito', 12.00, 'Antoine de Saint-Exupéry', 'Relato sobre la amistad y el sentido de la vida.'),
  ('Rayuela', 22.00, 'Julio Cortázar', 'Novela que admite varios órdenes de lectura.'),
  ('Pedro Páramo', 15.75, 'Juan Rulfo', 'Un viaje a Comala en busca de un padre.'),
  ('1984', 19.90, 'George Orwell', 'Novela distópica sobre vigilancia y poder.'),
  ('Don Quijote de la Mancha', 29.99, 'Miguel de Cervantes', 'Aventuras de don Quijote y Sancho Panza.'),
  ('La sombra del viento', 21.50, 'Carlos Ruiz Zafón', 'Misterio literario ambientado en Barcelona.'),
  ('Ensayo sobre la ceguera', 23.25, 'José Saramago', 'Una epidemia de ceguera transforma una sociedad.'),
  ('Crónica de una muerte anunciada', 16.80, 'Gabriel García Márquez', 'Reconstrucción de una muerte anunciada en un pueblo caribeño.');

INSERT INTO customers (firstname, lastname, email)
SELECT
  CASE WHEN n % 5 IN (0, 1) THEN '  Cliente ' || n || '  ' ELSE 'Cliente ' || n END,
  'Prueba ' || n,
  CASE WHEN n % 5 IN (0, 1)
    THEN 'cliente-' || lpad(n::text, 3, '0') || '.example.test'
    ELSE 'cliente-' || lpad(n::text, 3, '0') || '@example.test'
  END
FROM generate_series(1, 100) AS n;

-- Relaciona únicamente los clientes recién creados con su número de prueba.
CREATE TEMP TABLE seeded_customers ON COMMIT DROP AS
SELECT s.n, c.customer_id
FROM generate_series(1, 100) AS s(n)
JOIN customers AS c ON c.email = CASE WHEN s.n % 5 IN (0, 1)
  THEN 'cliente-' || lpad(s.n::text, 3, '0') || '.example.test'
  ELSE 'cliente-' || lpad(s.n::text, 3, '0') || '@example.test'
END;

WITH numbered_books AS (
  SELECT price, row_number() OVER (ORDER BY book_id) AS n FROM books
)
INSERT INTO orders (customer_id, status, total)
SELECT c.customer_id, 'pending',
  item.qty * item.unit_price + CASE WHEN c.n % 5 IN (0, 1) THEN 1.00 ELSE 0.00 END
FROM seeded_customers AS c
JOIN numbered_books AS b ON b.n = (c.n - 1) % 10 + 1
CROSS JOIN LATERAL (
  SELECT
    CASE WHEN c.n % 5 IN (2, 3) THEN 200 ELSE 1 END AS qty,
    CASE WHEN c.n % 5 IN (2, 3) THEN b.price + 5.00 ELSE b.price END AS unit_price
) AS item;

WITH numbered_books AS (
  SELECT book_id, price, row_number() OVER (ORDER BY book_id) AS n FROM books
)
INSERT INTO order_items (order_id, book_id, qty, unit_price)
SELECT o.order_id, b.book_id,
  CASE WHEN c.n % 5 IN (2, 3) THEN 200 ELSE 1 END,
  CASE WHEN c.n % 5 IN (2, 3) THEN b.price + 5.00 ELSE b.price END
FROM orders AS o
JOIN seeded_customers AS c USING (customer_id)
JOIN numbered_books AS b ON b.n = (c.n - 1) % 10 + 1;

DO $$
BEGIN
  IF (SELECT count(*) FROM books) <> 10
     OR (SELECT count(*) FROM seeded_customers) <> 100
     OR (SELECT count(*) FROM orders) <> 100
     OR (SELECT count(*) FROM order_items) <> 100
     OR (SELECT count(*) FROM seeded_customers s JOIN customers c USING (customer_id)
         WHERE c.email NOT LIKE '%@%') <> 40
     OR (SELECT count(*) FROM orders o JOIN order_items i USING (order_id)
         WHERE o.total <> i.qty * i.unit_price) <> 40
     OR (SELECT count(*) FROM order_items i JOIN books b USING (book_id)
         WHERE i.qty = 200 AND i.unit_price <> b.price) <> 40 THEN
    RAISE EXCEPTION 'El seed no produjo las cantidades esperadas; se revierte la transacción';
  END IF;
END $$;

SELECT 'books' AS tabla, count(*) AS insertadas, count(*) AS total_en_bd,
  0 AS sucias_insertadas FROM books
UNION ALL
SELECT 'customers', count(*), (SELECT count(*) FROM customers),
  count(*) FILTER (WHERE c.email NOT LIKE '%@%')
FROM seeded_customers s JOIN customers c USING (customer_id)
UNION ALL
SELECT 'orders', count(*), count(*), count(*) FILTER (WHERE total <> qty * unit_price)
FROM orders JOIN order_items USING (order_id)
UNION ALL
SELECT 'order_items', count(*), count(*), count(*) FILTER (WHERE qty = 200 AND unit_price <> price)
FROM order_items JOIN books USING (book_id);

COMMIT;
