DROP VIEW IF EXISTS v_experiment_stats CASCADE;
CREATE OR REPLACE VIEW v_experiment_stats AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, timeid,
    AVG(runtime) AS avg_runtime, stddev_samp(runtime) AS stdev_runtime,
    rsql_margin_of_error(stddev_samp(runtime), COUNT(*)) AS margin_of_error_runtime,
    array_accum(runtime) as runtimes
  FROM fact_experiment
  GROUP BY machineid, datasetid, queryid, compilerid, layoutid, implementationid, timeid;

DROP VIEW IF EXISTS v_experiment_stats_outliers_removed CASCADE;
CREATE OR REPLACE VIEW v_experiment_stats_outliers_removed AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, timeid,
    rsql_call_func(runtimes, 'mean') AS avg_runtime,
    rsql_call_func(runtimes, 'sd') AS stdev_runtime,
    rsql_margin_of_error(
        rsql_call_func(runtimes, 'sd'),
        array_length(runtimes, 1)
    ) AS margin_of_error_runtime,
    runtimes
  FROM (
         SELECT
           machineid,
           datasetid,
           queryid,
           compilerid,
           layoutid,
           implementationid,
           timeid,
           margin_of_error_runtime,
           rsql_remove_outlier(runtimes, margin_of_error_runtime, avg_runtime) AS runtimes
         FROM v_experiment_stats
       ) AS t;

DROP MATERIALIZED VIEW IF EXISTS v_experiment_stats_latest CASCADE;
CREATE MATERIALIZED VIEW v_experiment_stats_latest AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid,
    last_value(avg_runtime) OVER w AS avg_runtime, last_value(stdev_runtime) OVER w AS stdev_runtime,
    last_value(margin_of_error_runtime) OVER w AS margin_of_error_runtime, last_value(runtimes) OVER w as runtimes
  FROM v_experiment_stats_outliers_removed v
    JOIN dim_time t ON v.timeid = t.id
  WINDOW w AS (PARTITION BY machineid, datasetid, queryid, compilerid, layoutid, implementationid ORDER BY t.timestamp);

CREATE INDEX i_v_experiment_stats_latest_problem ON v_experiment_stats_latest(machineid, datasetid, queryid);

-- smallest possible value for the average runtime with 95% confidence - per experiment (templates/paramN, without row and column)
CREATE OR REPLACE VIEW v_experiment_minimal AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes, avg_runtime, margin_of_error_runtime
  FROM (
    SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes,
      avg_runtime, margin_of_error_runtime,
    MIN(avg_runtime - margin_of_error_runtime) OVER
      (PARTITION BY machineid, datasetid, queryid, compilerid) AS min_interval
  FROM v_experiment_stats_latest) AS t
  WHERE avg_runtime - margin_of_error_runtime = min_interval;

DROP VIEW IF EXISTS v_experiment_compare2best CASCADE;
CREATE OR REPLACE VIEW v_experiment_compare2best AS
SELECT vl.machineid, vl.datasetid, vl.queryid, vl.compilerid, vl.layoutid, vl.implementationid,
  ARRAY[vl.avg_runtime - vl.margin_of_error_runtime, vl.avg_runtime + vl.margin_of_error_runtime] as confidence_interval,
  ARRAY[vb.avg_runtime - vb.margin_of_error_runtime, vb.avg_runtime + vb.margin_of_error_runtime] as confidence_interval_best,
  vl.runtimes,
  vb.runtimes AS best_runtimes,
  rsql_t_test(vl.runtimes, vb.runtimes) AS t_best
FROM v_experiment_stats_latest vl INNER JOIN v_experiment_minimal vb
    ON (vb.machineid = vl.machineid AND vb.datasetid = vl.datasetid AND vb.queryid = vl.queryid
        AND vb.compilerid = vl.compilerid);

DROP VIEW IF EXISTS v_experiment_best CASCADE;
CREATE OR REPLACE VIEW v_experiment_best AS
SELECT *, 1.0 / count(CASE WHEN t_best THEN 1 ELSE null END) OVER
  (PARTITION BY machineid, datasetid, queryid, compilerid) AS weight
