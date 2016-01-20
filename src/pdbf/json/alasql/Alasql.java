package pdbf.json.alasql;

import java.lang.reflect.Type;
import java.util.ArrayList;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/*
 * JSON class defining an alasql database
 */

//TODO: support views for alasql
public class Alasql implements JsonSerializer<Alasql> {
    String databaseid = "alasql";
    private ArrayList<Table> tables = new ArrayList<Table>();
    private ArrayList<String> tableNames = new ArrayList<String>();
    Emptyclass views = new Emptyclass();
    Emptyclass indices = new Emptyclass();
    Emptyclass sqlCache = new Emptyclass();
    int sqlCacheSize = 3;
    int dbversion = 0;

    @Override
    public JsonElement serialize(Alasql src, Type typeOfSrc, JsonSerializationContext context) {
	JsonObject retValue = new JsonObject();
	retValue.addProperty("databaseid", src.databaseid);
	JsonObject tables = new JsonObject();
	for (int i = 0; i < src.tables.size(); ++i) {
	    tables.add(src.tableNames.get(i), context.serialize(src.tables.get(i)));
	}
	retValue.add("tables", tables);
	retValue.add("views", context.serialize(src.views));
	retValue.add("indices", context.serialize(src.indices));
	retValue.add("sqlCache", context.serialize(src.sqlCache));
	retValue.addProperty("sqlCacheSize", src.sqlCacheSize);
	retValue.addProperty("dbversion", src.dbversion);
	return retValue;
    }
    
    public void addTable(Table table, String tableName) {
	tables.add(table);
	tableNames.add(tableName);
    }
    
    public boolean containsTable(String tableName) {
	return this.tableNames.contains(tableName);
    }

}