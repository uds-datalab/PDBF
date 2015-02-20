package pdbf.common;

public class CustomUnit extends Unit {

    public CustomUnit(String name, Long rangeFrom, Long rangeTo) {
	super(name, rangeFrom, rangeTo);
    }

    public CustomUnit(String name) {
	super(name);
    }

    /*
     * Needed for GSON
     */
    public CustomUnit() {
    }
}
