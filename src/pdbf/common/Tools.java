package pdbf.common;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.security.CodeSource;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

import pdbf.html.CompleteRun_HTML;
import pdbf.latex.LaTeX_Compiler;

public class Tools {

    public static Charset utf8 = Charset.forName("UTF-8");

    public static String getOS() {
	String OS = System.getProperty("os.name").toLowerCase();
	
	if (OS.contains("win")) {
	    return "win";
	} else if (OS.contains("mac")) {
	    return "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    return "unix";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(-1);
	    return null;
	}
    }
    
    public static String encodeFileToBase64Binary(File file) {
	String encodedfile = null;
	try {
	    byte[] bytes = FileUtils.readFileToByteArray(file);
	    encodedfile = Base64.encodeBase64String(bytes);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	return encodedfile;
    }

    public static String encodeStringToBase64Binary(String string) throws UnsupportedEncodingException {
	return Base64.encodeBase64String(string.getBytes(utf8));
    }

    public static String escapeSpecialChars(File file) throws IOException {
	String tmp = FileUtils.readFileToString(file);
	tmp = tmp.replace("\\", "\\\\");
	tmp = tmp.replace("\"", "\\\"");
	return tmp;
    }

    public static String getBaseDir() {
	String tmp = null;
	
	try {
	    CodeSource codeSource = CompleteRun_HTML.class.getProtectionDomain().getCodeSource();
	    File jarFile = new File(codeSource.getLocation().toURI().getPath());
	    tmp = jarFile.getParentFile().getPath() + File.separator;
	} catch (URISyntaxException e) {
	    e.printStackTrace();
	    System.exit(-1);
	}
	return tmp;
    }

    public static String getBaseDirData() {
	String tmp = getBaseDir() + "data" + File.separator;
	return tmp;
    }
}
