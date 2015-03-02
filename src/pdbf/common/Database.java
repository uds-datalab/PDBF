package pdbf.common;

public class Database extends Visualization {
    public int type;
    public String value1;
    public String value2;
    public String value3;
    public String value4;

    public Database(int type, String value1, String value2, String value3, String value4) {
	super();
	this.type = type;
	this.value1 = value1;
	this.value2 = value2;
	this.value3 = value3;
	this.value4 = value4;
    }
    
    public Database() {
    }
    
}
