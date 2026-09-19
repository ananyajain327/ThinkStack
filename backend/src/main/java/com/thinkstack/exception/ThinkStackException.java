package com.thinkstack.exception;

public class ThinkStackException extends RuntimeException {

    private final String errorCode;

    public ThinkStackException(String message) {
        super(message);
        this.errorCode = "INTERNAL_ERROR";
    }

    public ThinkStackException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ThinkStackException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "INTERNAL_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
