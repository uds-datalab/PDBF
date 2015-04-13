package pdbf.latex;

import java.util.ArrayList;

public class Data {
    ArrayList<Object> values = new ArrayList<Object>();

    public Data(Object... values) {
	for (Object value : values) {
	    this.values.add(value);
	}
    }

}
