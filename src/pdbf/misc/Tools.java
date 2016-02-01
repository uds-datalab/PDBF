package pdbf.misc;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.CodeSource;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterOutputStream;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;

import pdbf.PDBF_Compiler;

/*
 * Useful functions
 */
public class Tools {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static Charset utf8 = Charset.forName("UTF-8");

    public static String baseDir = new File(getBaseDir()).getParent() + File.separator;
    public static String refDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = getOS();

    public static ArrayList<File> deleteList = new ArrayList<File>();
    public static ArrayList<Process> processes = new ArrayList<Process>();

    /*
     * Helper function of fixXref. Skips all \n and \r characters in a
     * stringbuilder either in forward or backward direction
     */
    public static int skipNewline(StringBuilder sb, int i, boolean forward) {
	if (i == -1) {
	    return -1;
	}
	if (!forward) {
	    --i;
	}
	while (sb.charAt(i) == '\n' || sb.charAt(i) == '\r') {
	    i = forward ? i + 1 : i - 1;
	}
	return forward ? i : i + 1;
    }

    /*
     * Check if operating system is supported and return corresponding short
     * name of the OS
     */
    public static String getOS() {
	String OS = System.getProperty("os.name").toLowerCase();
	if (OS.contains("win")) {
	    return "win";
	} else if (OS.contains("mac")) {
	    return "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    return "unix";
	} else if (OS.contains("bsd")) {
	    return "bsd";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(1);
	    return null;
	}
    }

    /*
     * Converts a file to a base64 encoded string
     */
    public static String encodeFileToBase64Binary(File file) {
	String encodedfile = null;
	try {
	    byte[] bytes = FileUtils.readFileToByteArray(file);
	    encodedfile = Base64.encodeBase64String(bytes);
	} catch (Exception e) {
	    e.printStackTrace();
	    System.exit(1);
	}
	return encodedfile;
    }

    /*
     * Converts a string to a base64 encoded string
     */
    public static String encodeStringToBase64Binary(String string) throws UnsupportedEncodingException {
	return Base64.encodeBase64String(string.getBytes(utf8));
    }

    /*
     * Reads a file and escapes \ to \\ and then " to \"
     */
    // TODO: check if this function is needed
    public static String escapeSpecialChars(File file) throws IOException {
	String tmp = FileUtils.readFileToString(file);
	tmp = tmp.replace("\\", "\\\\");
	tmp = tmp.replace("\"", "\\\"");
	return tmp;
    }

    /*
     * Returns the directory in which pdbf.jar resides
     */
    public static String getBaseDir() {
	String tmp = null;

	try {
	    CodeSource codeSource = PDBF_Compiler.class.getProtectionDomain().getCodeSource();
	    File jarFile = new File(codeSource.getLocation().toURI().getPath());
	    tmp = jarFile.getParentFile().getPath() + File.separator;
	} catch (URISyntaxException e) {
	    e.printStackTrace();
	    System.exit(1);
	}
	return tmp;
    }

    /*
     * Returns the directory in which javascript files for PDBF files reside
     * (data/)
     */
    public static String getBaseDirData() {
	String tmp = getBaseDir() + "data" + File.separator;
	return tmp;
    }

    /*
     * Run a javascript file with phantomjs
     */
    public static void runJsFile(String jsName, String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
	String phantomjs = baseDir + "external-tools" + File.separator + "phantomjs-" + suffix;
	String script = testDir + jsName;
	boolean delete = true;

	File destFile = new File(workingDir + File.separator + htmlName);
	try {
	    FileUtils.copyFile(new File(htmlDir + htmlName), destFile);
	} catch (Exception e) {
	    delete = false;
	}
	ProcessBuilder pb = new ProcessBuilder(phantomjs, script, htmlName, workingDir);
	pb.directory(new File(workingDir));
	pb.inheritIO();
	Process p = pb.start();

	Tools.processes.add(p);
	if (delete) {
	    Tools.deleteList.add(destFile);
	}
    }