FROM v_experiment_compare2best
WHERE t_best;

-- smallest possible value for the average runtime with 95% confidence - per problem (machine, schema, query)
CREATE OR REPLACE VIEW v_problem_minimal AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes, avg_runtime, margin_of_error_runtime
  FROM (
         SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes,
           avg_runtime, margin_of_error_runtime,
           MIN(avg_runtime - margin_of_error_runtime) OVER
             (PARTITION BY machineid, datasetid, queryid) AS min_interval
         FROM v_experiment_stats_latest) AS t
  WHERE avg_runtime - margin_of_error_runtime = min_interval;

-- largest possible value for the average runtime with 95% confidence - per problem (machine, schema, query)
CREATE OR REPLACE VIEW v_problem_maximal AS
  SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes, avg_runtime, margin_of_error_runtime
  FROM (
         SELECT machineid, datasetid, queryid, compilerid, layoutid, implementationid, runtimes,
           avg_runtime, margin_of_error_runtime,
           MAX(avg_runtime + margin_of_error_runtime) OVER
             (PARTITION BY machineid, datasetid, queryid) AS max_interval
         FROM v_experiment_stats_latest) AS t
  WHERE avg_runtime + margin_of_error_runtime = max_interval;

DROP VIEW IF EXISTS v_problem_bests CASCADE;
CREATE OR REPLACE VIEW v_problem_bests AS
  SELECT vl.machineid, vl.datasetid, vl.queryid, vl.compilerid, vl.layoutid, vl.implementationid,
    ARRAY[vl.avg_runtime - vl.margin_of_error_runtime, vl.avg_runtime + vl.margin_of_error_runtime] as confidence_interval
  FROM v_experiment_stats_latest vl INNER JOIN v_problem_minimal vb
      ON (vb.machineid = vl.machineid AND vb.datasetid = vl.datasetid AND vb.queryid = vl.queryid)
  WHERE rsql_t_test(vl.runtimes, vb.runtimes);

DROP VIEW IF EXISTS v_problem_compare2best CASCADE;
CREATE OR REPLACE VIEW v_problem_compare2best AS
  SELECT vl.machineid, vl.datasetid, vl.queryid, vl.compilerid, vl.layoutid, vl.implementationid,
    ARRAY[vl.avg_runtime - vl.margin_of_error_runtime, vl.avg_runtime + vl.margin_of_error_runtime] as confidence_interval,
    ARRAY[vb.avg_runtime - vb.margin_of_error_runtime, vb.avg_runtime + vb.margin_of_error_runtime] as confidence_interval_best,
    vl.runtimes,
    vb.runtimes AS best_runtimes,
    rsql_t_test(vl.runtimes, vb.runtimes) AS t_best
  FROM v_experiment_stats_latest vl INNER JOIN v_problem_minimal vb
      ON (vb.machineid = vl.machineid AND vb.datasetid = vl.datasetid AND vb.queryid = vl.queryid);


-------- Textual versions of the above created views ---------

DROP VIEW IF EXISTS v_experiment_stats_textual CASCADE;
CREATE OR REPLACE VIEW v_experiment_stats_textual AS
  SELECT
    m.cpu || ' (' ||  m.cpuarchitecture || ')'   AS "Machine",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    COALESCE(cast(l.chunksize AS VARCHAR), 'n/a') AS "Chunk size [tuples]",
    CASE i.templateparam WHEN TRUE THEN 'Compile time' WHEN FALSE THEN 'Runtime' ELSE 'n/a' END AS "Chunk size provided at",
    CASE i.logscaleparam WHEN TRUE THEN 'Powers of 2' WHEN FALSE THEN 'Multiples of 2' ELSE 'n/a' END AS "Chunk sizes considered",
    to_char(t.timestamp, 'yyyy-MM-dd HH:mm:ss')     AS "Time of experiment",
    to_char(v.avg_runtime, '0.999')   AS "Average query time [sec]",
    to_char(v.stdev_runtime, '0.9999') AS "STDEV of query time",
    ARRAY[to_char(v.avg_runtime - v.margin_of_error_runtime, '0.999'), to_char(v.avg_runtime + v.margin_of_error_runtime, '0.999')] AS "Confidence interval of query time"
  FROM v_experiment_stats AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
    JOIN dim_time t ON t.id = v.timeid
  ORDER BY m.id DESC, d.tableschema, q.querytext,
    c.compiler, c.optlevel, i.templateparam, i.logscaleparam, l.chunksize;

