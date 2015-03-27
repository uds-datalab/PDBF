package pdbf.latex;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.StringTokenizer;

import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pdbf.common.Chart;
import pdbf.common.Database;
import pdbf.common.Dimension;
import pdbf.common.Overlay;
import pdbf.common.Text;
import pdbf.common.Tools;
import pdbf.common.Visualization;
import pdbf.common.VisualizationTypeAdapter;

public class LaTeX_Compiler {

    private static final String[] pathToLaTeXScript = { "texify.exe", "--pdf", "--quiet" };
    private static String OS = System.getProperty("os.name").toLowerCase();

    private static ArrayList<Process> processes = new ArrayList<Process>();
    private static ArrayList<String> cleanupfiles = new ArrayList<String>();
    private static Gson gson;
    private static String suffix;
    private static Dimension dimOrg;

    public static void main(String[] args) {
	if (OS.contains("win")) {
	    suffix = "win";
	} else if (OS.contains("mac")) {
	    suffix = "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    suffix = "unix";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(-1);
	}

	if (args.length != 1) {
	    System.out.println("Usage: Java_Compiler.jar pathToLaTeX");
	    System.exit(-1);
	}
	String latexPath = args[0];
	File latex = new File(latexPath);
	if (!latex.exists()) {
	    System.err.println("Error: LaTeX file does not exist!");
	    System.exit(-1);
	}

	ArrayList<String> commands = new ArrayList<String>(Arrays.asList(pathToLaTeXScript));
	commands.add(latex.getAbsolutePath());

	System.out.println("Compiling LaTeX (1/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}

	// Read JSON
	GsonBuilder builder = new GsonBuilder();
	builder.disableHtmlEscaping();
	builder.registerTypeAdapter(Visualization.class, new VisualizationTypeAdapter());
	builder.registerTypeAdapter(Alasql.class, new Alasql());
	builder.registerTypeAdapter(Table.class, new Table());
	gson = builder.create();
	Overlay[] overlays = null;
	try {
	    String json = FileUtils.readFileToString(new File("config.json"), Tools.utf8);
	    overlays = gson.fromJson(json, Overlay[].class);
	    String json2 = FileUtils.readFileToString(new File("dim.json"), Tools.utf8);
	    dimOrg = gson.fromJson(json2, Dimension.class);
	    for (int i = 0; i < overlays.length; ++i) {
		if (overlays[i].type instanceof Chart) {
		    Chart c = (Chart) overlays[i].type;
		    c.x1 = c.x1 / dimOrg.width;
		    c.x2 = c.x2 / dimOrg.width;
		    c.y1 = c.y1 / dimOrg.height;
		    c.y2 = c.y2 / dimOrg.height;
		}
		if (overlays[i].type instanceof Text) {
		    Text t = (Text) overlays[i].type;
		    t.x1 = t.x1 / dimOrg.width;
		    t.x2 = t.x2 / dimOrg.width;
		    t.y1 = (t.y1 + 65536 * t.fontsize) / dimOrg.height;
		    t.y2 = t.y2 / dimOrg.height;
		}
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
	if (overlays == null) {
	    System.err.println("Error: Deserialization failed!");
	    System.exit(-1);
	}
	// Split
	File f = new File("db.sql");
	File f2 = new File("db.json");
	if (f.exists()) {
	    if (!f.delete()) {
		System.out.println("db.sql could not be deleted! Exiting...");
		System.exit(-1);
	    }
	}
	if (f2.exists()) {
	    if (!f2.delete()) {
		System.out.println("db.json could not be deleted! Exiting...");
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
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Database) {
		processDatabase(overlays[i]);
	    }
	}
	System.out.println("Generating images...");
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Chart) {
		processChart(overlays[i], i);
	    }
	}

	for (Process p : processes) {
	    try {
		p.waitFor();
	    } catch (InterruptedException e) {
		e.printStackTrace();
	    }
	}
	
	//TODO: javascript. maybe implement chart legend via dygraphs plugin apis

	//TODO: logscale bei zweiter chart broken
	
	System.out.println("Compiling LaTeX (2/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
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
	    FileUtils.writeStringToFile(new File("config.json"), json, Tools.utf8);
	} catch (IOException e1) {
	    e1.printStackTrace();
	}

	// Cleanup
	for (String s : cleanupfiles) {
	    new File(s).delete();
	}
    }

    private static void processDatabase(Overlay overlay) {
	try {
	    Database db = (Database) overlay.type;
	    File f = new File("db.sql");
	    File f2 = new File("db.json");
	    switch (db.type) {
	    case 1:
		FileUtils.writeStringToFile(f, db.value1 + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 2:
		String in = FileUtils.readFileToString(new File(db.value1), Tools.utf8);
		FileUtils.writeStringToFile(f, in + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 3:
		// Load supported Drivers
		Class.forName("org.mariadb.jdbc.Driver");
		Class.forName("org.postgresql.Driver");
		Connection conn = DriverManager.getConnection(db.value1, db.value2, db.value3);
		// Create JSON Database
		StringTokenizer stok = new StringTokenizer(db.value4, ",");
		DatabaseContainer dbc = new DatabaseContainer();
		Alasql alasql = dbc.alasql;
		while (stok.hasMoreTokens()) {
		    Table table = new Table();
		    String curTable = stok.nextToken().trim();
		    Statement stmt = conn.createStatement();
		    ResultSet rs = stmt.executeQuery("SELECT * FROM " + curTable);
		    ResultSetMetaData rsmd = rs.getMetaData();
		    int cols = rsmd.getColumnCount();
		    for (int i = 1; i <= cols; ++i) {
			table.columns.add(new Column(rsmd.getColumnName(i), rsmd.getColumnTypeName(i).toUpperCase()));
		    }
		    if (cols > 0) {
			while (rs.next()) {
			    String[] data = new String[cols];
			    for (int i = 1; i <= cols; ++i) {
				data[i - 1] = rs.getString(i);
			    }
			    table.data.add(new Data(data));
			}
		    }
		    rs.close();
		    alasql.addTable(table, curTable);
		}
		conn.close();
		FileUtils.writeStringToFile(f2, gson.toJson(dbc), Tools.utf8, true);
		break;
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

    private static void processChart(Overlay o, int i) {
	Chart c = (Chart)o.type;
	cleanupfiles.add("out/web/" + i + ".html");
	cleanupfiles.add("" + o.name + ".png");
	try {
	    Dimension dim = new Dimension(dimOrg.width * c.quality, dimOrg.height * c.quality);
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("out/web/templateHEADimages.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File("out/web/templateTAILimages.html"), Tools.utf8);
	    viewer = viewerHEAD + 
		    "dim_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(dim)) + "\";\r\n" + 
		    "json_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(o)) + "\";\r\n" + 
		    "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + 
		    "dbjson_base64 = \"" + Tools.escapeQuotes(new File("db.json")) + "\";\r\n" + 
		    viewerTAIL;
	    FileUtils.writeStringToFile(new File("out/web/" + i + ".html"), viewer, Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	try {
	    ProcessBuilder pb = new ProcessBuilder("external-tools/phantomjs-" + suffix, "out/web/capture.js", "out/web/" + i + ".html");
	    pb.inheritIO();
	    Process p = pb.start();
	    processes.add(p);
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

}
