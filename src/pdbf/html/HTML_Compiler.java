package pdbf.html;

import java.io.File;
import java.io.FileInputStream;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

public class HTML_Compiler {

    private static String encodeFileToBase64Binary(File file) {
	String encodedfile = null;
	try {
	    FileInputStream fileInputStreamReader = new FileInputStream(file);
	    byte[] bytes = new byte[(int) file.length()];
	    fileInputStreamReader.read(bytes);
	    encodedfile = Base64.encodeBase64String(bytes);
	    fileInputStreamReader.close();
	} catch (Exception e) {
	    e.printStackTrace();
	} 
	return encodedfile;
    }

    public static void main(String[] args) {
	System.out.println("Compiling HTML...");
	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("templateHEADsqlite.html"));
	    String viewerTAIL = FileUtils.readFileToString(new File("templateTAILsqlite.html"));
	    viewer = viewerHEAD + 
		    "pdf_base64 = \"" + encodeFileToBase64Binary(new File("test.pdf")) + "\";\r\n" + 
		    "db_base64 = \"" + encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + 
		    "json_base64 = \"" + encodeFileToBase64Binary(new File("config.json")) + "\";\r\n" + 
		    viewerTAIL;
	    FileUtils.writeStringToFile(new File("out/web/viewerSqlite.html"), viewer);
	} catch (Exception e) {
	    e.printStackTrace();
	} 
	
	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("templateHEADalasql.html"));
	    String viewerTAIL = FileUtils.readFileToString(new File("templateTAILalasql.html"));
	    viewer = viewerHEAD + 
		    "pdf_base64 = \"" + encodeFileToBase64Binary(new File("test.pdf")) + "\";\r\n" + 
		    "db_base64 = \"" + encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + 
		    "json_base64 = \"" + encodeFileToBase64Binary(new File("config.json")) + "\";\r\n" + 
		    viewerTAIL;
	    FileUtils.writeStringToFile(new File("out/web/viewerAlasql.html"), viewer);
	} catch (Exception e) {
	    e.printStackTrace();
	} 
    }

}