DROP VIEW IF EXISTS v_experiment_compare2best_textual CASCADE;
CREATE OR REPLACE VIEW v_experiment_compare2best_textual AS
  SELECT
    m.cpu || ' (' ||  m.cpuarchitecture || ')'   AS "Machine",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    COALESCE(cast(l.chunksize AS VARCHAR), 'n/a') AS "Chunk size [tuples]",
    CASE i.templateparam WHEN TRUE THEN 'Compile time' WHEN FALSE THEN 'Runtime' ELSE 'n/a' END AS "Chunk size provided at",
    CASE i.logscaleparam WHEN TRUE THEN 'Powers of 2' WHEN FALSE THEN 'Multiples of 2' ELSE 'n/a' END AS "Chunk sizes considered",
    v.confidence_interval[1] AS "ConfIntLow",
    v.confidence_interval[2] AS "ConfIntHigh",
    v.runtimes[1] AS Run1,
    v.runtimes[2] AS Run2,
    v.runtimes[3] AS Run3,
    v.runtimes[4] AS Run4,
    v.runtimes[5] AS Run5,
    v.t_best AS "Best solution"
  FROM v_experiment_compare2best AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
  ORDER BY m.id DESC, d.tableschema, q.querytext,
    c.id, i.templateparam, i.logscaleparam, l.chunksize;

DROP VIEW IF EXISTS v_experiment_best_textual CASCADE;
CREATE OR REPLACE VIEW v_experiment_best_textual AS
  SELECT
    m.cpu || ' (' ||  m.cpuarchitecture || ')'   AS "Machine",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    COALESCE(cast(l.chunksize AS VARCHAR), 'n/a') AS "Chunk size [tuples]",
    CASE i.templateparam WHEN TRUE THEN 'Compile time' WHEN FALSE THEN 'Runtime' ELSE 'n/a' END AS "Chunk size provided at",
    CASE i.logscaleparam WHEN TRUE THEN 'Powers of 2' WHEN FALSE THEN 'Multiples of 2' ELSE 'n/a' END AS "Chunk sizes considered",
    ARRAY[to_char(v.confidence_interval[1], '0.999'), to_char(v.confidence_interval[2], '0.999')] AS "Confidence interval of query time",
    ARRAY[to_char(v.confidence_interval_best[1], '0.999'), to_char(v.confidence_interval_best[2], '0.999')] AS "Confidence interval of best query time",
    v.weight AS "Weighting factor"
  FROM v_experiment_best AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
  ORDER BY m.id DESC, d.tableschema, q.querytext,
    c.id, i.templateparam, i.logscaleparam, l.chunksize;

DROP VIEW IF EXISTS v_problem_bests_textual CASCADE;
CREATE OR REPLACE VIEW v_problem_bests_textual AS
  SELECT
    m.cpu || ' (' ||  m.cpuarchitecture || ')'   AS "Machine",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    COALESCE(cast(l.chunksize AS VARCHAR), 'n/a') AS "Chunk size [tuples]",
    CASE i.templateparam WHEN TRUE THEN 'Compile time' WHEN FALSE THEN 'Runtime' ELSE 'n/a' END AS "Chunk size provided at",
    CASE i.logscaleparam WHEN TRUE THEN 'Powers of 2' WHEN FALSE THEN 'Multiples of 2' ELSE 'n/a' END AS "Chunk sizes considered",
    ARRAY[to_char(v.confidence_interval[1], '0.999'), to_char(v.confidence_interval[2], '0.999')] AS "95% confidence interval of query time"
  FROM v_problem_bests AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
  ORDER BY m.id DESC, d.tableschema, q.querytext,
    c.compiler, c.optlevel, i.templateparam, i.logscaleparam, l.chunksize;

