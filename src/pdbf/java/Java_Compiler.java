package pdbf.java;

import java.io.File;
import java.io.FileReader;

import pdbf.common.Overlay;
import pdbf.common.Unit;
import pdbf.common.UnitTypeAdapter;
import pdbf.common.Visualization;
import pdbf.common.VisualizationTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Java_Compiler {

    public static void main(String[] args) {
	if (args.length != 1) {
	    System.out
		    .println("Usage: Java_Compiler.jar pathToPDF "
			    + System.lineSeparator()
			    + "Assuming that the config.json file is in the same folder");
	    System.exit(-1);
	}
	String pdfPath = args[0];
	File pdf = new File(pdfPath);
	if (!pdf.exists()) {
	    System.err.println("Error: Source PDF file does not exist!");
	    System.exit(-1);
	}
	File config = new File(pdf.getParent() + File.separator + "config.json");
	if (!config.exists()) {
	    System.err.println("Error: config.json file does not exist!");
	    System.exit(-1);
	}
	GsonBuilder builder = new GsonBuilder();
	builder.registerTypeAdapter(Visualization.class,
		new VisualizationTypeAdapter());
	builder.registerTypeAdapter(Unit.class, new UnitTypeAdapter());
	Gson gson = builder.create();
	Overlay[] overlays = null;
	try {
	    FileReader reader = new FileReader("config.json");
	    overlays = gson.fromJson(reader, Overlay[].class);
	    reader.close();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	if (overlays == null) {
	    System.err.println("Error: Deserialization failed!");
	    System.exit(-1);
	}
	// TODO: do something with overlays array
    }

}
