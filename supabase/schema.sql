-- Esquema de la tienda. Ejecutar en Supabase -> SQL Editor -> New query -> Run.
-- Las columnas usan los mismos nombres que fake_data.py.

create table if not exists productos (
  producto_id  text primary key,
  nombre       text not null,
  marca        text,
  categoria    text not null,
  descripcion  text,
  imagen_url   text
);

-- Si la tabla ya existía de una versión anterior:
alter table productos add column if not exists marca text;

create table if not exists ofertas (
  oferta_id     text primary key,
  producto_id   text not null references productos(producto_id) on delete cascade,
  vendedor      text not null,
  precio        numeric(10,2) not null check (precio >= 0),
  envio         numeric(10,2) not null default 0 check (envio >= 0),
  dias_entrega  int not null check (dias_entrega > 0)
);
create index if not exists ofertas_producto_idx on ofertas(producto_id);

create table if not exists resenas (
  id           bigint generated always as identity primary key,
  producto_id  text not null references productos(producto_id) on delete cascade,
  vendedor     text not null,
  estrellas    int not null check (estrellas between 1 and 5),
  texto        text not null
);
create index if not exists resenas_producto_idx on resenas(producto_id);

create table if not exists complementos (
  producto_id        text not null references productos(producto_id) on delete cascade,
  complementario_id  text not null references productos(producto_id) on delete cascade,
  primary key (producto_id, complementario_id)
);

-- Recomendaciones ya generadas por el agente (caché para que la demo cargue al instante).
create table if not exists recomendaciones (
  producto_id  text primary key references productos(producto_id) on delete cascade,
  contenido    jsonb not null,
  fuente       text not null,          -- 'ia' o 'respaldo'
  modelo       text,
  creado_en    timestamptz not null default now()
);

-- Seguridad: lectura pública, escritura solo con la clave service_role (servidor).
alter table productos       enable row level security;
alter table ofertas         enable row level security;
alter table resenas         enable row level security;
alter table complementos    enable row level security;
alter table recomendaciones enable row level security;

drop policy if exists "lectura publica" on productos;
drop policy if exists "lectura publica" on ofertas;
drop policy if exists "lectura publica" on resenas;
drop policy if exists "lectura publica" on complementos;
drop policy if exists "lectura publica" on recomendaciones;

create policy "lectura publica" on productos       for select using (true);
create policy "lectura publica" on ofertas         for select using (true);
create policy "lectura publica" on resenas         for select using (true);
create policy "lectura publica" on complementos    for select using (true);
create policy "lectura publica" on recomendaciones for select using (true);
