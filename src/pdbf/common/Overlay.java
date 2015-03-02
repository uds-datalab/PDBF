package pdbf.common;

public class Overlay {
    public String name;
    public Visualization type;

    public Overlay(String name, Visualization type) {
	this.name = name;
	this.type = type;
    }

    /*
     * Needed for GSON
     */
    public Overlay() {
    }

}