DROP VIEW IF EXISTS v_problem_compare2best_textual CASCADE;
CREATE OR REPLACE VIEW v_problem_compare2best_textual AS
  SELECT
    m.cpu || ' (' ||  m.cpuarchitecture || ')'   AS "Machine",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    COALESCE(cast(l.chunksize AS VARCHAR), 'n/a') AS "Chunk size [tuples]",
    CASE i.templateparam WHEN TRUE THEN 'Compile time' WHEN FALSE THEN 'Runtime' ELSE 'n/a' END AS "Chunk size provided at",
    CASE i.logscaleparam WHEN TRUE THEN 'Powers of 2' WHEN FALSE THEN 'Multiples of 2' ELSE 'n/a' END AS "Chunk sizes considered",
    v.confidence_interval[1] AS "ConfIntLow",
    v.confidence_interval[2] AS "ConfIntHigh",
    v.t_best AS "Best solution"
  FROM v_problem_compare2best AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
  ORDER BY m.id DESC, d.tableschema, q.querytext,
    c.id, i.templateparam, i.logscaleparam, l.chunksize;

CREATE OR REPLACE VIEW v_experiment_compare2MultipleBest_textual AS
SELECT *
FROM (
       SELECT *, count(CASE WHEN "Best solution" THEN 1 ELSE null END) OVER
         (PARTITION BY v."Machine", v."Table schema", v."Query", v."Compiler", v."Opt. level") AS best_count
       FROM v_experiment_compare2best_textual v
     ) AS t
WHERE best_count > 1;


--------------- Older views: -----------------

DROP VIEW IF EXISTS v_row_column_bestchunkedcolumn CASCADE;
CREATE OR REPLACE VIEW v_row_column_bestchunkedcolumn AS
  SELECT
    machineid,
    datasetid,
    queryid,
    compilerid,
    layoutid,
    implementationid,
    'rowLayout'     AS layoutName,
    AVG(avgruntime) AS bestruntime
  FROM fact_experiment
    JOIN dim_layout ON dim_layout.id = fact_experiment.layoutid
  WHERE dim_layout.name = 'row'
  GROUP BY compilerid, datasetid, queryid, implementationid, machineid, layoutid
  UNION
  SELECT
    machineid,
    datasetid,
    queryid,
    compilerid,
    layoutid,
    implementationid,
    'columnLayout'  AS layoutName,
    AVG(avgruntime) AS bestruntime
  FROM fact_experiment
    JOIN dim_layout ON dim_layout.id = fact_experiment.layoutid
  WHERE dim_layout.name = 'column'
  GROUP BY compilerid, datasetid, queryid, implementationid, machineid, layoutid
  UNION
  SELECT
    machineid,
    datasetid,
    queryid,
    compilerid,
    layoutid,
    implementationid,
    'chunkedColumn' AS layoutName,
    bestruntime
  FROM (
         SELECT
           compilerid,
           datasetid,
           queryid,
           implementationid,
           machineid,
           layoutid,
           avgruntime,
           MIN(avgruntime)
           OVER (PARTITION BY compilerid, datasetid, queryid, machineid) AS bestruntime
         FROM fact_experiment
           JOIN dim_layout ON dim_layout.id = fact_experiment.layoutid
         WHERE dim_layout.name LIKE
               'columnX%' --OR dim_layout.name LIKE 'columnLinear%' TODO temporarily discarded linear chunksizes, because of the Houston! problems
       ) AS t
  WHERE avgruntime = bestruntime;


DROP VIEW IF EXISTS v_row_column_bestchunkedcolumn_textual CASCADE;
CREATE OR REPLACE VIEW v_row_column_bestchunkedcolumn_textual AS
  SELECT
    m.clustername   AS "Cluster",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    layoutName      AS "Layout category",
    l.name          AS "Layout name",
    l.chunksize     AS "Chunk size [tuples]",
    i.templateparam AS "Template param",
    i.logscaleparam AS "Log-scale param",
    v.bestruntime   AS "Best query time [sec]"
  FROM v_row_column_bestchunkedcolumn AS v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid
  ORDER BY m.clustername, d.tableschema, q.querytext,
    c.compiler, c.optlevel, v.layoutid;


