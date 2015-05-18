#PDBF project - A toolkit for crating PDBF documents.
PDBF documents are a hybrid format. They are a valid PDF and a valid HTML page at the same time. 
If you change the file extension to PDF and open it with an PDF viewer you can see the static part of the document. If you change the file extension to HTML and open it with a Browser (currently Chrome/Firefox/IE 10 supported) you can see the dynamic part of the document. For example if the static version contains an image of a chart which displays some data, then the dynamic version contains the actual raw data used to render the chart and renders the chart when opening the document. The advantage is that you can open the chart in an overlay view by clicking on the enlarge symbol at the upper left corner and then start to change parameters of the chart. For example you can remove filtering functions that are applied to the raw data or change confidence levels to other values an see the results of these changes directly in the chart. 

PDBF files are created from LaTeX code and data in SQL format. The raw data can either be a SQL statements string, a file with SQL statements, or in a database (currently PostgreSQL/MySQL/MariaDB supported). In the LaTeX code one can then specify how the PDBF element (currently charts/pivot tables/multiplot charts/sql statements are supported) is created from the raw data with options and an SQL query. Read more in the Documentation -> http://ichbinkeinreh.de/PDBF/Documentation.html (which is itself a PDBF document).

This toolkit is licensed unter the MIT License.

Thanks to the authors of:
phantomJS (https://github.com/ariya/phantomjs)
Apache Commons IO (http://commons.apache.org/proper/commons-io/)
Apache Commons Codec (http://commons.apache.org/proper/commons-codec/)
google-gson (https://github.com/google/gson)
postgreSQL JDBC Driver (https://jdbc.postgresql.org/)
MariaDB JDBC Driver (https://mariadb.com/kb/en/mariadb/about-the-mariadb-java-client/)
AlaSQL (https://github.com/agershun/alasql)
C3 (https://github.com/masayuki0812/c3)
D3 (https://github.com/mbostock/d3)
Codemirror (https://github.com/codemirror/codemirror)
google-diff-match-patch (https://code.google.com/p/google-diff-match-patch/)
explorercanvas (https://code.google.com/p/explorercanvas/)
DataTables (https://github.com/DataTables/DataTables)
jQuery (https://github.com/jquery/jquery)
jQuery-UI (https://github.com/jquery/jquery-ui)
jStat (https://github.com/jstat/jstat)
pivottable (https://github.com/nicolaskruchten/pivottable)
PDF.js (https://github.com/mozilla/pdf.js)
