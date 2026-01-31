package com.example.somatekbackend.exception;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException {
  private final Object[] args;

  public ResourceNotFoundException(String message) {
    super(message);
    this.args = null;
  }

  public ResourceNotFoundException(String message, Object[] args) {
    super(message);
    this.args = args;
  }

  public ResourceNotFoundException(Exception ex) {
    super(ex);
    this.args = null;
  }

  public ResourceNotFoundException(Exception ex, String message) {
    super(message, ex);
    this.args = null;
  }
}
