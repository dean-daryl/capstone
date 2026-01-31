package com.example.somatekbackend.exception;


public class ResourceExistsException extends RuntimeException {

  public ResourceExistsException(String message) {
    super(message);
  }

  public ResourceExistsException(Exception ex) {
    super(ex);
  }

  public ResourceExistsException(Exception ex, String message) {
    super(message, ex);
  }
}
