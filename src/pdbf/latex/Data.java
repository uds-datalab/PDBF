package pdbf.latex;

import java.util.ArrayList;

public class Data {
    ArrayList<String> values = new ArrayList<String>();
    
    public Data(String... values) {
	for (String value : values) {
	this.values.add(value);
	}
    }
    
}
