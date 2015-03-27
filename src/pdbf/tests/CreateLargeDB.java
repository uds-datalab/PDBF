package pdbf.tests;


import java.io.File;
import java.util.Random;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class CreateLargeDB {

    /*
     * WARNING: This test is fitted to postgresql syntax
     */
    public static void main(String[] args) {	
	try {
	    StringBuffer sb = new StringBuffer();
	    Random r = new Random(System.currentTimeMillis());
	    sb.append("CREATE TABLE pgtest (\"Zahl1\" INTEGER, \"Zahl2\" INTEGER, \"Zahl3\" INTEGER, \"strA\" VARCHAR, \"strB\" VARCHAR);");
	    for (int i = 0; i < 50000; ++i) {
		sb.append("INSERT INTO pgtest VALUES ("+i+","+r.nextInt(1000)+", "+r.nextInt()+", '"+r.nextInt()+"', '"+r.nextInt()+"');");
	    }
	    FileUtils.writeStringToFile(new File("db.sql"), sb.toString(), Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }
    
}
