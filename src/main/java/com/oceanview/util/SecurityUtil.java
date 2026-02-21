package com.oceanview.util;

import  java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class SecurityUtil {

    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(password.getBytes());
            byte[] bytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 Algorithm not found", e);
        }
    }
}
