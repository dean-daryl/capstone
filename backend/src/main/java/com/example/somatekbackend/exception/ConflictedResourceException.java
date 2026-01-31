package com.example.somatekbackend.exception;


public class ConflictedResourceException extends RuntimeException {

  public ConflictedResourceException(String message) {
    super(message);
  }

  public ConflictedResourceException(Exception ex) {
    super(ex);
  }

  public ConflictedResourceException(Exception ex, String message) {
    super(message, ex);
  }
}
