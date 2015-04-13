package pdbf.latex;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;

import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.reflect.TypeToken;

public class Table implements JsonSerializer<Table> {
    public ArrayList<Column> columns = new ArrayList<Column>();
    public ArrayList<Data> data = new ArrayList<Data>();
    Emptyclass inddefs = new Emptyclass();
    Emptyclass indices = new Emptyclass();
    Emptyclass uniqs = new Emptyclass();
    Emptyclass uniqdefs = new Emptyclass();
    String defaultfns = "";

    @Override
    public JsonElement serialize(Table src, Type typeOfSrc, JsonSerializationContext context) {
	JsonObject retValue = new JsonObject();
	Type columnListType = new TypeToken<Collection<Column>>() {}.getType();
	retValue.add("columns", context.serialize(src.columns, columnListType));
	JsonObject xcolumns = new JsonObject();
	for (Column c : src.columns) {
	    xcolumns.add(c.columnid, context.serialize(c));
	}
	retValue.add("xcolumns", xcolumns);
	JsonObject[] data = new JsonObject[src.data.size()];
	for (int i = 0; i < src.data.size(); ++i) {
	    JsonObject cur = new JsonObject();
	    Data dcur = src.data.get(i);
	    for (int j = 0; j < dcur.values.size(); ++j) {
		Object c = dcur.values.get(j);
		if (c instanceof Number) {
		    cur.addProperty(src.columns.get(j).columnid, (Number)c);
		} else if (c == null){
		    cur.add(src.columns.get(j).columnid, JsonNull.INSTANCE);
		} else {
		    cur.addProperty(src.columns.get(j).columnid, c.toString()); 
		}
	    }
	    data[i] = cur;
	}
	retValue.add("data", context.serialize(data));
	retValue.add("inddefs", context.serialize(src.inddefs));
	retValue.add("indices", context.serialize(src.indices));
	retValue.add("uniqs", context.serialize(src.uniqs));
	retValue.add("uniqdefs", context.serialize(src.uniqdefs));
	retValue.add("defaultfns", context.serialize(src.defaultfns));
	return retValue;
    }
}
