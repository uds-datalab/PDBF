package pdbf.common;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

import pdbf.html.CompleteRun_HTML;

public class Tools {

    public static Charset utf8 = Charset.forName("UTF-8");

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
	String className = CompleteRun_HTML.class.getName().replace('.', '/');
	String classJar = CompleteRun_HTML.class.getClass().getResource("/" + className + ".class").toString();
	String tmp = null;
	
	try {
	    tmp = ClassLoader.getSystemClassLoader().getResource(".").toURI().getPath();
	} catch (URISyntaxException e) {
	    e.printStackTrace();
	    System.exit(-1);
	}
	
	//check if we are running from jar or classfiles
	if (classJar.startsWith("jar:")) {
	    //jar
	    tmp = new File(tmp).getAbsoluteFile().getPath() + File.separator;
	} else {
	    //classfiles
	    tmp = new File(tmp).getAbsoluteFile().getParentFile().getPath() + File.separator;
	}
	return tmp;
    }

    public static String getBaseDirData() {
	String tmp = getBaseDir() + "data" + File.separator;
	return tmp;
    }
}