DROP VIEW IF EXISTS v_row_column_bestchunkedcolumn_pivot CASCADE;
CREATE OR REPLACE VIEW v_row_column_bestchunkedcolumn_pivot AS
  SELECT
    row_name [1] AS machineid,
    row_name [2] AS datasetid,
    row_name [3] AS queryid,
    row_name [4] AS compilerid,
    rowLayout,
    columnLayout,
    chunkedColumn,
    layoutid,
    implementationid
  FROM (
         SELECT *
         FROM crosstab(
                  'SELECT ARRAY[machineid, datasetid, queryid, compilerid] AS row_name,
                      layoutid, implementationid, layoutName, bestruntime
                   FROM v_row_column_bestchunkedcolumn
                   ORDER BY 1, 2 DESC, 3',  -- TODO check out if the ordering is OK, or not
                  $$VALUES ('rowLayout'), ('columnLayout'), ('chunkedColumn')$$
              )
           AS ct(row_name INT [], layoutid INT, implementationid INT, rowLayout DOUBLE PRECISION, columnLayout DOUBLE PRECISION, chunkedColumn DOUBLE PRECISION)
       ) AS t;


DROP VIEW IF EXISTS v_row_column_bestchunkedcolumn_pivot_textual;
CREATE OR REPLACE VIEW v_row_column_bestchunkedcolumn_pivot_textual AS
  SELECT
    m.clustername   AS "Cluster",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    v.rowLayout     AS "Query time for row layout [sec]",
    v.columnLayout  AS "Query time for column layout [sec]",
    v.chunkedColumn AS "Query time for the best chunked column layout [sec]",
    l.name          AS "Layout name for the best chunked column layout",
    l.chunksize     AS "Chunk size for the best chunked column layout [tuples]",
    i.templateparam AS "Template param for the best chunked column layout",
    i.logscaleparam AS "Log-scale param for the best chunked column layout"
  FROM v_row_column_bestchunkedcolumn_pivot v
    JOIN dim_machine m ON m.id = v.machineid
    JOIN dim_dataset d ON d.id = v.datasetid
    JOIN dim_compiler c ON c.id = v.compilerid
    JOIN dim_layout l ON l.id = v.layoutid
    JOIN dim_implementation i ON i.id = v.implementationid
    JOIN dim_query q ON q.id = v.queryid;

-- The catalog of the best approaches:
CREATE OR REPLACE VIEW v_bestSolutions AS
  SELECT
    m.clustername   AS "Cluster",
    d.tableschema   AS "Table schema",
    q.querytext     AS "Query",
    c.compiler      AS "Compiler",
    c.optlevel      AS "Opt. level",
    l.name          AS "Layout name",
    l.chunksize     AS "Chunk size [tuples]",
    i.templateparam AS "Template param",
    i.logscaleparam AS "Log-scale param",
    t.bestruntime   AS "Best query time [sec]"
  FROM (
         SELECT
           machineid,
           datasetid,
           queryid,
           compilerid,
           layoutid,
           implementationid,
           bestRuntimePerCompiler,
           MIN(bestRuntimePerCompiler)
           OVER (PARTITION BY machineid, datasetid, queryid) AS bestRuntime
         FROM (
                SELECT
                  machineid,
                  datasetid,
                  queryid,
                  compilerid,
                  layoutid,
                  implementationid,
                  LEAST(rowLayout, columnLayout, chunkedColumn) AS bestRuntimePerCompiler
                FROM v_row_column_bestchunkedcolumn_pivot
              ) AS t_inner
       ) AS t
    JOIN dim_machine m ON m.id = t.machineid
    JOIN dim_dataset d ON d.id = t.datasetid
    JOIN dim_query q ON q.id = t.queryid
    JOIN dim_compiler c ON c.id = t.compilerid
    JOIN dim_layout l ON l.id = t.layoutid
    JOIN dim_implementation i ON i.id = t.implementationid
  WHERE bestRuntimePerCompiler = bestRuntime;