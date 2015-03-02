package pdbf.latex;

import java.lang.reflect.Type;
import java.util.ArrayList;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

public class Alasql implements JsonSerializer<Alasql> {
    String databaseid = "alasql";
    ArrayList<Table> tables = new ArrayList<Table>();
    ArrayList<String> tableNames = new ArrayList<String>();
    Emptyclass views = new Emptyclass();
    Emptyclass indices = new Emptyclass();
    Emptyclass sqlCache = new Emptyclass();
    int sqlCacheSize = 3;
    int dbversion = 0;

    @Override
    public JsonElement serialize(Alasql src, Type typeOfSrc, JsonSerializationContext context) {
	JsonObject retValue = new JsonObject();
	retValue.addProperty("databaseid", databaseid);
	for (int i = 0; i < tables.size(); ++i) {
	    retValue.add(tableNames.get(i), context.serialize(tables.get(i)));
	}
	retValue.add("views", context.serialize(views));
	retValue.add("indices", context.serialize(indices));
	retValue.add("sqlCache", context.serialize(sqlCache));
	retValue.addProperty("sqlCacheSize", sqlCacheSize);
	retValue.addProperty("dbversion", dbversion);
	return retValue;
    }

}