package pdbf.latex;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pdbf.common.Chart;
import pdbf.common.DataTable;
import pdbf.common.DataText;
import pdbf.common.Database;
import pdbf.common.Dimension;
import pdbf.common.Overlay;
import pdbf.common.Text;
import pdbf.common.Tools;
import pdbf.common.Visualization;
import pdbf.common.VisualizationTypeAdapter;
import pdbf.html.CompleteRun_HTML;

public class LaTeX_Compiler {

    private static String[] pathToLaTeXScript = new String[0];

    private static ArrayList<Process> processes = new ArrayList<Process>();
    private static ArrayList<String> cleanupfiles = new ArrayList<String>();
    private static ArrayList<String> copyfiles = new ArrayList<String>();
    private static ArrayList<String> preloadfiles = new ArrayList<String>();
    private static ArrayList<String> dataFiles = new ArrayList<String>();
    private static Gson gson;
    public static String suffix;
    private static Dimension dimOrg;
    private static float dpiScalingFactor;

    private static String baseDir;
    private static String baseDirData;
    private static String arg0;

    static {
	GsonBuilder builder = new GsonBuilder();
	builder.disableHtmlEscaping().serializeNulls();
	builder.registerTypeAdapter(Visualization.class, new VisualizationTypeAdapter());
	builder.registerTypeAdapter(Alasql.class, new Alasql());
	builder.registerTypeAdapter(Table.class, new Table());
	gson = builder.create();
    }

    private static String latexFolder;

    public static void main(String[] args) {
	baseDir = Tools.getBaseDir();
	baseDirData = Tools.getBaseDirData();

	// Read config.
	try {
	    FileInputStream fstream = new FileInputStream(baseDir + "config.cfg");
	    BufferedReader br = new BufferedReader(new InputStreamReader(fstream));
	    String strLine;

	    ArrayList<String> tmp = new ArrayList<String>();
	    while ((strLine = br.readLine()) != null) {
		strLine = strLine.trim();
		if (strLine.startsWith("dpiScalingFactor")) {
		    StringTokenizer stok = new StringTokenizer(strLine, ":");
		    stok.nextToken();
		    dpiScalingFactor = Float.parseFloat(stok.nextToken());
		}
		else if (!strLine.startsWith("#") && !strLine.equals("")) {
		    tmp.add(strLine);
		}
	    }
	    // remind user to adjust config
	    if (tmp.size() == 0 || tmp.get(tmp.size() - 1).equals("DELETE ME")) {
		System.err.println("Warning: You have to first adjust the config.cfg file before you can use this tool.\nDid you forgot to remove the \"DELETE ME\" at the end of the config file? Exiting...");
		System.exit(-1);
	    }
	    br.close();
	    pathToLaTeXScript = tmp.toArray(pathToLaTeXScript);
	} catch (IOException e4) {
	    e4.printStackTrace();
	    System.exit(-1);
	}

	if (pathToLaTeXScript[0].contains("texi2") && args[0].contains(" ")) {
	    System.err.println("Error: Specified path to texfile contains spaces and you are using texi2pdf or texi2dvi which does not support spaces in file paths!");
	    System.exit(-1);
	}

	String latexPath = args[0];
	arg0 = args[0];

	if (!latexPath.endsWith(".tex")) {
	    System.err.println("Error: Specified file has the wrong extension. Only .tex is supported!");
	    System.exit(-1);
	}

	File latex = new File(latexPath);
	if (!latex.exists()) {
	    System.err.println("Error: LaTeX file does not exist!");
	    System.exit(-1);
	}

	latexFolder = latex.getAbsoluteFile().getParent();

	ArrayList<String> commands = new ArrayList<String>(Arrays.asList(pathToLaTeXScript));
	commands.add(latex.getAbsolutePath());

	// Check if phantomjs runs without problems. This can for example detect
	// that a 32bit OS is used but a 64bit binary is present
	try {
	    ProcessBuilder pb = new ProcessBuilder(baseDir + "external-tools" + File.separator + "phantomjs-" + suffix, "--version");
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Error! Your system can't run the supplied binary of phantom-js. This means that you have to upgrade your system to 64-bit or you have to compile phantom-js yourself and then replace the binary for your system in the external-tools folder. Instructions on how to compile phantom-js you can find here: http://phantomjs.org/build.html.");
		System.exit(-1);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}

	File fi1 = new File(baseDir + "pdbf.sty").getAbsoluteFile();
	File fi11 = new File(baseDir + "dummy.pdf").getAbsoluteFile();
	File fi2 = new File(latexFolder + File.separator + "pdbf.sty").getAbsoluteFile();
	File fi22 = new File(latexFolder + File.separator + "dummy.pdf").getAbsoluteFile();
	if (!fi1.equals(fi2)) {
	    try {
		FileUtils.copyFile(fi1, fi2);
		FileUtils.copyFile(fi11, fi22);
	    } catch (IOException e3) {
		e3.printStackTrace();
		System.exit(-1);
	    }
	}

	System.out.println("Compiling LaTeX (1/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    pb.directory(new File(baseDir));
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Latex compiler exited with error!");
		System.exit(-1);
	    }
	} catch (Exception e) {
	    System.err.println("Error: LaTeX compilation failed! Reason: \n" + e.getMessage());
	    System.exit(-1);
	}

