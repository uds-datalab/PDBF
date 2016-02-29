package pdbf.tests;

import java.io.File;
import java.io.FileInputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;

public class CheckAttached {

    public static void main(String[] args) {
	if (checkAttached(new File(args[0]))) {
	    System.out.println("This file has an ova or tar file attached");
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
