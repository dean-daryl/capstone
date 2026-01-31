package com.example.somatekbackend.exception;

public class ExtractProcessorException extends Exception {

  /** */
  private static final long serialVersionUID = 1L;

  public ExtractProcessorException(String message) {
    super(message);
  }

  public ExtractProcessorException(String message, Exception e) {
    super(message, e);
  }

  public ExtractProcessorException() {
    super();
  }
}
