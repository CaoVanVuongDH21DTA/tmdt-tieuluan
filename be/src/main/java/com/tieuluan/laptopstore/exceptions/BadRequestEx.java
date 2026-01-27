package com.tieuluan.laptopstore.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestEx extends RuntimeException {
    public BadRequestEx(String message) {
        super(message);
    }

    public BadRequestEx(String message, Throwable cause) {
        super(message, cause);
    }
}