    /*
     * Repairs the XREF table of our polyglot PDBF file
     */
    public static void fixXref(StringBuilder sb, int offset) throws IOException {
	int b, e;
	int start;
	int end;
	if ((start = e = sb.lastIndexOf("/Type /XRef")) != -1) {
	    end = sb.indexOf("endstream", start) + "endstream".length();
	    // xref stream
	    //TODO: If the first element is zero, the type field shall not be present, and shall default to type 1.
	    Pattern p = Pattern.compile("/W \\[(\\d+) (\\d+) (\\d+)\\]");
	    Matcher m = p.matcher(sb.toString()).region(start, end);
	    m.find();
	    int f1Len = Integer.parseInt(m.group(1));
	    int f2Len = Integer.parseInt(m.group(2));
	    int f3Len = Integer.parseInt(m.group(3));
	    int newlength = 8;
	    sb.replace(m.start(1), m.end(3), "" + newlength + " " + newlength + " " + newlength);
	    b = skipNewline(sb, sb.indexOf("stream", start) + "stream".length(), true);
	    e = skipNewline(sb, sb.indexOf("endstream", start), false);
	    int from = b;
	    int to = e;
	    ByteArrayOutputStream baos = new ByteArrayOutputStream();
	    InflaterOutputStream ios = new InflaterOutputStream(baos);
	    ios.write(sb.substring(b, e).getBytes(StandardCharsets.ISO_8859_1));
	    ios.close();
	    baos.close();
	    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());

	    ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
	    DeflaterOutputStream dos = new DeflaterOutputStream(baos2, new Deflater(7, false));

	    ByteBuffer bb = ByteBuffer.allocate(newlength);
	    while (bais.available() > 0) {
		for (int i = 0; i < newlength; ++i) {
		    if (i >= newlength - f1Len) {
			bb.put((byte) bais.read());
		    } else {
			bb.put((byte) 0);
		    }
		}
		bb.rewind();
		long bd1 = bb.getLong();
		dos.write(bb.array(), 0, newlength);
		bb.clear();
		for (int i = 0; i < newlength; ++i) {
		    if (i >= newlength - f2Len) {
			bb.put((byte) bais.read());
		    } else {
			bb.put((byte) 0);
		    }
		}
		bb.rewind();
		long bd2 = bb.getLong();
		if (bd1 == 1) {
		    bd2 += offset;
		    bb.clear();
		    bb.putLong(bd2);
		}
		dos.write(bb.array(), 0, newlength);
		bb.clear();
		for (int i = 0; i < newlength; ++i) {
		    if (i >= newlength - f3Len) {
			bb.put((byte) bais.read());
		    } else {
			bb.put((byte) 0);
		    }
		}
		dos.write(bb.array(), 0, newlength);
		bb.clear();
	    }
	    baos.close();
	    dos.close();
	    String newxref = baos2.toString("ISO_8859_1");
	    sb.replace(from, to, newxref);
	    p = Pattern.compile("/Length (\\d+)");
	    m = p.matcher(sb.toString()).region(start, end);
	    m.find();
	    sb.replace(m.start(1), m.end(1), Integer.toString(newxref.length()));
	}
	Pattern p = Pattern.compile("(\r\n?|\n)xref(\r\n?|\n)");
	Matcher m = p.matcher(sb.toString());
	if (m.find()) {
	    // xref table
	    b = m.end();
	    int x;
	    // skip first entry
	    p = Pattern.compile("\\d{10,10}");
	    m = p.matcher(sb.toString()).region(b + 1, sb.length());
	    m.find();
	    e = m.end();
	    while (m.find()) {
		b = m.start(0);
		e = m.end(0);
		String tmp = sb.substring(b, e);
		x = Integer.parseInt(tmp);
		sb.replace(b, e, df.format(x + offset));
	    }
	}
	b = sb.lastIndexOf("startxref\n") + "startxref\n".length();
	e = sb.indexOf("\n", b);
	sb.replace(b, e, "" + (Integer.parseInt(sb.substring(b, e)) + offset));
    }
}