	Overlay[] overlays;
	if (new File(baseDir + "pdbf-config.json").exists()) {
	    overlays = readJSONconfig();
	} else {
	    overlays = new Overlay[0];
	}

	// Split
	File f = new File(baseDir + "pdbf-db.sql");
	File f2 = new File(baseDir + "pdbf-db.json");
	if (f.exists()) {
	    if (!f.delete()) {
		System.out.println("pdbf-db.sql could not be deleted! Exiting...");
		System.exit(-1);
	    }
	}
	if (f2.exists()) {
	    if (!f2.delete()) {
		System.out.println("pdbf-db.json could not be deleted! Exiting...");
		System.exit(-1);
	    }
	}
	try {
	    f.createNewFile();
	    f2.createNewFile();
	} catch (IOException e1) {
	    e1.printStackTrace();
	}
	System.out.println("Generating database...");
	DatabaseContainer dbc = new DatabaseContainer();
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Database) {
		processDatabase(overlays[i], dbc);
	    }
	}
	try {
	    File tmp_f = new File(baseDir + "pdbf-db.json");
	    FileUtils.writeStringToFile(tmp_f, gson.toJson(dbc), Tools.utf8, true);
	} catch (IOException e3) {
	    e3.printStackTrace();
	}
	// Process raw SQL statements
	getFinalDatabase();

	// count
	int count = 0;
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Chart || overlays[i].type instanceof DataText || overlays[i].type instanceof DataTable || overlays[i].type instanceof Text) {
		count++;
	    }
	}

	System.out.println("Generating images...\n" + count + " Overlays to process");
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Chart) {
		processVisual(overlays[i]);
	    } else if (overlays[i].type instanceof DataText) {
		processData(overlays[i]);
	    } else if (overlays[i].type instanceof DataTable) {
		processData(overlays[i]);
	    } else if (overlays[i].type instanceof Text) {
		System.out.println("Finished " + overlays[i].name);
	    }

	    if (processes.size() >= Runtime.getRuntime().availableProcessors()) {
		for (Process p : processes) {
		    try {
			p.waitFor();
			if (p.exitValue() != 0) {
			    System.err.println("Phantomjs exited with error!");
			    for (Process p2 : processes) {
				p2.destroy();
			    }
			    System.exit(-1);
			}
		    } catch (InterruptedException e) {
			e.printStackTrace();
		    }
		}
		processes.clear();
	    }
	}

	for (Process p : processes) {
	    try {
		p.waitFor();
		if (p.exitValue() != 0) {
		    System.err.println("Phantomjs exited with error!");
		    for (Process p2 : processes) {
			p2.destroy();
		    }
		    System.exit(-1);
		}
	    } catch (InterruptedException e) {
		e.printStackTrace();
	    }
	}

	// Copy images to latex file
	for (String s : copyfiles) {
	    File source = new File(s).getAbsoluteFile();
	    File target = new File(latexFolder + File.separator + source.getName()).getAbsoluteFile();
	    if (!source.equals(target)) {
		try {
		    FileUtils.copyFile(source, target);
		} catch (IOException e) {
		    e.printStackTrace();
		}
	    }
	}

	String preload = "";
	for (String preTmp : preloadfiles) {
	    String pre = new File(preTmp).getName();
	    try {
		preload += "var " + pre.substring(0, pre.length() - 5) + " = " + FileUtils.readFileToString(new File(preTmp)) + ";\n";
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	}
	try {
	    FileUtils.writeStringToFile(new File(baseDir + "pdbf-preload"), preload);
	} catch (IOException e2) {
	    e2.printStackTrace();
	}

	String aux = "";
	for (String dataTmp : dataFiles) {
	    String data = new File(dataTmp).getName();
	    try {
		aux += "\\expandafter\\gdef\\csname pdbf@" + data.substring(0, data.length() - 5) + "\\endcsname{" + FileUtils.readFileToString(new File(dataTmp)) + "}\n";
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	}
	try {
	    File auxfile = new File(latexPath.substring(0, latexPath.length() - 4) + ".aux");
	    FileUtils.writeStringToFile(auxfile, aux, true);
	    FileUtils.writeStringToFile(new File(baseDir + auxfile.getName()), aux, true);
	} catch (IOException e2) {
	    e2.printStackTrace();
	}

	System.out.println("Compiling LaTeX (2/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    pb.directory(new File(baseDir));
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Latex compiler exited with error!");
		System.exit(-1);
	    }
	} catch (Exception e) {
	    System.err.println("Error: LaTeX compilation failed! Reason: \n" + e.getMessage());
	    System.exit(-1);
	}

	if (new File(baseDir + "pdbf-config.json").exists()) {
	    overlays = readJSONconfig();
	} else {
	    overlays = new Overlay[0];
	}

	// Remove database entries from config
	ArrayList<Overlay> olist = new ArrayList<Overlay>(Arrays.asList(overlays));
	for (int i = olist.size() - 1; i >= 0; --i) {
	    if (olist.get(i).type instanceof Database) {
		olist.remove(i);
	    }
	}
	overlays = new Overlay[olist.size()];
	overlays = olist.toArray(overlays);
	try {
	    String json = gson.toJson(overlays);
	    FileUtils.writeStringToFile(new File(baseDir + "pdbf-config.json"), json, Tools.utf8);
	} catch (IOException e1) {
	    e1.printStackTrace();
	}

	// Cleanup
	for (String s : cleanupfiles) {
	    new File(s).delete();
	}
    }

    private static Overlay[] readJSONconfig() {
	// Read JSON
	Overlay[] overlays = null;
	try {
	    String json = FileUtils.readFileToString(new File(baseDir + "pdbf-config.json"), Tools.utf8);
	    overlays = gson.fromJson(json, Overlay[].class);
	    String json2 = FileUtils.readFileToString(new File(baseDir + "pdbf-dim.json"), Tools.utf8);
	    dimOrg = gson.fromJson(json2, Dimension.class);
	    for (int i = 0; i < overlays.length; ++i) {
		Visualization v = overlays[i].type;
		if (v instanceof Text || v instanceof DataText || v instanceof DataTable) {
		    Visualization t = overlays[i].type;
		    t.x1 = t.x1 / dimOrg.width;
		    t.x2 = t.x2 / dimOrg.width;
		    t.y1 = (t.y1 + 65536 * t.fontsize) / dimOrg.height;
		    t.y2 = t.y2 / dimOrg.height;
		} else if (v instanceof Chart) {
		    Chart c = (Chart) overlays[i].type;
		    c.x1 = c.x1 / dimOrg.width;
		    c.x2 = c.x2 / dimOrg.width;
		    c.y1 = c.y1 / dimOrg.height;
		    c.y2 = c.y2 / dimOrg.height;
		}

		if (!(v instanceof Database)) {
		    v.quality *= 4;
		    if (v.aggregationattributeBig.equals("")) {
			v.aggregationattributeBig = v.aggregationattribute;
		    }
		    if (v.aggregationBig.equals("")) {
			v.aggregationBig = v.aggregation;
		    }
		}
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
	if (overlays == null) {
	    System.err.println("Error: Deserialization failed!");
	    System.exit(-1);
	}
	return overlays;
    }

    @SuppressWarnings("deprecation")
    private static void processDatabase(Overlay overlay, DatabaseContainer dbc) {
	try {
	    Database db = (Database) overlay.type;
	    File f = new File(baseDir + "pdbf-db.sql");
	    Alasql alasql = dbc.alasql;
	    switch (db.type) {
	    case 1:
		FileUtils.writeStringToFile(f, db.value1 + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 2:
		File inF = new File(db.value1);
		if (!inF.isAbsolute()) {
		    inF = new File(latexFolder + File.separator + db.value1);
		}
		String in = FileUtils.readFileToString(inF, Tools.utf8);
		FileUtils.writeStringToFile(f, in + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 3:
		// Load supported Drivers
		Class.forName("org.mariadb.jdbc.Driver");
		Class.forName("org.postgresql.Driver");
		Connection conn = DriverManager.getConnection(db.value1, db.value2, db.value3);
		// Create JSON Database
		StringTokenizer stok = new StringTokenizer(db.value4, ",");
		while (stok.hasMoreTokens()) {
		    Table table = new Table();
		    String curTable = stok.nextToken().trim();

		    if (alasql.containsTable(curTable)) {
			System.err.println("Error: Database already contains a table with name \"" + curTable + "\"");
			System.exit(-1);
		    }

		    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM ?");
		    stmt.setString(1, curTable);
		    ResultSet rs = stmt.executeQuery();
		    ResultSetMetaData rsmd = rs.getMetaData();
		    int cols = rsmd.getColumnCount();
		    for (int i = 1; i <= cols; ++i) {
			table.columns.add(new Column(rsmd.getColumnName(i), rsmd.getColumnTypeName(i).toUpperCase()));
		    }
		    if (cols > 0) {
			while (rs.next()) {
			    Object[] data = new Object[cols];
			    for (int i = 1; i <= cols; ++i) {
				data[i - 1] = rs.getObject(i);
			    }
			    table.data.add(new Data(data));
			}
		    }
		    rs.close();
		    alasql.addTable(table, curTable);
		}
		conn.close();
		break;
	    case 4:
		File csvData = new File(db.value1);
		if (!csvData.isAbsolute()) {
		    csvData = new File(latexFolder + File.separator + db.value1);
		}
		CSVFormat csvformat = CSVFormat.RFC4180.withDelimiter(db.seperator).withQuote(db.quote);
		if (db.headers.length > 0) {
		    csvformat = csvformat.withHeader(db.headers);
		} else {
		    csvformat = csvformat.withHeader();
		}
		CSVParser parser = CSVParser.parse(csvData, Tools.utf8, csvformat);

		Table table = new Table();
		String curTable = db.value2;

		if (alasql.containsTable(curTable)) {
		    System.err.println("Error: Database already contains a table with name \"" + curTable + "\"");
		    System.exit(-1);
		}

		int cols = parser.getHeaderMap().size();
		List<CSVRecord> csvRecords = parser.getRecords();
		ArrayList<String> types = new ArrayList<String>();

		for (int i = 0; i < cols; ++i) {
		    // calculate type of csv data for every column
		    boolean isParsable = true;
		    // FLOAT
		    for (CSVRecord csvRecord : csvRecords) {
			String cur = csvRecord.get(i);
			try {
			    Double.parseDouble(cur);
			} catch (NumberFormatException e) {
			    if (!cur.toLowerCase().equals("null")) {
				isParsable = false;
				break;
			    }
			}
		    }
		    if (isParsable) {
			types.add("FLOAT");
			continue;
		    }
		    isParsable = true;
		    // BOOLEAN
		    for (CSVRecord csvRecord : csvRecords) {
			String cur = csvRecord.get(i).toLowerCase();
			if (!(cur.equals("true") || cur.equals("false") || cur.equals("null"))) {
			    isParsable = false;
			    break;
			}
		    }
		    if (isParsable) {
			types.add("BOOLEAN");
			continue;
		    }
		    isParsable = true;
		    // TIMESTAMP
		    for (CSVRecord csvRecord : csvRecords) {
			String cur = csvRecord.get(i);
			try {
			    new Date(cur);
			} catch (IllegalArgumentException e) {
			    if (!cur.toLowerCase().equals("null")) {
				isParsable = false;
				break;
			    }
			}
		    }
		    if (isParsable) {
			types.add("TIMESTAMP");
			continue;
		    }
		    isParsable = true;
		    types.add("STRING");
		}

		int tmp = 0;
		for (String colname : parser.getHeaderMap().keySet()) {
		    table.columns.add(new Column(colname, types.get(tmp++)));
		}
		if (cols > 0) {
		    for (CSVRecord csvRecord : csvRecords) {
			Object[] data = new Object[cols];
			for (int i = 0; i < cols; ++i) {
			    String cur = csvRecord.get(i);
			    if (cur.toLowerCase().equals("null")) {
				data[i] = null;
			    } else {
				switch (types.get(i)) {
				case "FLOAT":
				    data[i] = Double.parseDouble(cur);
				    break;
				case "BOOLEAN":
				    data[i] = Boolean.parseBoolean(cur);
				    break;
				case "TIMESTAMP":
				    data[i] = new Date(cur);
				    break;
				default:
				    data[i] = cur;
				}
			    }

			}
			table.data.add(new Data(data));
		    }
		}
		alasql.addTable(table, curTable);
		break;
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

    private static void processVisual(Overlay o) {
	if (CompleteRun_HTML.includeRes) {
	    Chart c = (Chart) o.type;
	    cleanupfiles.add(baseDirData + o.name + ".html");
	    cleanupfiles.add(baseDir + o.name + ".json");
	    preloadfiles.add(baseDir + o.name + ".json");
	    copyfiles.add(baseDir + o.name + ".pdf");

	    String a = new File(arg0).getName();
	    String filename = a.substring(0, a.length() - 4);
	    String pdfname = baseDir + filename + ".pdf";

	    try {
		Dimension dim = new Dimension(dimOrg.width * c.quality, dimOrg.height * c.quality);
		String viewer;
		String viewerHEAD = FileUtils.readFileToString(new File(baseDirData + "template-head-images.html"), Tools.utf8);
		String viewerTAIL = FileUtils.readFileToString(new File(baseDirData + "template-tail-images.html"), Tools.utf8);
		viewer = viewerHEAD + "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File(pdfname)) + "\";\r\n" + "dim_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(dim)) + "\";\r\n" + "json_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(o)) + "\";\r\n" + "db_base64 = \"\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File(baseDir + "pdbf-db.json")) + "\";\r\n" + viewerTAIL;
		FileUtils.writeStringToFile(new File(baseDirData + o.name + ".html"), viewer, Tools.utf8);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	    try {
		ProcessBuilder pb = new ProcessBuilder(baseDir + "external-tools" + File.separator + "phantomjs-" + suffix, baseDir + "external-tools" + File.separator + "capture.js", o.name + ".html", baseDirData, ""+dpiScalingFactor);
		pb.inheritIO();
		Process p = pb.start();
		processes.add(p);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	} else {
	    try {
		FileUtils.copyFile(new File(baseDir + "dummy.pdf"), new File(baseDir + o.name + ".pdf"));
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	}
    }

    private static void processData(Overlay o) {
	Visualization c = (Visualization) o.type;
	cleanupfiles.add(baseDirData + o.name + ".html");
	cleanupfiles.add(baseDir + o.name + ".data");
	dataFiles.add(baseDir + o.name + ".data");
	try {
	    Dimension dim = new Dimension(dimOrg.width * c.quality, dimOrg.height * c.quality);
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File(baseDirData + "template-head-images.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File(baseDirData + "template-tail-images.html"), Tools.utf8);
	    viewer = viewerHEAD + "dim_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(dim)) + "\";\r\n" + "json_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(o)) + "\";\r\n" + "db_base64 = \"\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File(baseDir + "pdbf-db.json")) + "\";\r\n" + viewerTAIL;
	    FileUtils.writeStringToFile(new File(baseDirData + o.name + ".html"), viewer, Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	try {
	    ProcessBuilder pb = new ProcessBuilder(baseDir + "external-tools" + File.separator + "phantomjs-" + suffix, baseDir + "external-tools" + File.separator + "captureData.js", o.name + ".html", baseDirData);
	    pb.inheritIO();
	    Process p = pb.start();
	    processes.add(p);
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

    private static void getFinalDatabase() {
	cleanupfiles.add(baseDirData + "pdbfDatabase.html");
	try {
	    Dimension dim = new Dimension(1.0, 1.0);
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File(baseDirData + "template-head-images.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File(baseDirData + "template-tail-images.html"), Tools.utf8);
	    viewer = viewerHEAD + "dim_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(dim)) + "\";\r\n" + "json_base64 = \"eyAidHlwZSIgOiB7ICJJIiA6IHsgIngxIiA6IDEsICJ4MiIgOiAyLCAieTEiIDogMywgInkyIiA6IDQgfSB9IH0=\";\r\n" + "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File(baseDir + "pdbf-db.sql")) + "\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File(baseDir + "pdbf-db.json")) + "\";\r\nvar notCompressed = true;\r\n" + viewerTAIL;
	    FileUtils.writeStringToFile(new File(baseDirData + "pdbfDatabase.html"), viewer, Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	try {
	    ProcessBuilder pb = new ProcessBuilder(baseDir + "external-tools" + File.separator + "phantomjs-" + suffix, baseDir + "external-tools" + File.separator + "captureDatabase.js", "pdbfDatabase.html", baseDirData);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Phantomjs exited with error!");
		System.exit(-1);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

}
