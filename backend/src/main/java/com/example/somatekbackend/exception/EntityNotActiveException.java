package com.example.somatekbackend.exception;

public class EntityNotActiveException extends RuntimeException {
  public EntityNotActiveException(String message) {
    super(message);
  }

  public EntityNotActiveException(Exception ex) {
    super(ex);
  }

  public EntityNotActiveException(Exception ex, String message) {
    super(message, ex);
  }
}
