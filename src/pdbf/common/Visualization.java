package pdbf.common;

public abstract class Visualization {
    /*Keep all options here. 
     * This is beneficial because then you can also set options 
     * on how other representations of this visualization should look like*/
    
    //Multiplot
    public int xCount;
    public int yCount;
    public String leftArr;
    public String rightArr;
    public String topArr;
    public String bottomArr;
    public String xValues;
    public String yValues;
    public boolean yFirst;
    public boolean forceXequal;
    public boolean forceYequal;
    
    //LineChart and BarChart
    public boolean logScale;
    public String legendpos;
    public String xUnitName;
    public String yUnitName;
    public boolean includeZero;
    public boolean drawPoints;
    public boolean fillGraph;
    public boolean showRangeSelector;
    
    //BarChart
    public int overlap;
    
    //Pivot
    public String rows;
    public String cols;
    public String aggregation;
    public String aggregationattribute;
    public String aggregationBig;
    public String aggregationattributeBig;
    
    //Common
    public String query;
    public String queryB;
    public double x1;
    public double x2;
    public double y1;
    public double y2;
    public long page;
    public String options;
    public double zoom;
    public double quality;
    public double fontsize;
    
    public String chartType;
}
