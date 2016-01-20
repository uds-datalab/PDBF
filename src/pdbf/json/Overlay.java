package pdbf.json;

/*
 * This is a wrapper object for all informations that are passes from LaTeX. 
 * A pdbf-config.json consists of an array of overlays
 */

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
