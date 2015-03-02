DROP FUNCTION rsql_t_test(x FLOAT8[], y FLOAT8[]);
CREATE OR REPLACE FUNCTION rsql_t_test(x FLOAT8[], y FLOAT8[]) RETURNS BOOLEAN AS '
    t.test(x,y)[''p.value''] >= 0.05
' LANGUAGE 'plr' STRICT;

CREATE OR REPLACE FUNCTION rsql_margin_of_error(stdev DOUBLE PRECISION, n BIGINT) RETURNS FLOAT8 AS
  'qt(0.975,df=n-1) * stdev * sqrt(n) '
LANGUAGE 'plr' STRICT;

CREATE OR REPLACE FUNCTION rsql_call_func(x FLOAT8[], function_name VARCHAR) RETURNS FLOAT8 AS
  'do.call(function_name, list(x))'
LANGUAGE 'plr' STRICT;

CREATE AGGREGATE array_accum(anyelement) (
  sfunc = array_append,
  stype = anyarray,
  initcond = '{}'
);

--CREATE TYPE outlier_stats AS (outlier float8, is_outlier boolean);

DROP FUNCTION rsql_contains_outlier(x FLOAT8[]);
CREATE OR REPLACE FUNCTION rsql_contains_outlier(x FLOAT8[]) RETURNS BOOLEAN AS '
    library(outliers)
    grubbs.test(x, two.sided = TRUE)[''p.value''] <= 0.05
' LANGUAGE 'plr' STRICT;

CREATE OR REPLACE FUNCTION rsql_get_outlier(x FLOAT8[]) RETURNS FLOAT8 AS '
    library(outliers)
    strsplit(grubbs.test(x, two.sided = TRUE)$alternative, " ")[[1]][3]
' LANGUAGE 'plr' STRICT;

CREATE OR REPLACE FUNCTION rsql_remove_outlier(runtimes FLOAT8[], margin_of_error_runtime FLOAT8, avg_runtime FLOAT8) RETURNS FLOAT8[] AS $$
BEGIN
--IF rsql_contains_outlier(x) AND margin_of_error_runtime >= 0.02
  IF rsql_contains_outlier(runtimes) AND margin_of_error_runtime / avg_runtime >= 0.025
  THEN
    RETURN array_remove(runtimes, rsql_get_outlier(runtimes));
  ELSE
    RETURN runtimes;
  END IF;
END;
$$ LANGUAGE plpgsql;
