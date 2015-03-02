package pdbf.latex;


import java.io.File;
import java.util.ArrayList;
import java.util.Random;

import org.apache.commons.io.FileUtils;

import pdbf.common.LineChart;
import pdbf.common.Overlay;
import pdbf.common.Text;
import pdbf.common.Tools;
import pdbf.common.Visualization;
import pdbf.common.VisualizationTypeAdapter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class CreateTestLargeDB {

    public static void main(String[] args) {
	GsonBuilder builder = new GsonBuilder();
	builder.setPrettyPrinting();
	builder.registerTypeAdapter(Visualization.class,
		new VisualizationTypeAdapter());
	builder.disableHtmlEscaping();
	Gson gson = builder.create();

	ArrayList<Overlay> overlays = new ArrayList<Overlay>();

	LineChart chart = new LineChart("SELECT * FROM data2 WHERE Zahl2 > 0;",
		0.5150353982300885, 0.8407079646017699, 0.2496875, 0.3601875,
		1, false, "Zahl1", "Zahl2");
	Overlay cur = new Overlay("Tabelle1", chart);
	overlays.add(cur);

	Text text = new Text("SELECT * FROM test;",
		0.12831858407079646017699115044248,
		0.33185840707964601769911504424779, 0.2515625, 0.2671875, 1);
	cur = new Overlay("SQL1", text);
	overlays.add(cur);

	text = new Text("SELECT col2 FROM test WHERE col1 = 1;",
		0.12831858407079646017699115044248,
		0.34955752212389380530973451327434, 0.2671875, 0.2984375, 1);
	cur = new Overlay("SQL2", text);
	overlays.add(cur);

	text = new Text("INSERT INTO test VALUES (1, 123);",
		0.12831858407079646017699115044248,
		0.30088495575221238938053097345133, 0.2984375, 0.334375, 1);
	cur = new Overlay("SQL3", text);
	overlays.add(cur);

	try {
	    String out = gson.toJson(overlays);
	    FileUtils.writeStringToFile(new File("config.json"), out, Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	
	try {
	    StringBuffer sb = new StringBuffer();
	    Random r = new Random(System.currentTimeMillis());
	    sb.append("CREATE TABLE data1 (Datum DATE, Temperatur INTEGER); CREATE TABLE data2 (Zahl1 INTEGER, Zahl2 INTEGER, strA VARCHAR, strB VARCHAR, strC VARCHAR); INSERT INTO data1 VALUES ('2008/05/07', 75), ('2008/05/08', 70), ('2008/05/09', 80); CREATE TABLE test (col1 INTEGER, col2 FLOAT); INSERT INTO test VALUES (1,111.1), (2,222.1);");
	    for (int i = 0; i < 5000; ++i) {
		sb.append("INSERT INTO data2 VALUES ("+i+","+r.nextInt()+",\""+r.nextInt()+"\",\""+r.nextInt()+"\",\""+r.nextInt()+"\");");
	    }
	    FileUtils.writeStringToFile(new File("db.sql"), sb.toString(), Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }
}
