package com.MyWebpage.register.login.support;

public class GuestSupportLimitExceededException extends RuntimeException {

    public static final String MESSAGE = "Request limit reached. Please register to continue.";

    public GuestSupportLimitExceededException() {
        super(MESSAGE);
    }
}
