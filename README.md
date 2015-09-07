#PDBF - A Toolkit for Creating Janiform Data Documents
Version 1.0.3

##Bugs, Suggestions, Feature requests
If you encounter bugs, have suggestions or have a feature request, then please go to the [issue page](https://github.com/uds-datalab/PDBF/issues) open a new issue if necessary and explain your concern.
You can also write me an email (ichbinkeinreh@t-online.de).

##Abstract
PDBF documents are a hybrid format. They are a valid PDF and a valid HTML page at the same time. You can now optionally add an VirtualBox OVA file with a complete operating system to the PDBF document. Yes, this means that the resulting file is a valid PDF, HTML, and OVA file at the same time. If you change the file extension to PDF and open it with an PDF viewer, you can see the static part of the document. If you change the file extension to HTML and open it with a Browser (currently Chrome/Firefox/Safari/IE 10 supported), you can see the dynamic part of the document. And if an ova file is attached you can also change the file extension to OVA and install and run the attached operating system.
The difference between the PDF and the HTML version is that the PDF version contains static version of all PDBF elements, whereas the HTML version is dynamic. For example you can zoom into graphs, temporarly remove dataseries from the graph, inspect and change the underling query of the PDBF element and see the result of the change directly in the browser.
This approach works completely offline. No internet connection is required, neither at compile time, nor at viewing time.

PDBF files are created from LaTeX source code and a relational database. The raw data can either be a SQL statement string, a file with SQL statements, or contained in a database (currently PostgreSQL/MySQL/MariaDB supported). In the LaTeX code you can then specify how the PDBF element (currently charts/pivot tables/multiplot charts/sql statements/dataTexts/dataTables are supported) is created from the raw data with options and an SQL query. Read more in the [documentation](http://uds-datalab.github.io/PDBF/), which is itself is a PDBF document.

PDBF toolkit is written in Java and LaTeX and can be used to compile documents on Windows, Mac and Linux. PDBF documents are also platform independent and run on any desktop OS (Windows, Linux, Mac) with a browser/PDF viewer.

A [demo paper](https://infosys.uni-saarland.de/publications/p1972-dittrich.html) of our tool is appearing at [VLDB 2015](http://www.vldb.org/2015/). 

TEST

##License
This toolkit is licensed unter the MIT License (see [here](https://github.com/uds-datalab/PDBF/blob/gh-pages/LICENSE.md))

##Getting started
* Make sure you have a Java Runtime (version >= 1.7) installed
* [Download the latest version](https://github.com/uds-datalab/PDBF/archive/gh-pages.zip)
* Extract zip and change workingdir to extracted folder
* Adjust config.cfg
* Try to compile pdbf-doc.tex file with this command: java -jar pdbf.jar pdbf-doc.tex
* Open pdbf-doc.html, this is the final output of the compilation process, if you rename it to ".pdf" it is also a valid pdf-document
* Optionally you can attach the included vldb-Invaders.ova (Space invaders clone) or [download the dsl.ova](https://github.com/uds-datalab/PDBF/releases/download/1.0.1/dsl.ova) (Damn small linux) VirtualBox image and attach it to the compiled PDBF file with this command: java -jar pdbf.jar --vm pdbf-doc.html vldb-Invaders.ova
* You can play around with the minimal.tex file which contains a minimal example of PDBF usage
* For further information take a look at the [documentation](http://uds-datalab.github.io/PDBF/)

##Thanks to the authors of:
* phantomJS (https://github.com/ariya/phantomjs)
* Apache Commons IO (http://commons.apache.org/proper/commons-io/)
* Apache Commons Codec (http://commons.apache.org/proper/commons-codec/)
* google-gson (https://github.com/google/gson)
* postgreSQL JDBC Driver (https://jdbc.postgresql.org/)
* MariaDB JDBC Driver (https://mariadb.com/kb/en/mariadb/about-the-mariadb-java-client/)
* AlaSQL (https://github.com/agershun/alasql)
* C3 (https://github.com/masayuki0812/c3)
* D3 (https://github.com/mbostock/d3)
* Codemirror (https://github.com/codemirror/codemirror)
* google-diff-match-patch (https://code.google.com/p/google-diff-match-patch/)
* explorercanvas (https://code.google.com/p/explorercanvas/)
* DataTables (https://github.com/DataTables/DataTables)
* jQuery (https://github.com/jquery/jquery)
* jQuery-UI (https://github.com/jquery/jquery-ui)
* jStat (https://github.com/jstat/jstat)
* pivottable (https://github.com/nicolaskruchten/pivottable)
* PDF.js (https://github.com/mozilla/pdf.js)
* google-closure-compiler (https://github.com/google/closure-compiler)
* lz-string (https://github.com/pieroxy/lz-string)
