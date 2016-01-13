#PDBF - A Toolkit for Creating Janiform Data Documents
Version 1.2.2

##Bugs, Suggestions, Feature requests
If you encounter bugs, have suggestions or have a feature request, then please go to the [issue page](https://github.com/uds-datalab/PDBF/issues) open a new issue if necessary and explain your concern.
You can also write us an email (ichbinkeinreh at t-online.de or jens.dittrich at cs.uni-saarland.de).

##Abstract
PDBF documents are a hybrid format. They are a valid PDF and a valid HTML page at the same time. You can now optionally add an VirtualBox OVA file with a complete operating system to the PDBF document. Yes, this means that the resulting file is a valid PDF, HTML, and OVA file at the same time. If you change the file extension to PDF and open it with an PDF viewer, you can see the static part of the document. If you change the file extension to HTML and open it with a Browser (currently Chrome/Firefox/Safari/IE 10 supported), you can see the dynamic part of the document. And if an ova file is attached you can also change the file extension to OVA and install and run the attached operating system.
The difference between the PDF and the HTML version is that the PDF version contains static version of all PDBF elements, whereas the HTML version is dynamic. For example you can zoom into graphs, temporarly remove dataseries from the graph, inspect and change the underling query of the PDBF element and see the result of the change directly in the browser.
This approach works completely offline. No internet connection is required, neither at compile time, nor at viewing time.

PDBF files are created from LaTeX source code and a relational database. The raw data can either be a SQL statement string, a file with SQL statements, or contained in a database (currently PostgreSQL/MySQL/MariaDB supported). In the LaTeX code you can then specify how the PDBF element (currently charts/pivot tables/multiplot charts/sql statements/dataTexts/dataTables are supported) is created from the raw data with options and an SQL query. Read more in the [documentation](http://uds-datalab.github.io/PDBF/), which is itself is a PDBF document.

PDBF toolkit is written in Java and LaTeX and can be used to compile documents on Windows, Mac, and Linux. PDBF documents are also platform independent and run on any desktop OS (Windows, Linux, Mac) with a browser/PDF viewer.

A [demo paper](https://infosys.uni-saarland.de/publications/p1972-dittrich.html) of our tool appeared at [VLDB 2015](http://www.vldb.org/2015/). 

##License
This toolkit is licensed unter the MIT License (see [here](https://github.com/uds-datalab/PDBF/blob/gh-pages/LICENSE.md))

##Getting started
* Make sure you have a Java Runtime (version >= 1.7) and a LaTeX distribution installed
* [Download the latest version](https://github.com/uds-datalab/PDBF/archive/gh-pages.zip)
* Extract zip and change workingdir to extracted folder
* Adjust config.cfg
* Try to compile minimal.tex file with this command: **java -jar pdbf.jar minimal.tex**
* Open minimal.html, this is the final output of the compilation process, if you rename it to ".pdf" it is also a valid pdf-document
* Optionally you can attach the included vldb-Invaders.ova (Space invaders clone) or [download the dsl.ova](https://github.com/uds-datalab/PDBF/releases/download/1.0.1/dsl.ova) (Damn small linux) VirtualBox image and attach it to the compiled PDBF file with this command: **java -jar pdbf.jar --vm minimal.html vldb-Invaders.ova**
* Open minimal.ova (if you have VirtualBox installed), this is the final output with the attached ova file. Its still a valid pdf and html at the same time.
* You can play around with the minimal.tex file. It contains a small example on how to specify PDBF elements in LaTeX
* For further information take a look at the [documentation](http://uds-datalab.github.io/PDBF/)

##Features
#####Automatic generation of Charts, Multiplot Charts, Pivot tables
With PDBF you don't need to manually generate these kinds of elements. The PDBF compiler automatically generates a static version for the pdf and the dynamic version for the html part of the PDBF document. This also means that your document is always up to date! If you change something in the underlying data that generate your PDBF document and then recompile the document, then the data in the document is up to date. No need to manually update externally generated charts or pivot tables.

#####Generate your document directly from the results of your experiment
The idea of PDBF is to store the results of the experiment directly in the document and to make it more transparent how this chart, pivot table, etc. was generated from the result data. Therefore we currently support CSV files, SQL files, and SQL servers as data sources and use SQL as description language for the transformation of the raw result data to the final representation in the document.

#####Compile LaTeX to single HTML file
You can also use the PDBF compiler to compile your LaTeX files to a single HTML file.
To do so just run the compiler as on any other document (you dont need to include the pdbf package in your tex file):

java -jar pdbf.jar sometexfile.tex

The resulting HTML file is saved in the same folder with the same name but html ending.

##Build Instructions
* Run "mvn package" if you only want to compile pdbf.jar
* Run "mvn verify" if you want to compile pdbf.jar and run integration tests.

Note: The compiled pdbf.jar is automatically copied from target to the main folder.

##Thanks to the authors of:
* phantomJS (https://github.com/ariya/phantomjs)
* Apache Commons (http://commons.apache.org/)
* Apache PDFBox (https://pdfbox.apache.org/)
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
