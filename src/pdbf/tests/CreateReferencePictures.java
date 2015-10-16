package pdbf.tests;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class CreateReferencePictures {

    public static ArrayList<File> deleteList = new ArrayList<File>();
    public static ArrayList<Process> processes = new ArrayList<Process>();
    public static String baseDir = new File(Tools.getBaseDir()).getParent() + File.separator;
    public static String wDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;

    public static void main(String[] args) throws InterruptedException, IOException {
	String[] documents = { "pdbf-doc", "minimal", "no_pdbf" };
	String[] documentsDir = { baseDir, baseDir, "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator };

	for (int i = 0; i < documents.length; i++) {
	    CompileAndCheckIT.compile(documentsDir[i], documents[i] + ".tex");
	    getReferencePictures(documentsDir[i], documents[i] + ".html", wDir);
	}
	for (Process p : processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException();
	    }
	}
	for (File f : deleteList) {
	    f.delete();
	}
    }

    public static void getReferencePictures(String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
	String baseDir = new File(Tools.getBaseDir()).getParent() + File.separator;
	String suffix = Tools.getOS();
	String phantomjs = baseDir + "external-tools" + File.separator + "phantomjs-" + suffix;
	String script = baseDir + "external-tools" + File.separator + "capturePDF.js";

	File destFile = new File(workingDir + File.separator + htmlName);
	try {
	    FileUtils.copyFile(new File(htmlDir + htmlName), destFile);
	} catch (Exception e) {
	    //Do nothing
	}
	ProcessBuilder pb = new ProcessBuilder(phantomjs, script, htmlName, workingDir);
	pb.directory(new File(workingDir));
	pb.inheritIO();
	Process p = pb.start();

	processes.add(p);
	deleteList.add(destFile);
    }
}
