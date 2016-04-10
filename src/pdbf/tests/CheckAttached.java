package pdbf.tests;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;

import pdbf.compilers.VM_TAR_Compiler;

public class CheckAttached {

    public static void main(String[] args) {
	if (checkAttached(new File(args[0]))) {
	    String start = "";
	    try {
		FileInputStream fis = new FileInputStream(new File(args[0]));
		byte[] b = new byte[512];
		fis.read(b, 0, b.length);
		start = new String(b, StandardCharsets.ISO_8859_1);
		fis.close();
	    } catch (Exception e) {
		e.printStackTrace();
		System.exit(1);
	    }
	    int len = "%PDF-1.5\n%ª«¬­.ovf\0".length();
	    if (start.substring(0, len).equals(VM_TAR_Compiler.ova_Header.substring(0, len))) {
		System.out.println("This file has an ova file attached");
	    } else {
		System.out.println("This file has an tar file attached");
	    }
	} else {
	    System.out.println("This file doesnt have an ova or tar file attached");
	}
    }

    public static boolean checkAttached(File file) {
	if (!file.exists()) {
	    System.err.println("File does not exist!");
	    System.exit(1);
	}
	try {
	    TarArchiveInputStream tis = new TarArchiveInputStream(new FileInputStream(file));
	    while (tis.getNextEntry() != null) {
		byte data[] = new byte[8192];
		while (tis.read(data) != -1) {
		    // Do nothing
		}
	    }
	    tis.close();
	    return true;
	} catch (Throwable e) {
	    return false;
	}
    }

}
