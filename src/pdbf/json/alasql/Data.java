package pdbf.json.alasql;

import java.util.ArrayList;

/*
 * JSON class defining a data array for Alasql databases
 */

public class Data {
    ArrayList<Object> values = new ArrayList<Object>();

    public Data(Object... values) {
	for (Object value : values) {
	    this.values.add(value);
	}
    }

}
