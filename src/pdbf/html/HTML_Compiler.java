package pdbf.html;

import java.io.File;
import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class HTML_Compiler {

    public static void main(String[] args) {
	System.out.println("Compiling HTML...");	
	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("out/web/templateHEADalasql.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File("out/web/templateTAILalasql.html"), Tools.utf8);
	    viewer = viewerHEAD + 
		    "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File("test.pdf")) + "\";\r\n" + 
		    "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + 
		    "dbjson_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.json")) + "\";\r\n" +
		    "json_base64 = \"" + Tools.encodeFileToBase64Binary(new File("config.json")) + "\";\r\n" + 
		    viewerTAIL;
	    FileUtils.writeStringToFile(new File("out/web/viewerAlasql.html"), viewer, Tools.utf8);
	} catch (Exception e) {
	    e.printStackTrace();
	} 
    }

}
