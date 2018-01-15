create extension postgis;
create extension postgis_topology;

create table stands (
  stand_id bigserial primary key,
  location geometry,
  stand_type text,
  source_type text,
  created timestamp default now()
);