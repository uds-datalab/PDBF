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
    public static String refDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = Tools.getOS();
    
    public static void main(String[] args) throws InterruptedException, IOException {
	String[] documents = { "pdbf-doc", "minimal", "no_pdbf" };
	String[] documentsDir = { baseDir, baseDir, testDir };

	for (int i = 0; i < documents.length; i++) {
	    CompileAndCheckIT.compile(documentsDir[i], documents[i] + ".tex");
	    getReferencePicturesPages(documentsDir[i], documents[i] + ".html", refDir);
	    getReferencePicturesOverlays(documentsDir[i], documents[i] + ".html", refDir);
	}
	for (Process p : processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException("Child process returned error!");
	    }
	}
	for (File f : deleteList) {
	    f.delete();
	}
	new File(testDir + "no_pdbf.aux").delete();
	new File(testDir + "no_pdbf.log").delete();
	new File(testDir + "no_pdbf.html").delete();
    }

    public static void getReferencePicturesPages(String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
	getReferencePictures("capturePages.js", htmlDir, htmlName, workingDir);
    }
    
    public static void getReferencePicturesOverlays(String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
	getReferencePictures("captureOverlays.js", htmlDir, htmlName, workingDir);
    }
    
    public static void getReferencePictures(String jsName, String htmlDir, String htmlName, String workingDir) throws IOException, InterruptedException {
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

	processes.add(p);
	if (delete) {
	    deleteList.add(destFile);
	}
    }
}
