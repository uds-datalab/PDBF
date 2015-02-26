CREATE TABLE dim_compiler
(
    id INT PRIMARY KEY NOT NULL,
    compiler VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    optlevel VARCHAR(200) NOT NULL
);

CREATE TABLE dim_dataset
(
    id INT PRIMARY KEY NOT NULL,
    tableschema VARCHAR(200) NOT NULL,
    tuplecount BIGINT NOT NULL
);

CREATE TABLE dim_implementation
(
    id INT PRIMARY KEY NOT NULL,
    templateparam BOOL,
    logscaleparam BOOL
);

CREATE TABLE dim_layout
(
    id INT PRIMARY KEY NOT NULL,
    name VARCHAR(20) NOT NULL,
    chunksize INT
);

CREATE TABLE dim_machine
(
    id INT PRIMARY KEY NOT NULL,
    hostname VARCHAR(20) NOT NULL,
    clustername VARCHAR(20),
    cpu VARCHAR(100) NOT NULL,
    cpuarchitecture VARCHAR(20),
    ram VARCHAR(100)
);

CREATE TABLE dim_query
(
    id INT PRIMARY KEY NOT NULL,
    querytext VARCHAR(200) NOT NULL
);

CREATE TABLE dim_time
(
    id SERIAL PRIMARY KEY NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE TABLE fact_experiment
(
    machineid INT NOT NULL,
    datasetid INT NOT NULL,
    queryid INT NOT NULL,
    compilerid INT NOT NULL,
    layoutid INT NOT NULL,
    implementationid INT,
    timeid INT NOT NULL,
    runtime DOUBLE PRECISION NOT NULL
);

ALTER TABLE fact_experiment ADD FOREIGN KEY (machineid) REFERENCES dim_machine (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (datasetid) REFERENCES dim_dataset (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (queryid) REFERENCES dim_query (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (compilerid) REFERENCES dim_compiler (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (layoutid) REFERENCES dim_layout (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (implementationid) REFERENCES dim_implementation (id) ON UPDATE CASCADE;
ALTER TABLE fact_experiment ADD FOREIGN KEY (timeid) REFERENCES dim_time(id) ON UPDATE CASCADE;
CREATE INDEX fki_machine ON fact_experiment (machineid);
CREATE INDEX fki_dataset ON fact_experiment (datasetid);
CREATE INDEX fki_query ON fact_experiment (queryid);
CREATE INDEX fki_compiler ON fact_experiment (compilerid);
CREATE INDEX fki_layout ON fact_experiment (layoutid);
CREATE INDEX fki_implementation ON fact_experiment (implementationid);
CREATE INDEX fki_time ON fact_experiment (timeid);
