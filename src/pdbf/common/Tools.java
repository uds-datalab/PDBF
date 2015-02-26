package pdbf.common;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

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

}
