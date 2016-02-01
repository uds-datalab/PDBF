package pdbf.json;

/*
 * Defines the properties that are exclusive to Database
 * For simplicity Database elements are also considered to be Visualizations
 */
public class Database extends PDBFelement {
    public int type;
    public String value1;
    public String value2;
    public String value3;
    public String value4;
    public String[] headers;
    public char quote;
    public char seperator;
}
