package pdbf.latex;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.StringTokenizer;

import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pdbf.common.Chart;
import pdbf.common.Database;
import pdbf.common.Overlay;
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
	    System.out.println("Usage: Java_Compiler.jar pathToPDF " + System.lineSeparator() + "Assuming that the config.json file is in the same folder");
	    System.exit(-1);
	}
	String latexPath = args[0];
	File latex = new File(latexPath);
	if (!latex.exists()) {
	    System.err.println("Error: Source PDF file does not exist!");
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

	System.out.println("Generating Images...");
	// Read JSON
	GsonBuilder builder = new GsonBuilder();
	builder.registerTypeAdapter(Visualization.class, new VisualizationTypeAdapter());
	gson = builder.create();
	Overlay[] overlays = null;
	try {
	    String json = FileUtils.readFileToString(new File("config.json"), Tools.utf8);
	    overlays = gson.fromJson(json, Overlay[].class);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	if (overlays == null) {
	    System.err.println("Error: Deserialization failed!");
	    System.exit(-1);
	}
	// Split
	File f = new File("db.sql");
	if (f.exists()) {
	    if (!f.delete()) {
		System.out.println("db.sql could not be deleted! Exiting...");
		System.exit(-1);
	    }
	}
	try {
	    f.createNewFile();
	} catch (IOException e1) {
	    e1.printStackTrace();
	}
	for (int i = 0; i < overlays.length; ++i) {
	    if (overlays[i].type instanceof Chart) {
		processChart(overlays[i], i);
	    } else if (overlays[i].type instanceof Database) {
		processDatabase(overlays[i]);
	    }
	    // TODO: add more
	}

	for (Process p : processes) {
	    try {
		p.waitFor();
	    } catch (InterruptedException e) {
		e.printStackTrace();
	    }
	}

	System.out.println("Compiling LaTeX (2/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
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
	    switch (db.type) {
	    case 1:
		FileUtils.writeStringToFile(f, db.value1 + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 2:
		String in = FileUtils.readFileToString(new File(db.value1), Tools.utf8);
		FileUtils.writeStringToFile(f, in + System.lineSeparator(), Tools.utf8, true);
		break;
	    case 3:
		try {
		    // Load supported Drivers
		    Class.forName("org.mariadb.jdbc.Driver");
		    Class.forName("org.postgresql.Driver");
		    Connection conn = DriverManager.getConnection(db.value1, db.value2, db.value3);
		    // Insert Create Table Statement
		    StringTokenizer stok = new StringTokenizer(db.value4, ",");
		    while (stok.hasMoreTokens()) {
			String curTable = stok.nextToken();
			String out = "CREATE TABLE " + curTable + "(";
			ResultSet rs = conn.getMetaData().getColumns(null, null, curTable, null);
			int cols = 0;
			while (rs.next()) {
			    out += rs.getString(4) + " " + rs.getString(6) + ", ";
			    ++cols;
			}
			rs.close();
			out = out.substring(0, out.length() - 2) + ");";
			FileUtils.writeStringToFile(f, out + System.lineSeparator(), Tools.utf8, true);
			Statement stmt = conn.createStatement();
			rs = stmt.executeQuery("SELECT * FROM " + curTable);
			if (cols != 0) {
			    while (rs.next()) {
				out = "INSERT INTO " + curTable + " VALUES (";
				for (int i = 1; i < cols; ++i) {
				    out += "\"" + rs.getString(i) + "\", ";
				}
				out += rs.getString(cols) + ");";
				FileUtils.writeStringToFile(f, out + System.lineSeparator(), Tools.utf8, true);
				System.out.println(out);
			    }
			}
			rs.close();
		    }
		    conn.close();
		} catch (Exception e) {
		    e.printStackTrace();
		    System.exit(-1);
		}
		break;
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

    private static void processChart(Overlay o, int i) {
	cleanupfiles.add("out/web/" + i + ".html");
	cleanupfiles.add("" + o.name + ".png");
	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("out/web/templateHEADimages.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File("out/web/templateTAILimages.html"), Tools.utf8);
	    viewer = viewerHEAD + "dim_base64 = \"" + Tools.encodeFileToBase64Binary(new File("dim.json")) + "\";\r\n" + "json_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(o)) + "\";\r\n" + "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + viewerTAIL;
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
