package pdbf.json;

import java.lang.reflect.Type;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

/*
 * This class determines the class of an overlay by comparing the I string to all known classes
 */

public class VisualizationTypeAdapter implements JsonSerializer<Visualization>, JsonDeserializer<Visualization> {
    private static final String CLASSNAME = "C";
    private static final String INSTANCE = "I";

    @Override
    public JsonElement serialize(Visualization src, Type typeOfSrc, JsonSerializationContext context) {
	JsonObject retValue = new JsonObject();
	String className = src.getClass().getCanonicalName();
	retValue.addProperty(CLASSNAME, className);
	JsonElement elem = context.serialize(src);
	retValue.add(INSTANCE, elem);
	return retValue;
    }

    @Override
    public Visualization deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
	JsonObject jsonObject = json.getAsJsonObject();
	JsonPrimitive prim = (JsonPrimitive) jsonObject.get(CLASSNAME);
	String className = prim.getAsString();
	Class<?> klass = null;
	try {
	    klass = Class.forName(className);
	} catch (ClassNotFoundException e) {
	    e.printStackTrace();
	    throw new JsonParseException(e.getMessage());
	}
	return context.deserialize(jsonObject.get(INSTANCE), klass);
    }
}
