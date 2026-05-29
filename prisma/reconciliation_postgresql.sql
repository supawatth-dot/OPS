-- PostgreSQL reference architecture for the Real-Time Customs Reconciliation & Audit Dashboard.
-- The application can map these tables through Prisma models in schema.prisma while production
-- deployments use PostgreSQL, immutable audit triggers, and hash validation middleware.

CREATE TYPE customs_record_status AS ENUM ('Pending', 'Released', 'Hold', 'Cancelled');
CREATE TYPE reconciliation_stock_status AS ENUM ('Balanced', 'Investigate', 'Critical');

CREATE TABLE "Import_Logs" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_no text UNIQUE NOT NULL,
  import_date timestamptz NOT NULL,
  invoice_no text NOT NULL,
  supplier_name text NOT NULL,
  part_id text NOT NULL,
  part_name text NOT NULL,
  qty_imported numeric(18, 4) NOT NULL CHECK (qty_imported >= 0),
  uom text NOT NULL,
  bonded_status text NOT NULL,
  customs_status customs_record_status NOT NULL DEFAULT 'Pending',
  document_pdf_url text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Production_Consumption_Logs" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id text NOT NULL,
  production_line text NOT NULL,
  machine_id text NOT NULL,
  operator_name text NOT NULL,
  part_id text NOT NULL,
  qty_consumed numeric(18, 4) NOT NULL CHECK (qty_consumed >= 0),
  trigger_timestamp timestamptz NOT NULL,
  cctv_reference_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Stock_Inventory" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_zone text NOT NULL,
  rack_location text NOT NULL,
  part_id text NOT NULL,
  bonded_stock_qty numeric(18, 4) NOT NULL CHECK (bonded_stock_qty >= 0),
  physical_stock_qty numeric(18, 4) NOT NULL CHECK (physical_stock_qty >= 0),
  last_cycle_count timestamptz,
  stock_status reconciliation_stock_status NOT NULL DEFAULT 'Balanced',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "BOM_Mapping" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  raw_material_id text NOT NULL,
  qty_per_unit numeric(18, 6) NOT NULL CHECK (qty_per_unit > 0),
  revision_no text NOT NULL,
  effective_date date NOT NULL
);

CREATE TABLE "Audit_Trail" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  module_name text NOT NULL,
  action_type text NOT NULL,
  reference_id text NOT NULL,
  user_name text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  hash_value text UNIQUE NOT NULL,
  ip_address inet NOT NULL,
  cctv_video_url text,
  remarks text
);

CREATE TABLE "CCTV_Events" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_timestamp timestamptz NOT NULL,
  camera_id text NOT NULL,
  video_url text NOT NULL,
  snapshot_thumbnail_url text NOT NULL,
  related_transaction_id text NOT NULL,
  timeline_marker interval NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION prevent_audit_trail_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Audit_Trail is immutable and append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_trail_no_update
BEFORE UPDATE OR DELETE ON "Audit_Trail"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_trail_mutation();

CREATE INDEX import_logs_part_idx ON "Import_Logs" (part_id);
CREATE INDEX production_consumption_part_idx ON "Production_Consumption_Logs" (part_id, trigger_timestamp DESC);
CREATE INDEX stock_inventory_location_idx ON "Stock_Inventory" (warehouse_zone, rack_location);
CREATE INDEX stock_inventory_part_idx ON "Stock_Inventory" (part_id);
CREATE INDEX bom_mapping_product_idx ON "BOM_Mapping" (product_id, raw_material_id);
CREATE INDEX audit_trail_transaction_idx ON "Audit_Trail" (transaction_id, timestamp DESC);
CREATE INDEX cctv_events_transaction_idx ON "CCTV_Events" (related_transaction_id, event_timestamp DESC);
