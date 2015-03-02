package pdbf.latex;

import java.lang.reflect.Type;
import java.util.ArrayList;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

public class Table implements JsonSerializer<Table> {
    ArrayList<Column> columns;

    // "xcolumns":{ },
    // "data":[ ],
    // "inddefs":{ },
    // "indices":{ },
    // "uniqs":{ },
    // "uniqdefs":{ },
    // "defaultfns":""

    @Override
    public JsonElement serialize(Table src, Type typeOfSrc, JsonSerializationContext context) {
	Column[] columns = new Column[this.columns.size()];
	columns = this.columns.toArray(columns);
	JsonObject retValue = new JsonObject();
	retValue.add("columns", context.serialize(columns));
	JsonObject xolumns = new JsonObject();
	for (Column c : columns) {
	    JsonObject col = conte
		    //TODO: check db.sql mit vielen daten (100.000)
	}
	retValue.add("xcolumns", cols);
	retValue.addProperty("databaseid", databaseid);
	for (int i = 0; i < tables.size(); ++i) {
	    retValue.add(tableNames.get(i), context.serialize(tables.get(i)));
	}
	
	retValue.add("indices", context.serialize(indices));
	retValue.add("sqlCache", context.serialize(sqlCache));
	retValue.addProperty("sqlCacheSize", sqlCacheSize);
	retValue.addProperty("dbversion", dbversion);
	return retValue;
    }
}
