package pdbf.tests;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pdbf.common.Tools;
import pdbf.latex.Alasql;
import pdbf.latex.Column;
import pdbf.latex.Data;
import pdbf.latex.DatabaseContainer;
import pdbf.latex.Table;

public class DatabaseJSONTest {

    public static void main(String[] args) {
	GsonBuilder builder = new GsonBuilder();
	builder.registerTypeAdapter(Alasql.class, new Alasql());
	builder.registerTypeAdapter(Table.class, new Table());
	builder.setPrettyPrinting();
	Gson gson = builder.create();
	
	DatabaseContainer db = new DatabaseContainer();
	Alasql alasql = db.alasql;
	Table t1 = new Table();
	t1.columns.add(new Column("date", "DATE"));
	t1.columns.add(new Column("money", "INTEGER"));
	t1.data.add(new Data("2008/05/07", "75"));
	t1.data.add(new Data("2008/05/08", "70"));
	t1.data.add(new Data("2008/05/09", "80"));
	alasql.addTable(t1, "data1");
	
	try {
	    FileUtils.writeStringToFile(new File("Test.json"), gson.toJson(db), Tools.utf8);
	} catch (IOException e) {
	    e.printStackTrace();
	}
    }

}
